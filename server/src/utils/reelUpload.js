import multer from 'multer'
import apiError from './apiError.js'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('video/')) {
    return cb(new apiError(400, 'Only video files are allowed'))
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
    return cb(new apiError(400, 'Unsupported video format. Use MP4, MOV, WEBM, MKV, 3GP or 3G2'))
  }

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 1,
    fileSize: 200 * 1024 * 1024
  }
})

export const uploadSingleVideo = upload.single('video')
