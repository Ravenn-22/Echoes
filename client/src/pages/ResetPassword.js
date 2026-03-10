import { useEffect, useState } from 'react';
import { resetPassword } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import './Auth.css';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

useEffect(() => {
    fetch('https://echoes-j0mn.onrender.com/api/auth/login', {method: 'POST'})
    .catch(() => {});
}, [])
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await resetPassword(token, password);
            setMessage('Password reset successful! 🎉');
            setTimeout(() => navigate('/auth'), 2000);
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
                        <div className="auth-subtitle">Enter your new password</div>
                        <h2 className="auth-form-title">Reset Password</h2>
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {error && <p className="auth-error">{error}</p>}
                            {message && <p className="auth-success">{message}</p>}
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;