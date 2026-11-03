import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema(
    {
        refreshToken: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        is_used: {
            type: Boolean,
            required: true,
            default: false
        },
        is_revoke: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
export default RefreshToken;