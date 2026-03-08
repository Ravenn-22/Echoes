import { useState } from 'react';
import { forgotPassword } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await forgotPassword(email);
            setMessage('Reset link sent! Check your email 🌸');
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card-flip">
                <div className="card-flip-inner">
                    <div className="card-front" style={{ transform: 'none' }}>
                        <div className="auth-logo">ECHOES</div>
                        <div className="auth-subtitle">Enter your email to reset your password</div>
                        <h2 className="auth-form-title">Forgot Password</h2>
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {error && <p className="auth-error">{error}</p>}
                            {message && <p className="auth-success">{message}</p>}
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                        <div className="auth-switch">
                            Remember your password?{' '}
                            <span onClick={() => navigate('/auth')}>Login</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;