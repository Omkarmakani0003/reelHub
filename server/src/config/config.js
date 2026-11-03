import "dotenv/config";

export const PORT = process.env.PORT || 8000

export const ENV = process.env.NODE_ENV

export const DBURL = process.env.DBURL || ""

export const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET

export const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET

export const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY

export const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY

export const REFRESH_COOKIE_MAX_AGE = process.env.REFRESH_COOKIE_MAX_AGE

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME

export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY

export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
