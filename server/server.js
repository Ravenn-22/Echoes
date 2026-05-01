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
const timeCapsuleRoutes = require ('./routes/timeCapsulesRoutes')
const {checkAndUnlockCapsules} = require('./controllers/timeCapsuleController')
const User = require('./models/User');
const { sendSubscriptionReminderEmail } = require('./config/email');
const orderRoutes = require('./routes/orderRoutes');

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
app.use('/api/capsules', timeCapsuleRoutes)
app.use('/api/orders', orderRoutes);


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

const checkExpiringSubscriptions = async () => {
    try {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const expiringUsers = await User.find({
            isPro: true,
            proExpiresAt: { $lte: threeDaysFromNow, $gte: new Date() }
        });

        for (const user of expiringUsers) {
            try {
                await sendSubscriptionReminderEmail(
                    user.email,
                    user.username,
                    user.proExpiresAt
                );
                console.log(`Reminder sent to: ${user.email}`);
            } catch (emailError) {
                console.error('Reminder email error:', emailError.message);
            }
        }
    } catch (error) {
        console.error('Subscription check error:', error.message);
    }
};

setInterval(async () => {
    await checkExpiringSubscriptions();
}, 24 * 60 * 60 * 1000);

setInterval(async () => {
    console.log("Checking for capsules to unlock...")
    await checkAndUnlockCapsules();
}, 60 * 60 * 1000)

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

