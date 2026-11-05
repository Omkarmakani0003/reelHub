import mongoose from 'mongoose'
import User from '../models/User.model.js'
import Reel from '../models/Reel.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import apiError from '../utils/apiError.js'
import apiResponse from '../utils/apiResponse.js'

const getProfileData = async (userIdentifier, query = {}) => {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(9, Math.max(1, Number(query.limit) || 9))
    const skip = (page - 1) * limit

    let user

    if (mongoose.isValidObjectId(userIdentifier)) {
        user = await User.findById(userIdentifier)
    } else {
        user = await User.findOne({ username: userIdentifier })
    }

    if (!user) {
        throw new apiError(404, 'User not found')
    }

    const [videos, totalVideos] = await Promise.all([
        Reel.find({ user: user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Reel.countDocuments({ user: user._id })
    ])

    const safeUser = user.toObject()
    delete safeUser.password

    const totalPages = Math.ceil(totalVideos / limit)

    return {
        user: safeUser,
        videos,
        pagination: {
            page,
            limit,
            totalVideos,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    }
}

export const getMe = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id

    if (!userId) {
        throw new apiError(401, 'User not authenticated')
    }

    const profile = await getProfileData(userId, req.query)

    return res.status(200).json(
        new apiResponse(200, 'User profile fetched successfully', profile)
    )
})

export const getUserProfile = asyncHandler(async (req, res) => {
    const { identifier } = req.params

    if (!identifier) {
        throw new apiError(400, 'User identifier is required')
    }

    const profile = await getProfileData(identifier, req.query)

    return res.status(200).json(
        new apiResponse(200, 'User profile fetched successfully', profile)
    )
})