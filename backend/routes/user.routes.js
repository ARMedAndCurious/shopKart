import express from 'express'
import { changePassword, getMe, loginUser, logoutUser, registerUser } from '../controllers/user.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

const userRoutes = express.Router()

userRoutes.post('/register', registerUser)
userRoutes.post('/login', loginUser)
userRoutes.get('/me', isAuthenticated, getMe)
userRoutes.post('/logout', logoutUser)
userRoutes.patch('/changePassword',isAuthenticated, changePassword)

export default userRoutes