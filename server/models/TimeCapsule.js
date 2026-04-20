const mongoose = require('mongoose');

const timeCapsuleSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true,
        trim: true
    },
    message:{
        type: String,
        required: true
    },
    images:[{
        type: String
    }],
    scrapbook:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    unlockDate:{
        type: Date,
        required: true

    },
    isUnlocked:{
        type: Boolean,
        default: false
    },
    type:{
        type: String,
        enum: ['capsule', 'letter'],
        default: "capsule"
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
},{timestamps: true })

module.exports = mongoose.model('TimeCapsule', timeCapsuleSchema)