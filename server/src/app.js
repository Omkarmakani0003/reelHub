import express from 'express'
import globleErrorHandler from './utils/globleErrorHandler.js'
import userRoute from './routes/user.route.js'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/api/v1',userRoute)

app.get('/health',(req,res)=>{
    return res.send('application is working')
})

app.use((req,res,next)=>{
    throw new Error('404 Page not found')
})

app.use(globleErrorHandler)

export default app