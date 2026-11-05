import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import Reel from '../models/Reel.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import apiError from '../utils/apiError.js'
import apiResponse from '../utils/apiResponse.js'


const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
})

export const reelUploadQueue = new Queue('reel-uploads', {
  connection: redisConnection
})

const tmpReelsDir = path.resolve(process.cwd(), 'tmp_reels')
if (!fs.existsSync(tmpReelsDir)) {
  fs.mkdirSync(tmpReelsDir, { recursive: true })
}

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('video/')) {
    return cb(new apiError(400, 'Only video files are allowed'), false)
  }

  const allowedMimeTypes = [
    'video/mp4',
    'video/mov',
    'video/quicktime',
    'video/webm',
    'video/x-matroska',
    'video/3gpp',
    'video/3gpp2'
  ]

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new apiError(400, 'Unsupported video format. Use MP4, MOV, WEBM, MKV, 3GP or 3G2'), false)
  }

  cb(null, true)
}

export const uploadSingleVideo = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, tmpReelsDir)
    },
    filename: (req, file, cb) => {
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname) || '.mp4'}`
      cb(null, safeName)
    }
  }),
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
}).single('video')

export const uploadReel = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new apiError(400, 'Video file is required')
  }

  const userId = req.user?._id || req.user?.id
  if (!userId) {
    // If auth fails after multer saves the file, delete it
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    throw new apiError(401, 'User not authenticated')
  }

  const reel = await Reel.create({
    user: userId,
    description: req.body?.description || '',
    videoUrl: '',
    thumbnailUrl: '',
    cloudinaryPublicId: '',
    duration: 0,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    status: 'pending'
  })

  await reelUploadQueue.add(
    'process-reel-upload',
    {
      localPath: path.resolve(req.file.path),
      reelId: reel._id.toString(),
      userId: userId.toString()
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  )

  return res.status(202).json(
    new apiResponse(202, 'Reel upload accepted and is being processed', { reel })
  )
})

export const getReels = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(9, Math.max(1, Number(req.query.limit) || 9))
  const skip = (page - 1) * limit

  const totalReels = await Reel.countDocuments()

  if (totalReels === 0) {
    return res.status(200).json(
      new apiResponse(200, 'No reels found', {
        reels: [],
        pagination: {
          page,
          limit,
          totalReels: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      })
    )
  }

  const randomReels = await Reel.aggregate([
    { $sample: { size: totalReels } }
  ])

  const reelIds = randomReels.map((reel) => reel._id)

  const reels = await Reel.find({ _id: { $in: reelIds } })
    .populate('user', 'username email')
    .lean()

  const shuffledOrder = new Map(
    randomReels.map((reel, index) => [reel._id.toString(), index])
  )

  reels.sort((a, b) => {
    return (shuffledOrder.get(a._id.toString()) ?? 0) - (shuffledOrder.get(b._id.toString()) ?? 0)
  })

  const paginatedReels = reels.slice(skip, skip + limit)
  const totalPages = Math.ceil(totalReels / limit)

  return res.status(200).json(
    new apiResponse(200, 'Reels fetched successfully', {
      reels: paginatedReels,
      pagination: {
        page,
        limit,
        totalReels,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })
  )
})

export const getReelById = asyncHandler(async (req, res) => {
  const { reelId } = req.params

  if (!reelId) {
    throw new apiError(400, 'Reel id is required')
  }

  const reel = await Reel.findById(reelId).populate('user', 'username email').lean()

  if (!reel) {
    throw new apiError(404, 'Reel not found')
  }

  return res.status(200).json(
    new apiResponse(200, 'Reel fetched successfully', { reel })
  )
})