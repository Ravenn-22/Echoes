import './WelcomeModal.css';

const WelcomeModal = ({ username, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-logo">ECHOES</div>
                <h2 className="modal-title">Welcome, {username}! 🌸</h2>
                <p className="modal-text">
                    Echoes is your private space to capture and share memories with the people you love.
                </p>
                <div className="modal-steps">
                    <div className="modal-step">
                        <span className="step-icon">📸</span>
                        <div>
                            <h4>Create a Scrapbook</h4>
                            <p>Start by creating your first scrapbook for a trip, event or just everyday moments.</p>
                        </div>
                    </div>
                    <div className="modal-step">
                        <span className="step-icon">👥</span>
                        <div>
                            <h4>Invite Your People</h4>
                            <p>Add friends, family or your partner by their email so they can share memories too.</p>
                        </div>
                    </div>
                    <div className="modal-step">
                        <span className="step-icon">🌸</span>
                        <div>
                            <h4>Add Memories</h4>
                            <p>Upload photos, add captions and relive your most precious moments together.</p>
                        </div>
                    </div>
                </div>
                <button className="modal-btn" onClick={onClose}>
                    Let's get started! 🚀
                </button>
            </div>
        </div>
    );
};

export default WelcomeModal;