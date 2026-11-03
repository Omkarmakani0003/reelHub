import jwt from 'jsonwebtoken'
import {
    JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_SECRET,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY
}
from '../config/config.js'

export const generateAccessToken = async (id,username)=>{
    try {

        const payload =  {
            _id : id,
            username: username
        }

        return  jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET,{
            expiresIn: JWT_ACCESS_TOKEN_EXPIRY
        });
        
    } catch (error) {
        throw new Error(`Token generation faild ${error.message}`)
    }
} 


export const generateRefreshToken = async (id)=>{
      try {

        const payload =  {
            _id : id,
        }

        return  jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET,{
            expiresIn: JWT_REFRESH_TOKEN_EXPIRY
        });
        
    } catch (error) {
        throw new Error(`Token generation faild ${error.message}`)
    }
} 

