import express from 'express'
import { getMe, loginUser, registerUser } from '../controllers/user.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

const userRoutes = express.Router()

userRoutes.post('/register', registerUser)
userRoutes.post('/login', loginUser)
userRoutes.get('/me', isAuthenticated, getMe)

export default userRoutes