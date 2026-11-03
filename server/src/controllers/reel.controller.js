import cloudinary from '../config/cloudinary.js'
import Reel from '../models/Reel.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import apiError from '../utils/apiError.js'
import apiResponse from '../utils/apiResponse.js'
import { createReelSchema } from '../validation/reelValidation.js'

const MAX_REEL_DURATION = 60

export const uploadReel = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new apiError(400, 'Video file is required')
  }

  const parsedBody = createReelSchema.parse({
    ...req.body,
    video: req.file
  })

  if (!req.file.mimetype.startsWith('video/')) {
    throw new apiError(400, 'Only video files are allowed')
  }

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'reels',
        quality: 'auto:good',
        format: 'mp4',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
          { duration: '60' }
        ],
        chunk_size: 6000000
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }

        resolve(result)
      }
    )

    uploadStream.end(req.file.buffer)
  })

  const duration = Number(uploadResult?.duration || 0)

  if (duration > MAX_REEL_DURATION) {
    await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'video' }).catch(() => {})
    throw new apiError(400, 'Could not compress video to the required 1 minute limit. Please upload a shorter video.')
  }

  const reel = await Reel.create({
    user: req.user._id,
    description: parsedBody.description,
    videoUrl: uploadResult.secure_url,
    thumbnailUrl: uploadResult.thumbnail_url || '',
    cloudinaryPublicId: uploadResult.public_id,
    duration,
    fileSize: req.file.size,
    mimeType: req.file.mimetype
  })

  return res.status(201).json(
    new apiResponse(201, 'Reel uploaded successfully', {
      reel
    })
  )
})
