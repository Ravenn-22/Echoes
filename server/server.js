const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
require('dotenv').config()
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const scrapbookRoutes = require('./routes/scrapBookRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
connectDB();

app.use(cors({
    origin: '*',
    credentials: false
}));

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/scrapbooks', scrapbookRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/upload', uploadRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({message: err.message})
})

const PORT = process.env.PORT || 3007;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
})