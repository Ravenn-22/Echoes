const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique:true ,
        trim: true
    },
    email:{
         type: String,
        required: true,
        unique:true ,
        lowercase: true,
        trim: true
    },
    password: {
         type: String,
        required: true
    },
    profilePicture: {
         type: String,
         default: ''
    },
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpire:{
        type: Date
    },
    isPro:{
        type:Boolean,
        default:false
    },
    proExpiresAt:{
        type:Date,
        default:null
    }
},{timestamps: true} )

module.exports = mongoose.model('User', userSchema);