import app from './src/app.js'
import connection from './src/config/connection.js'

(()=>{
    try {
        connection()
        app.listen(process.env.PORT || 5000 ,()=>{ 
        console.log(`Server is running on port ${process.env.PORT || 5000}`)
        }) 
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
})()

