const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.dbqd6mpgj,
    api_key: process.env.485914339994888,
    api_secret: process.env.eevWcBgz3vOgAlm6yw6TEab08kI
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'memory-book',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
    }
});

const upload = multer({ storage });

module.exports = upload;