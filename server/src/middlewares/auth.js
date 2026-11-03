import jwt from "jsonwebtoken";
import BlackListToken from "../models/Blacklist.model.js";
import { JWT_ACCESS_TOKEN_SECRET } from "../config/config.js";
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const auth = asyncHandler(async (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
        throw new apiError(401, "Unauthorized");
    }

    const isBlacklisted = await BlackListToken.findOne({ accessToken: token });

    if (isBlacklisted) {
        throw new apiError(401, "Unauthorized");
    }

    try {
        const decoded = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new apiError(401, "Token expired or invalid");
    }
});
