import { z } from 'zod'

const videoFileSchema = z.any().refine((value) => {
  if (!value || typeof value !== 'object') return false
  if (typeof value.mimetype !== 'string' || !value.mimetype.startsWith('video/')) return false
  return typeof value.size === 'number' && value.size > 0
}, {
  message: 'Video file is required and must be a valid video file'
})

export const createReelSchema = z.object({
  description: z
    .string()
    .trim()
    .max(200, 'Description cannot exceed 200 characters')
    .optional()
    .default(''),

  video: videoFileSchema.optional()
})
