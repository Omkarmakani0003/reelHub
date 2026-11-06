import { Queue } from 'bullmq'
import redisConnection from '../config/redis.js'

export const reelUploadQueue = new Queue('reel-uploads', {
  connection: redisConnection
})

export const enqueueReelUpload = async ({ localPath, reelId, userId }) => {
  if (!localPath || !reelId) {
    throw new Error('Missing required data for reel upload job')
  }

  await reelUploadQueue.add(
    'process-reel-upload',
    {
      localPath,
      reelId,
      userId: userId?.toString?.() || userId
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
}
