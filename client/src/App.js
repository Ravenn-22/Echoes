
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Scrapbook from './pages/Scrapbook';
import Views from './pages/Views';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Analytics } from "@vercel/analytics/react"
import NotFound from './pages/NotFound';
import Upgrade from './pages/Upgrade';
import PaymentVerify from './pages/PaymentVerify';
import PrintCustomize from './pages/PrintCustomize';
import TimeCapsule from './pages/TimeCapsule';
import LetterToSelf from './pages/LetterToSelf'
import Help from './pages/Help';

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
                
                <Route path="/capsules" element={
                     <PrivateRoute>
                         <TimeCapsule />
                     </PrivateRoute>
                } />
                <Route path="/letters" element={
                     <PrivateRoute>
                         <LetterToSelf />
                     </PrivateRoute>
                } />
                <Route path="/help" element={
                     <PrivateRoute>
                         <Help />
                     </PrivateRoute>
                } />
                <Route path="/upgrade" element={
                     <PrivateRoute>
                         <Upgrade />
                     </PrivateRoute>
                } />
                <Route path="/payment/verify" element={
                       <PrivateRoute>
                          <PaymentVerify />
                      </PrivateRoute>
                } />
                <Route path="/scrapbook/:id/print" element={
    <PrivateRoute>
        <PrintCustomize />
    </PrivateRoute>
} />
    <Route path="*" element={<NotFound />} />
            </Routes>
            <Analytics />
        </Router>
    );
}

export default App;
