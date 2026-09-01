import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import dns from 'node:dns'
import userRoutes from './routes/user.routes.js'

dns.setServers([
  '8.8.8.8',
  '[2001:4860:4860::8888]',
  '8.8.8.8:1053',
  '[2001:4860:4860::8888]:1053',
]);


const app = express()
const Port = 8086

dotenv.config()

mongoose.connect(process.env.dbUrl).then(()=>{
    console.log("Db connected")
}).catch((err)=>{
    console.log(err)
})

app.use(express.json())
app.use('/users', userRoutes)

app.listen(Port,()=>{
    console.log(`Server Started at ${Port}`)
})