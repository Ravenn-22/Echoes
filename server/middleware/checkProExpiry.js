const User = require('../models/User');

const checkProExpiry = async (req, res, next) => {
    try {
        if (req.user && req.user.isPro && req.user.proExpiresAt) {
            if (new Date() > new Date(req.user.proExpiresAt)) {
                await User.findByIdAndUpdate(req.user._id, {
                    isPro: false,
                    proExpiresAt: null
                });
                req.user.isPro = false;
            }
        }
        next();
    } catch (error) {
        next();
    }
};

module.exports = checkProExpiry;