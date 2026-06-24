import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import "./Register.css"

const Register = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [registered, setRegistered] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData);
            // FIX: was navigate('/home') — but the account isn't logged in
            // (no token issued until email is verified), so that just
            // dropped people onto a page that would silently 401 on every
            // request. Now we show a "check your email" message instead,
            // and let them head to /login once they've verified.
            setRegistered(true);
        } catch (error) {
            console.log(error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    if (registered) {
        return (
            <div className='Auth-container'>
                <div className="card">
                    <div className="inner">
                        <div className="front">
                            <h1>Check your email 🌸</h1>
                            <p>We've sent a verification link to <strong>{formData.email}</strong>. Click it to activate your account, then log in.</p>
                            <p>
                                <Link to="/login">Go to login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='Auth-container'>
            <div className={`card ${isFlipped ? "flip" : ""}`}>
                <div className="inner">
                    <div className="front">
                        <h1>Create Account</h1>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                onChange={handleChange}
                            />
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
                            <button type="submit">Register</button>
                        </form>

                        {error && <p className="register-error">{error}</p>}

                        <p>Already have an account? <span onClick={() => setIsFlipped(true)}><Link to="/login">Login</Link></span> </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;