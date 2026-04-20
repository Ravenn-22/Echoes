import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCapsule, getCapsules, deleteCapsule } from '../services/api';
import Toast from '../components/Toast';
import './TimeCapsule.css';

const TimeCapsule = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [capsules, setCapsules] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [memberEmails, setMemberEmails] = useState('');
    const [creating, setCreating] = useState(false);
    useEffect(() => {
        const fetchCapsules = async () => {
            try {
                setLoading(true);
                const { data } = await getCapsules();
                setCapsules(data.filter(c => c.type === 'capsule'));
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCapsules();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const emails = memberEmails.split(',').map(e => e.trim()).filter(e => e);
            const { data } = await createCapsule({
                title,
                message,
                unlockDate,
                type: 'capsule',
                memberEmails: emails
            });
            setCapsules([...capsules, data]);
            setTitle('');
            setMessage('');
            setUnlockDate('');
            setMemberEmails('');
            setShowForm(false);
            setToast({ message: 'Time capsule created! 🎉', type: 'success' });
        } catch (error) {
            setToast({ message: 'Failed to create capsule', type: 'error' });
        } finally {
            setCreating(false);
        }
    };
    const handleDelete = async (id) => {
        try {
            await deleteCapsule(id);
            setCapsules(capsules.filter(c => c._id !== id));
            setToast({ message: 'Capsule deleted!', type: 'success' });
        } catch (error) {
            setToast({ message: 'Failed to delete capsule', type: 'error' });
        }
    };

    const getTimeLeft = (unlockDate) => {
        const now = new Date();
        const unlock = new Date(unlockDate);
        const diff = unlock - now;

        if (diff <= 0) return 'Unlocked! 🎉';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) return `Opens in ${years} year${years > 1 ? 's' : ''}`;
        if (months > 0) return `Opens in ${months} month${months > 1 ? 's' : ''}`;
        return `Opens in ${days} day${days > 1 ? 's' : ''}`;
    };
    return (
        <div className="capsule-container">
            <nav className="navbar">
                <div className="navbar-logo" onClick={() => navigate('/home')}>ECHOES</div>
                <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
            </nav>

            <div className="capsule-content">
                <h1 className="capsule-title">Time Capsules ⏳</h1>
                <p className="capsule-subtitle">Lock your memories and unlock them in the future</p>

                <button className="capsule-create-btn" onClick={() => setShowForm(!showForm)}>
                    + Create Time Capsule
                </button>

                {showForm && (
                    <div className="capsule-form">
                        <form onSubmit={handleCreate}>
                            <input
                                type="text"
                                placeholder="Capsule Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Write your message — what do you want to remember? What do you want to say to the people who open this?"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                            <label>Unlock Date</label>
                            <input
                                type="date"
                                value={unlockDate}
                                onChange={(e) => setUnlockDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Invite members by email (comma separated)"
                                value={memberEmails}
                                onChange={(e) => setMemberEmails(e.target.value)}
                            />
                            <button type="submit" disabled={creating}>
                                {creating ? 'Creating...' : 'Lock Capsule 🔒'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} id='cancel'>Cancel</button>
                        </form>
                    </div>
                )}

                <div className="capsules-grid">
                    {capsules.length === 0 ? (
                        <div className="empty-state">
                            <p>No time capsules yet. Create your first one! ⏳</p>
                        </div>
                    ) : (
                        capsules.map((capsule) => (
                            <div key={capsule._id} className={`capsule-card ${capsule.isUnlocked ? 'unlocked' : 'locked'}`}>
                                <div className="capsule-icon">
                                    {capsule.isUnlocked ? '🎉' : '🔒'}
                                </div><h3>{capsule.title}</h3>
                                <p className="capsule-time">{getTimeLeft(capsule.unlockDate)}</p>
                                <p className="capsule-date">
                                    Unlock date: {new Date(capsule.unlockDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                {capsule.isUnlocked && (
                                    <div className="capsule-message">
                                        <p>{capsule.message}</p>
                                    </div>
                                )}
                                <p className="capsule-author">Created by {capsule.createdBy?.username}</p>
                                {capsule.createdBy?._id === user?._id && (
                                    <button className="delete-btn" onClick={() => handleDelete(capsule._id)}>
                                        Delete
                                    </button>
                                )}
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

export default TimeCapsule;