import { Queue } from 'bullmq'
import redisConnection from '../config/redis.js'

export const FEED_CACHE_TTL = 60
export const REEL_CACHE_TTL = 300
export const WATCHED_REELS_TTL = 86400

export const cacheKey = (prefix, ...parts) => [prefix, ...parts].filter(Boolean).join(':')

export const getCachedData = async (key) => {
  const value = await redisConnection.get(key)

  if (!value) return null

  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

export const setCachedData = async (key, value, ttl = FEED_CACHE_TTL) => {
  await redisConnection.set(key, JSON.stringify(value), 'EX', ttl)
}

export const deleteCachedData = async (...keys) => {
  if (!keys.length) return
  await redisConnection.del(...keys)
}

export const reelUploadQueue = new Queue('reel-uploads', {
  connection: redisConnection
})

export const markReelAsWatched = async (userId, reelId) => {
  const watchedKey = cacheKey('watched:reels', userId.toString())
  await redisConnection.sadd(watchedKey, reelId)
  await redisConnection.expire(watchedKey, WATCHED_REELS_TTL)
  return { reelId }
}

export const getWatchedReelsForUser = async (userId) => {
  const watchedKey = cacheKey('watched:reels', userId.toString())
  return redisConnection.smembers(watchedKey)
}
