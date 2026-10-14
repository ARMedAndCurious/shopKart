import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({

    fullname :{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true,
        unique : true
    },

    password:{
        type: String,
        required: true
    },

    phone : {
        type: String,
        required: true
    },

    wishlist: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }
    ],

    createdAt : {
        type: Date,
        default: Date.now
    },

    cart: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }
],
default: []

},{ timestamps: true })

const User = mongoose.model('User', userSchema)
export default User