import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../services/api';
import Toast from '../components/Toast';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const { data } = await getOrders();
                setOrders(data);
            } catch (error) {
                setToast({ message: 'Failed to load orders', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'created': return '#D4AF37';
            case 'in_production': return '#C9627D';
            case 'shipped': return '#72011f';
            case 'delivered': return '#4CAF50';
            case 'rejected': return '#F44336';
            case 'cancelled': return '#8B6F61';
            default: return '#8B6F61';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'created': return '📋 Created';
            case 'in_production': return '🖨️ In Production';
            case 'shipped': return '📦 Shipped';
            case 'delivered': return '✅ Delivered';
            case 'rejected': return '❌ Rejected';
            case 'cancelled': return '🚫 Cancelled';
            default: return status;
        }
    };

    return (
        <div className="orders-container">
            <nav className="navbar">
                <div className="navbar-logo" onClick={() => navigate('/home')}>ECHOES</div>
                <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
            </nav>

            <div className="orders-content">
                <h1 className="orders-title">My Print Orders 📖</h1>
                <p className="orders-subtitle">Track all your physical book orders</p>

                {loading ? (
                    <p className="orders-loading">Loading your orders... 🌸</p>
                ) : orders.length === 0 ? (
                    <div className="orders-empty">
                        <p>No print orders yet 📖</p>
                        <p>Order your first hardcover book from any scrapbook!</p>
                        <button className="orders-cta" onClick={() => navigate('/home')}>
                            Go to Scrapbooks
                        </button>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card">
                                {order.scrapbook?.coverImage && (
                                    <img src={order.scrapbook.coverImage} alt={order.scrapbook.title} className="order-cover" />
                                )}
                                <div className="order-details">
                                    <h3>{order.scrapbook?.title || 'Scrapbook'}</h3>
                                    <p className="order-meta">
                                        {order.bookSize.charAt(0).toUpperCase() + order.bookSize.slice(1)} · {order.bookStyle.charAt(0).toUpperCase() + order.bookStyle.slice(1)} style
                                    </p>
                                    <p className="order-meta">
                                        Shipping to: {order.shippingAddress?.city}, {order.shippingAddress?.country}
                                    </p>
                                    <p className="order-meta">
                                        Ordered: {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="order-amount">${order.amount}</p>
                                    <span 
                                        className="order-status"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {getStatusLabel(order.status)}
                                    </span>
                                    <p className="order-lulu-id">Order ID: {order.luluOrderId}</p>
                                    <p className="order-delivery">Est. delivery: {order.estimatedDelivery}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
};

export default Orders;