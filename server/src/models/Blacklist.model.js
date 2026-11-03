import mongoose from "mongoose";

const BlackListTokenSchema = new mongoose.Schema(
    {  
        refreshToken :{
            type: String,
            required: true,
        },
        accessToken :{
            type: String,
            required: true,
        },
    },
    {
        timestamps:true
    }
);

const BlackListToken = mongoose.model("BlackList",BlackListTokenSchema)
export default BlackListToken 