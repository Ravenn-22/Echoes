import { createContext, useState, useContext } from 'react';
import { registerUser, loginUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    );

    const register = async (formData) => {
        const { data } = await registerUser(formData);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const login = async (formData) => {
        const { data } = await loginUser(formData);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);