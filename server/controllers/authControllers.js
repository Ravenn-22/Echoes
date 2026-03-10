const User = require ('../models/User');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const crypto = require('crypto');

const { sendResetEmail } = require('../config/email');


const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const email = req.body.email.toLowerCase();
       
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashPass
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            token
        });
    } catch (error) {
      
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User already exists' });
        }

        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) =>{
     try{
        const{ password} = req.body;
         const email = req.body.email.toLowerCase();
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:'Invalid Credentials'})
        }
        const isMatch = await bcrypt.compare(password, user.password )
        if(!isMatch){
            return res.status(400).json({message: 'Invalid Credentials'})
        }
         const token = jwt.sign({ id:user._id}, process.env.JWT_SECRET,{
            expiresIn: '30d'
        })
         res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            token
        })
    } catch(error){
        res.status(500).json({message: error.message})
    }
}
const updateProfilePicture = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture: req.body.profilePicture },
            { new: true }
        ).select('-password');

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No account with that email found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await sendResetEmail(user.email, resetUrl);

        res.status(200).json({ message: 'Reset email sent!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

        await user.save();

        res.status(200).json({ message: 'Password reset successful!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {registerUser, loginUser , forgotPassword, resetPassword, updateProfilePicture}