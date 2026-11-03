import express from "express"
import { register, login, logout, refresh } from "../controllers/auth.controller.js"
import { uploadReel } from "../controllers/reel.controller.js"
import validate from "../middlewares/validation.js"
import { registerFormSchema, loginFormSchema } from "../validation/userValidation.js"
import { auth } from "../middlewares/auth.js"
import { uploadSingleVideo } from "../utils/reelUpload.js"

const route = express.Router()

route.post("/register", validate(registerFormSchema, "body"), register)
route.post("/login", validate(loginFormSchema, "body"), login)
route.post("/refresh", refresh)

route.use(auth)
route.post("/logout", logout)
route.post("/reels/upload", uploadSingleVideo, uploadReel)

export default route