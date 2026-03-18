const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require ("http")
const { init } = require('./config/socket');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const scrapbookRoutes = require('./routes/scrapBookRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const https = require('https');
const paystackRoutes = require('./routes/paystackRoutes');
const checkProExpiry = require('./middleware/checkProExpiry');
const printRoutes = require('./routes/printRoutes');

const app = express();
connectDB();
const server = http.createServer(app);
const io = init(server);

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scrapbooks', scrapbookRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', uploadRoutes);
app.use('/api/paystack', paystackRoutes);
app.use(checkProExpiry);
app.use('/temp', express.static('/tmp'))
app.use('/api/print', printRoutes);

app.get('/temp/:id', (req, res) => {
    const buffer = global.tempPDFs?.[req.params.id];
    if (!buffer) {
        return res.status(404).send('Not found');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
});

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

setInterval(() => {
    https.get('https://echoes-j0mn.onrender.com', (res) => {
        console.log('Keep alive ping sent');
    }).on('error', (err) => {
        console.log('Keep alive error:', err.message);
    });
}, 5 * 60 * 1000);

