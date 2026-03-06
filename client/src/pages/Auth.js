import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
        await login(loginData);
        navigate('/home');
    } catch (error) {
        setError(error.response?.data?.message || 'Something went wrong');
    }
};

   const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
        await register(registerData);
        navigate('/home');
    } catch (error) {
        setError(error.response?.data?.message || 'Something went wrong');
    }
};

    return (
        <div className="auth-container">
            <div className={`card-flip ${isFlipped ? 'flipped' : ''}`}>
                <div className="card-flip-inner">

                   
                    <div className="card-front">
                        <div className="auth-logo">ECHOES</div>
                        <div className="auth-subtitle">Welcome back, cherish your memories 🌸</div>
                        <h2 className="auth-form-title">Login</h2>
                        <form className="auth-form" onSubmit={handleLogin}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleLoginChange}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                onChange={handleLoginChange}
                            />
                            {error && <p className="auth-error">{error}</p>}
                            <button type="submit" className="auth-btn">Login</button>
                        </form>
                        <div className="auth-switch">
                            Don't have an account?{' '}
                            <span onClick={() => setIsFlipped(true)}>Register</span>
                        </div>
                    </div>

                   
                    <div className="card-back">
                        <div className="auth-logo">ECHOES</div>
                        <div className="auth-subtitle">Start capturing your beautiful moments ✨</div>
                        <h2 className="auth-form-title">Register</h2>
                        <form className="auth-form" onSubmit={handleRegister}>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                onChange={handleRegisterChange}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleRegisterChange}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                onChange={handleRegisterChange}
                            />
                            {error && <p className="auth-error">{error}</p>}
                            <button type="submit" className="auth-btn">Register</button>
                        </form>
                        <div className="auth-switch">
                            Already have an account?{' '}
                            <span onClick={() => setIsFlipped(false)}>Login</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Auth;