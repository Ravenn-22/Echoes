const mongoose = require("mongoose");

const scrapbookSchema = new mongoose.Schema({
    title: {
         type: String,
        required: true,
        trim: true
    },
    description: {
         type: String,
       default: " "
    },
    coverImage: {
         type: String,
        default: ''
    },
    owner: {
         type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
        
    },
    members: [{
         type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPrivate: {
        type: Boolean,
        default: true
    }
}, {timestamps: true })


module.exports = mongoose.model("Scrapbook", scrapbookSchema)