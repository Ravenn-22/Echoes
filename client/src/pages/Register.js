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

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/home');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='Auth-container'>
            <div classname={`card ${isFlipped ? "flip" : ""}`}>
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
            <p>Already have an account? <span onClick={() => setIsFlipped(true)}><Link to="/login">Login</Link></span> </p>
        </div>
           </div>

               </div>
            </div>
    );
};

export default Register;