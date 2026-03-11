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
    await client.sendTransacEmail({
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

module.exports = { sendResetEmail, sendInviteEmail };