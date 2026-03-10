const Brevo = require('@getbrevo/brevo');

const client = Brevo.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendResetEmail = async (to, resetUrl) => {
    const apiInstance = new Brevo.TransactionalEmailsApi();

    const email = new Brevo.SendSmtpEmail();
    email.to = [{ email: to }];
    email.sender = { name: 'Echoes', email: process.env.BREVO_SMTP_USER };
    email.subject = 'Password Reset Request';
    email.htmlContent = `
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
    `;

    await apiInstance.sendTransacEmail(email);
};

module.exports = { sendResetEmail };