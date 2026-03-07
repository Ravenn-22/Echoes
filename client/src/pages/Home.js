import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getScrapbooks, createScrapbook, deleteScrapbook} from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Loader from '../components/Loader'
import Toast from '../components/Toast'
import axios from 'axios';



const Home = () => {
    const [scrapbooks, setScrapbooks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

const [loading, setLoading] = useState(false);
const [ cover, setCover] = useState(null);

const [toast, setToast] = useState(null)

    useEffect(() => {
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
        fetchScrapbooks();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            let coverImage = '';
            if(cover) {
                const formData =new FormData();
                formData.append('image', cover);

                const user =JSON.parse(localStorage.getItem('user'));
                const { data } =await axios.post('https://echoes-j0mn.onrender.com/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}`
                    }
                })
                coverImage = data.imageUrl
                
            }
            const { data } = await createScrapbook({ title, description, coverImage });
            setScrapbooks([...scrapbooks, data]);
            setTitle('');
            setDescription('');
            setCover(null);
            setShowForm(false);
            setToast({ message: 'Scrapbook created successfully! 🎉', type: 'success' });
        } catch (error) {
            setToast({message: 'Failed to create Scrapbook', type:'error'});
            console.log("Scrapbook creation error:", error.response?.data || error);
        }
    };
const handleDelete = async (id) => {
        try {
            await deleteScrapbook(id);
            setScrapbooks(scrapbooks.filter((s) => s._id !== id));
            setToast({ message: 'Scrapbook deleted!', type: 'success' });
        } catch (error) {
           setToast({ message: 'Failed to delete scrapbook', type: 'error' });
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate('/', {replace: true });
       
    };
    
    return (
        <div className='home-container'>
           
            <nav className="navbar">
                <div className="navbar-logo">ECHOES</div>
                <div className="navbar-user">
                    <span className="navbar-username">Hello, {user?.username} 🌸</span>
                    {/* <div className="notification-icon">🔔 {notifications.length}</div> */}
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
                        <input 
                        type='file'
                        accept='image/*'
                        onChange={(e)=> setCover(e.target.files[0])}
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
                    <img src={scrapbook.coverImage} alt={scrapbook.title} className="scrapbook-cover"/>
                ) : (
                    '📸'
                )}
    </div>

            <h3>{scrapbook.title}</h3>
            <p>{scrapbook.description}</p>
            <div className="scrapbook-meta">
                <span>👤 {scrapbook.owner?.username}</span>
                <span>👥 {scrapbook.members?.length} members</span>
            </div>
    
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
            {toast && (
    <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
    />
)}
        </div>
        
    );
};

export default Home;