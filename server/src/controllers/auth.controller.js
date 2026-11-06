import User from "../models/User.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";
import { ClearRefreshCookie, StoreRefreshCookie } from "../utils/cookie.js";
import BlackListToken from "../models/Blacklist.model.js";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_TOKEN_SECRET, JWT_ACCESS_TOKEN_SECRET } from "../config/config.js";

const generateTokens = async (res, user) => {
    const accessToken = await generateAccessToken(user._id, user.username);
    const refreshToken = await generateRefreshToken(user._id);

    await RefreshToken.findOneAndUpdate(
        {
            user_id: user._id
        },
        {
            refreshToken,
            user_id: user._id,
            is_used: false,
            is_revoke: false
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );

    StoreRefreshCookie(res, refreshToken);

    return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const isExistUser = await User.findOne({ email });

    if (isExistUser) {
        throw new apiError(409, "Email is already registered");
    }

    const user = await User.create({
        username,
        email,
        password
    });

    const registeredUser = user.toObject();
    delete registeredUser.password;

    return res.status(201).json(new apiResponse(201, 'User registered successfully', { user: registeredUser }));
});

export const login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    const user = await User.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    }).select('+password');

    if (!user) {
        throw new apiError(404, "Invalid email/username or password");
    }

    const passwordVerify = await user.checkPassword(password);

    if (!passwordVerify) {
        throw new apiError(401, "Invalid email/username or password");
    }

    const { accessToken, refreshToken } = await generateTokens(res, user);

    const loggedInUser = user.toObject();
    delete loggedInUser.password;

    return res.status(200).json(new apiResponse(200, 'User login successfully', {
        user: loggedInUser,
        accessToken,
        refreshToken
    }));
});

export const refresh = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.REFRESH_TOKEN || req.body?.refreshToken;
    
    if (!incomingRefreshToken) {
        throw new apiError(401, "Refresh token is missing");
    }

    const blacklistedToken = await BlackListToken.findOne({
        refreshToken: incomingRefreshToken
    });

    if (blacklistedToken) {
        throw new apiError(401, "Refresh token has been revoked");
    }

    const decoded = jwt.verify(incomingRefreshToken, JWT_REFRESH_TOKEN_SECRET);

    const storedToken = await RefreshToken.findOne({
        user_id: decoded._id,
        refreshToken: incomingRefreshToken
    });

    if (!storedToken) {
        throw new apiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decoded._id);

    if (!user) {
        throw new apiError(404, "User not found");
    }

    const { accessToken, refreshToken } = await generateTokens(res, user);

    await RefreshToken.findOneAndUpdate(
        { user_id: user._id },
        {
            refreshToken: refreshToken,
            user_id: user._id,
            is_used: false,
            is_revoke: false
        },
        { new: true, upsert: true }
    );

    if (req.cookies?.REFRESH_TOKEN) {
        StoreRefreshCookie(res, refreshToken);
    }

    return res.status(200).json(new apiResponse(200, 'Token refreshed successfully', {
        accessToken,
        refreshToken: refreshToken
    }));
});

export const logout = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies?.REFRESH_TOKEN || req.body?.refreshToken;
    //const accessToken = req.header('Authorization')?.replace('Bearer ', '') || req.body?.accessToken;
 
    if (!refreshToken) throw new apiError(401, "Unauthorized");

    if (refreshToken) {
        await RefreshToken.findOneAndDelete({ refreshToken });
    }

    if (refreshToken) {
        await BlackListToken.findOneAndUpdate(
            {
                refreshToken: refreshToken  
            },
            {

                refreshToken: refreshToken
            },
            { upsert: true, new: true }
        );
    }

    ClearRefreshCookie(res);

    return res.status(200).json(new apiResponse(200, 'User logout successfully'));
});
