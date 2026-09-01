import User from "../modles/user.modle.js";
import bcrypt from 'bcrypt'

export const registerUser = async (req,res)=>{
    try {

        const {fullname,email,password,phone} = req.body

        if(!name || !email || !password || !phone){
            res.status(400).json({message:'All the fields are required'})
        }

        if(password.length<=6){
            res.status(400).json({message:'Password should be greater than six characters'})
        }

        const emailExist =await User.findOne({email})

        if(emailExist){
            return res.status(409).json({message:'User already exists'})
        }

        const hashedPassword =await bcrypt.hash(password,10)

        const newUser = User.create({
            fullname,
            email,
            phone,
            password:hashedPassword
        })

        return res.status(200).json({message:'User Registered', user:'newUser'})
        
    } catch (error) {
        return res.status(500).json({message:'Server crashed', error: error.message})
    }
}