const User = require ('../models/User');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');

// const registerUser = async (req, res) => {
//     try{
//         const{ username, email , password} = req.body;
//         const userExists = await User.findOne({email})
//         if(userExists){
//             return res.status(400).json({message:'User already exists'})
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashPass = await bcrypt.hash(password, salt);

//         const newUser = await User.create({
//             username,
//             email,
//             password: hashPass
//         })
//         const token = jwt.sign({ id:newUser._id}, process.env.JWT_SECRET,{
//             expiresIn: '30d'
//         })
//         res.status(201).json({
//             _id: newUser._id,
//             username: newUser.username,
//             email: newUser.email,
//             token
//         })
//     } catch(error){
//         res.status(500).json({message: error.message})
//     }
// }
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

       
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
        const{ email , password} = req.body;
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
            token
        })
    } catch(error){
        res.status(500).json({message: error.message})
    }
}

module.exports = {registerUser, loginUser}