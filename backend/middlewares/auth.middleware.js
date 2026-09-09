import jwt from 'jsonwebtoken'
import User from '../modles/user.modle.js'

export const isAuthenticated = async(req, res, next)=>{

    try {
        const token = req.cookies.token 
        const decoded = jwt.verify(token, process.env.jwt_secret)

        const user = await User.findById(decoded.userId)

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user 
        next()
    } catch (error) {
        console.log(error)
         return res.status(401).json({
            message: "Not authenticated"
        });
    }
}