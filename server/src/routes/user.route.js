import express from "express"
import { register, login, logout, refresh } from "../controllers/auth.controller.js"
import { uploadReel, uploadSingleVideo, getReels, getReelById } from "../controllers/reel.controller.js"
import { getMe, getUserProfile } from "../controllers/user.controller.js"
import validate from "../middlewares/validation.js"
import { registerFormSchema, loginFormSchema } from "../validation/userValidation.js"
import { auth } from "../middlewares/auth.js"

const route = express.Router()

route.post("/register", validate(registerFormSchema, "body"), register)
route.post("/login", validate(loginFormSchema, "body"), login)
route.post("/refresh", refresh)

route.get("/reels", getReels)
route.get("/reels/:reelId", getReelById)
route.get("/user/:identifier", getUserProfile)

route.use(auth)
route.get("/me", getMe)
route.post("/logout", logout)
route.post("/reels/upload", uploadSingleVideo, uploadReel)

export default route