import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import "./Login.css"



const Login = () => {
      const [isFlipped, setIsFlipped] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData);
            navigate('/home');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='login-container'>
            <div classname={`card ${isFlipped ? "flip" : ""}`}>
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
            <p>Don't have an account?<span onClick={() => setIsFlipped(false)}> <Link to="/register">Register</Link></span></p>
        </div>
          </div>
            </div>
            </div>
    );
};

export default Login;