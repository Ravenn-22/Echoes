
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Scrapbook from './pages/Scrapbook';
import Views from './pages/Views';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Analytics } from "@vercel/analytics/react"

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/auth" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Views />} />
                 <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/home" element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                } />
                <Route path="/scrapbook/:id" element={
                    <PrivateRoute>
                        <Scrapbook />
                    </PrivateRoute>
                } />
    
            </Routes>
            <Analytics />
        </Router>
    );
}

export default App;
