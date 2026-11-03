import mongoose from 'mongoose'
import asyncHandler from '../utils/asyncHandler.js'
import {DBURL} from './config.js'

const connection = asyncHandler(()=>{
    mongoose.connect(DBURL)
    .then(()=>{console.log('Database connection succesfully')})
    .catch(()=>{ console.log('Database connection faild') })
})

export default connection

