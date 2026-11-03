import mongoose from 'mongoose'

const reelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: ''
    },
    videoUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      max: 60
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const Reel = mongoose.model('Reel', reelSchema)

export default Reel
