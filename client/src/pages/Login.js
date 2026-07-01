import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { resendVerificationEmail } from '../services/api';
import "./Login.css"

const Login = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [needsVerification, setNeedsVerification] = useState(false);
    const [resendStatus, setResendStatus] = useState(''); // '', 'sending', 'sent'

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear stale verification state once the user starts editing again
        setNeedsVerification(false);
        setResendStatus('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setNeedsVerification(false);
        setResendStatus('');

        try {
            await login(formData);
            navigate('/home');
        } catch (error) {
            console.log(error);
            const status = error.response?.status;
            const message = error.response?.data?.message || 'Login failed. Please try again.';

            if (status === 403) {
                // This status code is specifically "please verify your email"
                setNeedsVerification(true);
            }
            setError(message);
        }
    };

    const handleResend = async () => {
        setResendStatus('sending');
        try {
            await resendVerificationEmail(formData.email);
            setResendStatus('sent');
        } catch {
            setResendStatus('');
            setError('Something went wrong sending the email. Please try again.');
        }
    };

    return (
        <div className='login-container'>
            <div className={`card ${isFlipped ? "flip" : ""}`}>
                <div className='inner'>
                    <div className='back'>

                        <h1>Login</h1>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                            />
                            <button type="submit">Login</button>
                        </form>

                        {error && <p className="login-error">{error}</p>}

                        {needsVerification && (
                            <div className="resend-verification">
                                {resendStatus === 'sent' ? (
                                    <p>If that email needs verifying, a new link is on its way. Check your inbox 🌸</p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendStatus === 'sending'}
                                    >
                                        {resendStatus === 'sending' ? 'Sending...' : 'Resend verification email'}
                                    </button>
                                )}
                            </div>
                        )}

                        <p>Don't have an account?<span onClick={() => setIsFlipped(false)}> <Link to="/register">Register</Link></span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;