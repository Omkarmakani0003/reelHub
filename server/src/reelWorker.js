import 'dotenv/config'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import IORedis from 'ioredis'
import { Worker } from 'bullmq'
import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import Reel from './models/Reel.model.js'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, DBURL} from './config/config.js'

// Setup ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
})

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
})

await mongoose.connect(DBURL || 'mongodb://127.0.0.1:27017/reelnet')

// 1. Local compression & 60s trimming via FFmpeg
const compressVideoLocally = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(0)
      .setDuration(60) // Truncate to maximum 60 seconds
      .size('?x720')    // Max height 720p, aspect ratio automatic preserve
      .videoCodec('libx264')
      .videoBitrate('1200k') // High compression
      .fps(30)
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions([
        '-preset veryfast',
        '-movflags +faststart' // Web-optimized streaming
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run()
  })
}

// 2. Upload compressed file to Cloudinary
const uploadToCloudinary = (filePath) => {
  return cloudinary.uploader.upload(filePath, {
    resource_type: 'video',
    folder: 'instagram_reels'
  })
}

const worker = new Worker(
  'reel-uploads',
  async (job) => {
    const { localPath, reelId } = job.data

    if (!localPath || !reelId) {
      throw new Error('Missing required job data: localPath or reelId')
    }

    if (!fs.existsSync(localPath)) {
      throw new Error(`File not found at path: ${localPath}`)
    }

    const compressedPath = path.resolve(
      path.dirname(localPath),
      `compressed-${path.basename(localPath)}`
    )

    await Reel.findByIdAndUpdate(reelId, { status: 'processing' })

    try {
      // Step A: Compress on local disk first
      await compressVideoLocally(localPath, compressedPath)

      // Step B: Upload only the compressed file (size will now be ~8-12 MB)
      const result = await uploadToCloudinary(compressedPath)

      // Step C: Generate thumbnail
      const thumbnailUrl = cloudinary.url(result.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 720, crop: 'limit' },
          { start_offset: '1' }
        ],
        secure: true
      })

      // Step D: Update Database
      await Reel.findByIdAndUpdate(
        reelId,
        {
          videoUrl: result.secure_url,
          thumbnailUrl: thumbnailUrl,
          cloudinaryPublicId: result.public_id,
          duration: Math.round(result.duration || 0),
          fileSize: result.bytes || 0,
          status: 'ready'
        },
        { new: true }
      )

      // Step E: Clean up both local temp files
      if (fs.existsSync(localPath)) await fsPromises.unlink(localPath)
      if (fs.existsSync(compressedPath)) await fsPromises.unlink(compressedPath)

      console.log(`Uploaded successfully! Cloudinary storage used: ${(result.bytes / (1024 * 1024)).toFixed(2)} MB`)
      return result
    } catch (error) {
      const maxAttempts = job.opts.attempts || 1
      const isFinalAttempt = job.attemptsMade + 1 >= maxAttempts

      if (isFinalAttempt) {
        await Reel.findByIdAndUpdate(reelId, { status: 'failed' })
        if (fs.existsSync(localPath)) await fsPromises.unlink(localPath)
        if (fs.existsSync(compressedPath)) await fsPromises.unlink(compressedPath)
      }

      console.error(`Upload error on reel ${reelId}:`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 2
  }
)

worker.on('completed', (job) => console.log(`Job ${job.id} completed`))
worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err.message))

process.on('SIGINT', async () => {
  await worker.close()
  await redis.quit()
  await mongoose.disconnect()
  process.exit(0)
})