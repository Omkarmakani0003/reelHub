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

const FEED_CACHE_TTL = 60
const REEL_CACHE_TTL = 300
const WATCHED_REELS_TTL = 86400

const cacheKey = (prefix, ...parts) => [prefix, ...parts].filter(Boolean).join(':')

const getCachedData = async (key) => {
  const value = await redisConnection.get(key)

  if (!value) return null

  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

const setCachedData = async (key, value, ttl = FEED_CACHE_TTL) => {
  await redisConnection.set(key, JSON.stringify(value), 'EX', ttl)
}

const deleteCachedData = async (...keys) => {
  if (!keys.length) return
  await redisConnection.del(...keys)
}

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

  await deleteCachedData('reels:feed')

  return res.status(202).json(
    new apiResponse(202, 'Reel upload accepted and is being processed', { reel })
  )
})

export const getReels = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(9, Math.max(1, Number(req.query.limit) || 9))

  const cacheKeyValue = cacheKey('reels:feed', page, limit)
  const cachedReels = await getCachedData(cacheKeyValue)

  if (cachedReels) {
    return res.status(200).json(
      new apiResponse(200, 'Reels fetched successfully', cachedReels)
    )
  }

  const skip = (page - 1) * limit

  const [totalReels, reels] = await Promise.all([
    Reel.countDocuments({ status: 'ready' }),
    Reel.find({ status: 'ready' })
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
  ])

  const totalPages = totalReels === 0 ? 0 : Math.ceil(totalReels / limit)

  const response = {
    reels,
    pagination: {
      page,
      limit,
      totalReels,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  }

  await setCachedData(cacheKeyValue, response, FEED_CACHE_TTL)

  return res.status(200).json(
    new apiResponse(200, 'Reels fetched successfully', response)
  )
})

export const getReelById = asyncHandler(async (req, res) => {
  const { reelId } = req.params

  if (!reelId) {
    throw new apiError(400, 'Reel id is required')
  }

  const key = cacheKey('reel', reelId)
  const cachedReel = await getCachedData(key)

  if (cachedReel) {
    return res.status(200).json(
      new apiResponse(200, 'Reel fetched successfully', { reel: cachedReel })
    )
  }

  const reel = await Reel.findById(reelId).populate('user', 'username email').lean()

  if (!reel) {
    throw new apiError(404, 'Reel not found')
  }

  await setCachedData(key, reel, REEL_CACHE_TTL)

  return res.status(200).json(
    new apiResponse(200, 'Reel fetched successfully', { reel })
  )
})

export const markReelAsWatched = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id
  const { reelId } = req.params

  if (!userId) {
    throw new apiError(401, 'User not authenticated')
  }

  if (!reelId) {
    throw new apiError(400, 'Reel id is required')
  }

  const watchedKey = cacheKey('watched:reels', userId.toString())
  await redisConnection.sadd(watchedKey, reelId)
  await redisConnection.expire(watchedKey, WATCHED_REELS_TTL)

  return res.status(200).json(
    new apiResponse(200, 'Reel marked as watched', { reelId })
  )
})

export const getWatchedReels = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id

  if (!userId) {
    throw new apiError(401, 'User not authenticated')
  }

  const watchedKey = cacheKey('watched:reels', userId.toString())
  const watchedReels = await redisConnection.smembers(watchedKey)

  return res.status(200).json(
    new apiResponse(200, 'Watched reels fetched successfully', { reels: watchedReels })
  )
})