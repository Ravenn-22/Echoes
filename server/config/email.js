const { BrevoClient } = require('@getbrevo/brevo');

const sendResetEmail = async (to, resetUrl) => {
    const client = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY
    });

    await client.transactionalEmails.sendTransacEmail({
        to: [{ email: to }],
        sender: { name: 'Echoes', email: 'echoesmemo.noreply@gmail.com' },
        subject: 'Password Reset Request',
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #232020; color: #fff2d7;">
                <h1 style="color: #72011f; text-align: center;">Echoes</h1>
                <h2 style="text-align: center;">Password Reset</h2>
                <p>You requested a password reset. Click the button below to reset your password.</p>
                <p>This link expires in <strong>1 hour</strong>.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background: #72011f; color: #fff2d7; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-size: 1rem;">Reset Password</a>
                </div>
                <p style="font-size: 0.85rem; color: rgba(255,242,215,0.5);">If you didn't request this, ignore this email. Your password won't change.</p>
            </div>
        `
    });
};
const sendInviteEmail = async (to, inviteUsername, scrapbookTitle) => {
    const client = new BrevoClient({
         apiKey: process.env.BREVO_API_KEY
    })
   
    await client.transactionalEmails.sendTransacEmail({
        to: [{ email: to }],
        sender: { name: 'Echoes', email: 'echoesmemo.noreply@gmail.com' },
        subject: `${inviteUsername} invited you to a scrapbook on Echoes🌸`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #bfb8b8; color: #fff2d7;">
                <h1 style="color: #72011f; text-align: center;">Echoes</h1>
                <h2 style="text-align: center;">You've been invited! 🌸</h2>
                <p><strong>${inviteUsername}</strong> has invited you to  join their scrapbook <strong>"${scrapbookTitle} </strong> on Echoes. </p>
                <p>Log into your account to start sharing memories together.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CLIENT_URL}/auth" style="background: #72011f; color: #fff2d7; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-size: 1rem;">Open Echoes</a>
                </div>
                <p style="font-size: 0.85rem; color: rgba(255,242,215,0.5);">If you don't have an account yet, sign up at echoes and ask ${inviteUsername} to invite you again.</p>
            </div>
        `
    });
}

const sendNewMemoryEmail = async (to, uploaderUsername, memoryTitle, scrapbookTitle) => {
    const client = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY
    });

    await client.transactionalEmails.sendTransacEmail({
        to: [{ email: to }],
        sender: { name: 'Echoes', email: 'echoesmemo.noreply@gmail.com' },
        subject: `${uploaderUsername} added a new memory to ${scrapbookTitle} 🌸`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #232020; color: #fff2d7;">
                <h1 style="color: #72011f; text-align: center;">Echoes</h1>
                <h2 style="text-align: center;">New Memory Added! 🌸</h2>
                <p><strong>${uploaderUsername}</strong> just added a new memory called <strong>"${memoryTitle}"</strong> to the scrapbook <strong>"${scrapbookTitle}"</strong>.</p>
                <p>Log in to see it!</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CLIENT_URL}/auth" style="background: #72011f; color: #fff2d7; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-size: 1rem;">View Memory</a>
                </div>
                <p style="font-size: 0.85rem; color: rgba(255,242,215,0.5);">You're receiving this because you're a member of this scrapbook on Echoes.</p>
            </div>
        `
    });
};

const sendPrintConfirmationEmail = async (to, orderId, bookSize, estimatedDelivery) => {
    const client = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY
    });

    await client.transactionalEmails.sendTransacEmail({
        to: [{ email: to }],
        sender: { name: 'Echoes', email: 'echoesmemo.noreply@gmail.com' },
        subject: 'Your Echoes book is being printed! 📖',
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #232020; color: #fff2d7;">
                <h1 style="color: #72011f; text-align: center;">Echoes</h1>
                <h2 style="text-align: center;">Your book is on its way! 📖</h2>
                <p>Your scrapbook is being printed and will be shipped to you soon.</p>
                <div style="background: rgba(255,242,215,0.1); border-radius: 10px; padding: 20px; margin: 20px 0;">
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    <p><strong>Book Size:</strong> ${bookSize.charAt(0).toUpperCase() + bookSize.slice(1)}</p>
                    <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
                </div>
                <p>Thank you for using Echoes. Your memories deserve to be held. 🌸</p>
                <p style="font-size: 0.85rem; color: rgba(255,242,215,0.5);">If you have any questions about your order please reply to this email.</p>
            </div>
        `
    });
};

const sendCapsuleUnlockEmail = async (to, username, capsuleTitle, type, message) => {
    const client = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY
    });

    const isLetter = type === 'letter';

    await client.sendTransacEmail({
        to: [{ email: to }],
        sender: { name: 'Echoes', email: 'echoesmemo.noreply@gmail.com' },
        subject: isLetter ? `A letter from your past is waiting for you 💌` : `Your time capsule has unlocked! 🎉`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #232020; color: #fff2d7;">
                <h1 style="color: #72011f; text-align: center;">Echoes</h1>
                ${isLetter ? `
                    <h2 style="text-align: center;">A letter from your past 💌</h2>
                    <p>Hey ${username}, you wrote yourself a letter and today is the day you get to read it.</p>
                    <div style="background: rgba(255,242,215,0.1); border-radius: 10px; padding: 20px; margin: 20px 0; font-style: italic; line-height: 1.8;">
                        ${message}
                    </div>
                    <p>How does it feel reading this? We hope it makes you smile 🌸</p>
                ` : `<h2 style="text-align: center;">Your time capsule is open! 🎉</h2>
                    <p>Hey ${username}, the time capsule <strong>"${capsuleTitle}"</strong> has finally unlocked!</p>
                    <p>Head to Echoes to see everything inside 🌸</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}" style="background: #72011f; color: #fff2d7; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-size: 1rem;">Open Echoes</a>
                    </div>
                `}
                <p style="font-size: 0.85rem; color: rgba(255,242,215,0.5);">You're receiving this because you're part of a time capsule on Echoes 🌸</p>
            </div>
        `
    });
};
const sendSubscriptionReminderEmail = async (to, username, expiryDate) => {
    const client = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY
    });

    await client.sendTransacEmail({
        to: [{ email: to }],
        sender: { name: 'Echoes', email: 'echoesmemo.noreply@gmail.com' },
        subject: 'Your Echoes Pro subscription is expiring soon 🌸',
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #232020; color: #fff2d7;">
                <h1 style="color: #72011f; text-align: center;">Echoes</h1>
                <h2 style="text-align: center;">Your Pro subscription is expiring soon ⚠️</h2>
                <p>Hey ${username}! Just a heads up — your Echoes Pro subscription expires on <strong>${new Date(expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
                <p>You have a 3 day grace period after expiry before Pro access is removed.</p>
                <p>Renew now to keep enjoying:</p>
                <ul style="line-height: 2; color: #fff2d7;">
                    <li>✅ Unlimited scrapbooks</li>
                    <li>✅ Unlimited members</li>
                    <li>✅ Unlimited memories</li>
                    <li>✅ Time Capsules</li>
                    <li>✅ Unlimited Letters</li>
                    <li>✅ Physical hardcover book printing</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CLIENT_URL}/upgrade" style="background: #72011f; color: #fff2d7; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-size: 1rem;">Renew Pro 🌸</a>
                </div>
                <p style="font-size: 0.85rem; color: rgba(255,242,215,0.5);">You're receiving this because you have an Echoes Pro subscription.</p>
            </div>
        `
    });
};

module.exports = { sendResetEmail, sendInviteEmail, sendNewMemoryEmail, sendPrintConfirmationEmail, sendCapsuleUnlockEmail, sendSubscriptionReminderEmail };

