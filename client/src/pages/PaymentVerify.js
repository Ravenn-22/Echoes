import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PaymentVerify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [status, setStatus] = useState('verifying');

    useEffect(() => {
        const verify = async () => {
            const reference = searchParams.get('reference');
            if (!reference) {
                setStatus('failed');
                return;
            }

            try {
                const { data } = await verifyPayment(reference);
                if (data.isPro) {
                    const updatedUser = { ...user, isPro: true };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    setStatus('success');
                    setTimeout(() => navigate('/home'), 3000);
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                setStatus('failed');
            }
        };

        verify();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#232020',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px',
            fontFamily: 'Raleway, sans-serif',
            color: '#fff2d7',
            textAlign: 'center',
            padding: '20px'
        }}>
            {status === 'verifying' && (
                <>
                    <h2>Verifying your payment... 🌸</h2>
                    <p>Please wait a moment.</p>
                </>
            )}
            {status === 'success' && (
                <>
                    <h2>Payment Successful! 🎉</h2>
                    <p>Welcome to Echoes Pro! Redirecting you home...</p>
                </>
            )}
            {status === 'failed' && (
                <>
                    <h2>Payment Failed 😢</h2>
                    <p>Something went wrong. Please try again.</p>
                    <button
                        onClick={() => navigate('/upgrade')}
                        style={{
                            background: '#72011f',
                            color: '#fff2d7',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Try Again
                    </button>
                </>
            )}
        </div>
    );
};

export default PaymentVerify;