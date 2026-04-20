import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCapsule, getCapsules, deleteCapsule } from '../services/api';
import Toast from '../components/Toast';
import './TimeCapsule.css';

const LetterToSelf = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [letters, setLetters] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const fetchLetters = async () => {
            try {
                setLoading(true);
                const { data } = await getCapsules();
                setLetters(data.filter(c => c.type === 'letter'));
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLetters();
    }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const { data } = await createCapsule({
                title,
                message,
                unlockDate,
                type: 'letter',
                memberEmails: []
            });
            setLetters([...letters, data]);
            setTitle('');
            setMessage('');
            setUnlockDate('');
            setShowForm(false);
            setToast({ message: 'Letter sealed! It will be delivered on your chosen date 💌', type: 'success' });
        } catch (error) {
            setToast({ message: 'Failed to create letter', type: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCapsule(id);
            setLetters(letters.filter(l => l._id !== id));
            setToast({ message: 'Letter deleted!', type: 'success' });
        } catch (error) {
            setToast({ message: 'Failed to delete letter', type: 'error' });
        }
    };

    const getTimeLeft = (unlockDate) => {
        const now = new Date();
        const unlock = new Date(unlockDate);
        const diff = unlock - now;

        if (diff <= 0) return 'Delivered! 💌';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) return `Delivers in ${years} year${years > 1 ? 's' : ''}`;
        if (months > 0) return `Delivers in ${months} month${months > 1 ? 's' : ''}`;
        return `Delivers in ${days} day${days > 1 ? 's' : ''}`;
    };return (
        <div className="capsule-container">
            <nav className="navbar">
                <div className="navbar-logo" onClick={() => navigate('/home')}>ECHOES</div>
                <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
            </nav>

            <div className="capsule-content">
                <h1 className="capsule-title">Letters to Future Self 💌</h1>
                <p className="capsule-subtitle">Write a letter today. Receive it in the future.</p>

                <button className="capsule-create-btn" onClick={() => setShowForm(!showForm)}>
                    + Write a Letter
                </button>

                {showForm && (
                    <div className="capsule-form">
                        <form onSubmit={handleCreate}>
                            <input
                                type="text"
                                placeholder="Letter Title e.g. To my 30 year old self"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Dear future me... Write whatever you want to remember, your dreams, your fears, your goals, a message to yourself..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={8}
                            />
                            <label>Delivery Date — when should this letter reach you?</label>
                            <input
                                type="date"
                                value={unlockDate}
                                onChange={(e) => setUnlockDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                            <button type="submit" disabled={creating}>
                                {creating ? 'Sealing...' : 'Seal & Send 💌'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                        </form>
                    </div>
                )}<div className="capsules-grid">
                    {letters.length === 0 ? (
                        <div className="empty-state">
                            <p>No letters yet. Write your first letter to your future self! 💌</p>
                        </div>
                    ) : (
                        letters.map((letter) => (
                            <div key={letter._id} className={`capsule-card ${letter.isUnlocked ? 'unlocked' : 'locked'}`}>
                                <div className="capsule-icon">
                                    {letter.isUnlocked ? '💌' : '✉️'}
                                </div>
                                <h3>{letter.title}</h3>
                                <p className="capsule-time">{getTimeLeft(letter.unlockDate)}</p>
                                <p className="capsule-date">
                                    Delivery date: {new Date(letter.unlockDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                {letter.isUnlocked && (
                                    <div className="capsule-message">
                                        <p>{letter.message}</p>
                                    </div>
                                )}
                                <button className="delete-btn" onClick={() => handleDelete(letter._id)}>
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
};

export default LetterToSelf;