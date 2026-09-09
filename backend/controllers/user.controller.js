import User from "../modles/user.modle.js";
import bcrypt from 'bcrypt'
import genToken from "../utils/generateToken.js";

const cookieOptions = {
    httpOnly: true
}

export const registerUser = async (req, res) => {
    try {

        const { fullname, email, password, phone } = req.body

        if (!fullname || !email || !password || !phone) {
            res.status(400).json({ message: 'All the fields are required' })
        }

        if (password.length <= 6) {
            res.status(400).json({ message: 'Password should be greater than six characters' })
        }

        const emailExist = await User.findOne({ email })

        if (emailExist) {
            return res.status(409).json({ message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            fullname,
            email,
            phone,
            password: hashedPassword
        })

        const token = genToken(newUser._id)
        res.cookie('token', token, cookieOptions)
        console.log(process.env.jwt_secret)
        return res.status(200).json({ message: 'User Registered', user: newUser })


    } catch (error) {
        return res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}

export const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body



        if (!email || !password) {
            res.status(400).json({ message: 'All the fields are required' })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }

        const passwordMatched = await bcrypt.compare(password, user.password)

        if (!passwordMatched) {
            return res.status(401).json({ message: 'Password did not match' })
        }

        const token = genToken(user._id)
        res.cookie("token", token, cookieOptions)

        res.status(200).json({
            "success": true,
            "message": "Login successful"
        })
    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })

    }

}

export const getMe = (req, res) => {

    const authenticatedUser = req.user
    res.status(200).json({ authenticatedUser })
}

export const logoutUser = (req,res)=>{
    res.clearCookies("token", cookieOptions)

    return res.status(200).json({
        "success": true,
        "message": "Logged out successfully"
    })
}

export const changePassword = async(req,res)=>{

    try {
        const{oldPassword, newPassword} = req.body;

    const user = req.user

    if(!user){
        return res.status(404).json({
                message: "User not found"
            });
    }

    const match = await bcrypt.compare(oldPassword, user.password)

    if(!match){
         return res.status(400).json({
                message: "Old password is incorrect"
            });
    }

    const hashedPassword = await bcrypt.hash(newPassword,10)

    user.password = hashedPassword

    await user.save()
            return res.status(200).json({
            message: "Password changed successfully"
    });


    } catch (error) {
         return res.status(500).json({
            message: "Something went wrong"
        });
    }

    

}