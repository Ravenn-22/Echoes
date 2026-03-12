const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
    title: {
         type: String,
        required: true,
        trim: true
    },
    description: {
         type: String,
       default: " "
    },
    image: {
         type: String,
        default: ''
    },
    date: {
         type: Date,
        default: Date.now
    
    },
    scrapbook: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Scrapbook',
        required: true
    },
    createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
        required: true
    }, 
    pinned:{
        type: Boolean,
        default: false
    },
}, {timestamps: true })


module.exports = mongoose.model("Memory", memorySchema)