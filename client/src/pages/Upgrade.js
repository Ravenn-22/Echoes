import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { initializePayment } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Upgrade.css';

const Upgrade = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [monthLoading, setMonthLoading] = useState(false);
    const [yearLoading, setYearLoading] = useState(false);

    const handlePayment = async (plan, amount, setLoading) => {
        setLoading(true);
        try {
            const { data } = await initializePayment(user.email, amount, plan);
            window.location.href = data.data.authorization_url;
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="upgrade-container">
        <nav className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/home')}>ECHOES</div>
            <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
        </nav>

        <div className="upgrade-content">
            <h1 className="upgrade-title">
                {user?.isPro ? 'You\'re on Pro! 🌸' : 'Upgrade to Pro 🌸'}
            </h1>
            <p className="upgrade-subtitle">
                {user?.isPro 
                    ? `Your Pro plan is active until ${new Date(user.proExpiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                    : 'Unlock unlimited memories and so much more'
                }
            </p>

            <div className="plans-grid">
                <div className="plan-card">
                    <h2>Free</h2>
                    <p className="plan-price">$0<span>/forever</span></p>
                    <ul className="plan-features">
                        <li>✅ Up to 3 scrapbooks</li>
                        <li>✅ Up to 5 members per scrapbook</li>
                        <li>✅ Up to 20 memories per scrapbook</li>
                        <li>✅ All core features</li>
                        <li>❌ Unlimited scrapbooks</li>
                        <li>❌ Unlimited memories</li>
                        <li>❌ Priority support</li>
                    </ul>
                    <button className="plan-btn current" disabled>
                        {user?.isPro ? 'Previous Plan' : 'Current Plan'}
                    </button>
                </div>

                <div className="plan-card pro">
                    <div className="pro-badge">Most Popular</div>
                    <h2>Pro</h2>
                    <p className="plan-price">$3<span>/month</span></p>
                    <ul className="plan-features">
                        <li>✅ Unlimited scrapbooks</li>
                        <li>✅ Unlimited members</li>
                        <li>✅ Unlimited memories</li>
                        <li>✅ All core features</li>
                        <li>✅ Priority support</li>
                        <li>✅ Early access to new features</li>
                    </ul>
                    {user?.isPro ? (
                        <button className="plan-btn current" disabled>Current Plan ⭐</button>
                    ) : (
                        <button
                            className="plan-btn upgrade"
                            onClick={() => handlePayment('monthly', 3, setMonthLoading)}
                            disabled={monthLoading}
                        >
                            {monthLoading ? 'Processing...' : 'Upgrade Monthly'}
                        </button>
                    )}
                </div>

                <div className="plan-card pro-yearly">
                    <div className="pro-badge save">Save $11</div>
                    <h2>Pro Yearly</h2>
                    <p className="plan-price">$25<span>/year</span></p>
                    <ul className="plan-features">
                        <li>✅ Everything in Pro</li>
                        <li>✅ 2 months free</li>
                        <li>✅ Priority support</li>
                        <li>✅ Early access to new features</li>
                    </ul>
                    {user?.isPro ? (
                        <button className="plan-btn current" disabled>Current Plan ⭐</button>
                    ) : (
                        <button
                            className="plan-btn upgrade"
                            onClick={() => handlePayment('yearly', 25, setYearLoading)}
                            disabled={yearLoading}
                        >
                            {yearLoading ? 'Processing...' : 'Upgrade Yearly'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
);
};

export default Upgrade;