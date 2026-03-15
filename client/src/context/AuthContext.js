import { createContext, useState, useContext } from 'react';
import { registerUser, loginUser, updateProfilePicture as updatePfp, updateUsername as updateUsernameApi } from '../services/api';

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
    const updateUsername = async (username) => {
    const { data } = await updateUsernameApi(username);
    const updatedUser = { ...user, username: data.username };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
};
    const updateProfilePicture = async (profilePicture) => {
        const { data } = await updatePfp(profilePicture);
        const updatedUser = { ...user, profilePicture: data.profilePicture };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, register, login, logout, updateProfilePicture, updateUsername }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);