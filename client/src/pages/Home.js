import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getScrapbooks, createScrapbook, deleteScrapbook} from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Loader from '../components/Loader'

const Home = () => {
    const [scrapbooks, setScrapbooks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
const [loading, setLoading] = useState(false);

const fetchScrapbooks = async () => {
    try {
        setLoading(true);
        const { data } = await getScrapbooks();
        setScrapbooks(data);
        setLoading(false);
    } catch (error) {
        console.log(error);
        setLoading(false);
    }
};
    useEffect(() => {
        const fetchScrapbooks = async () => {
            try {
                const { data } = await getScrapbooks();
                setScrapbooks(data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchScrapbooks();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await createScrapbook({ title, description });
            setScrapbooks([...scrapbooks, data]);
            setTitle('');
            setDescription('');
            setShowForm(false);
        } catch (error) {
            console.log(error);
        }
    };
const handleDelete = async (id) => {
        try {
            await deleteScrapbook(id);
            setScrapbooks(scrapbooks.filter((s) => s._id !== id));
        } catch (error) {
            console.log(error);
        }
    };
    const handleLogout = () => {
        logout();
        navigate('/auth');
    };
    

    return (
        <div className='home-container'>
           
            <nav className="navbar">
                <div className="navbar-logo">ECHOES</div>
                <div className="navbar-user">
                    <span className="navbar-username">Hello, {user?.username} 🌸</span>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="hero">
                <h1>Your Memories </h1>
                <p>Capture and cherish every beautiful moment</p>
                <button className="create-btn" onClick={() => setShowForm(!showForm)}>
                    + Create Scrapbook
                </button>
            </div>

         
            {showForm && (
                <div className="create-form">
                    <form onSubmit={handleCreate}>
                        <input
                            type="text"
                            placeholder="Scrapbook Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <button type="submit">Create</button>
                    </form>
                </div>
            )}

            
            <div className="scrapbooks-section">
                <h2>Your Scrapbooks</h2>
            {loading ? (
                <Loader />
            ) : scrapbooks.length === 0 ? (
                    <div className="empty-state">
                        <p>No scrapbooks yet. Create your first one! 🌷</p>
                    </div>
                ) : (
                    <div className="scrapbooks-grid">
                       {scrapbooks.map((scrapbook) => (
                         <div key={scrapbook._id}    className="scrapbook-card"  >
        <div onClick={() => navigate(`/scrapbook/${scrapbook._id}`)}>
            <div className="scrapbook-card-image">
                {scrapbook.coverImage ? (
                    <img src={scrapbook.coverImage} alt={scrapbook.title} />
                ) : (
                    '📸'
                )}
    </div>

            <h3>{scrapbook.title}</h3>
            <p>{scrapbook.description}</p>
        </div>
        <button
            className="delete-btn"
            onClick={(e) => {
                e.stopPropagation();
                handleDelete(scrapbook._id);
            }}
        >
             Delete
        </button>
    </div>
    
))}
                    </div>
                )}
            </div>
        </div>
        
    );
};

export default Home;