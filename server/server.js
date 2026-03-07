const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { init } = require('./config/socket');
const server = http.createServer(app);
const io = init(server);
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const scrapbookRoutes = require('./routes/scrapBookRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
connectDB();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scrapbooks', scrapbookRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', uploadRoutes);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinScrapbook', (scrapbookId) => {
        socket.join(scrapbookId);
        console.log(`User joined scrapbook: ${scrapbookId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3007;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

