import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScrapbook, getMemories, createMemory, deleteMemory, inviteMember} from '../services/api';
import axios from 'axios';
import './Scrapbook.css';
import Loader from '../components/Loader';
import Toast from "../components/Toast";

const ScrapbookPage = () => {
    const [scrapbook, setScrapbook] = useState(null);
    const [memories, setMemories] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const [creatingMemory, setCreatingMemory] = useState(false);
    const [deletingMemoryId, setDeletingMemoryId] = useState(null);
    const [inviting, setInviting] = useState(false);
    const [toast, setToast] = useState(null)
    const [loading, setLoading] = useState(false);

    
    useEffect(() => {
         const fetchData = async () => {
            try {
                setLoading(true);
                const { data: scrapbookData } = await getScrapbook(id);
                console.log("Scrapbook:", scrapbookData);
                setScrapbook(scrapbookData);

                const { data: memoriesData } = await getMemories(id);
                console.log("Memories:", memoriesData)
                setMemories(memoriesData);
                 setLoading(false);
            } catch (error) {
                console.log(error);
            } setLoading(false);
        };
        fetchData();
    }, [id]);


     const [inviteEmail, setInviteEmail] = useState('');
     const [showInvite, setShowInvite] = useState(false);

     const [lightbox, setLightbox] = useState(null);

    const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
        await inviteMember(id, inviteEmail);
        setInviteEmail('');
        setShowInvite(false);
        setToast({ message: 'Member invited successfully! 🎉', type: 'success' });
    } catch (error) {
        setToast({ message: 'User not found or already a member!', type: 'error' });
    }finally {
        setInviting(false);
    }
    };
 
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreatingMemory(true);
        try {
            let imageUrl = '';

            if (image) {
                const formData = new FormData();
                formData.append('image', image);

                const user = JSON.parse(localStorage.getItem('user'));
                const { data } = await axios.post('https://echoes-j0mn.onrender.com/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}`
                    }
                });
                imageUrl = data.imageUrl;
            }

            const { data } = await createMemory({ title, description, image: imageUrl, scrapbook: id });
            setMemories([...memories, data]);
            setTitle('');
            setDescription('');
            setImage(null);
          setShowForm(false);
        setToast({ message: 'Memory added successfully! 🌸', type: 'success' });

        } catch (error) {
            console.log(error);
            setToast({ message: 'Failed to add memory', type: 'error' });
        }finally {
        setCreatingMemory(false);

    };}


    const handleDeleteMemory = async (id) => {
    setDeletingMemoryId(id);
    try {
        await deleteMemory(id);
        setMemories(memories.filter((m) => m._id !== id));
         setToast({ message: 'Memory deleted!', type: 'success' });
    } catch (error) {
          setToast({ message: 'Failed to delete memory', type: 'error' });
    }finally {
        setDeletingMemoryId(null);
    }
};
    return (
        <div className='scrap-container'>
         
            <nav className="navbar">
                <div className="navbar-logo" onClick={() => navigate('/home')}>ECHOES</div>
                <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
            </nav>

      
            <div className="scrapbook-hero">
                <h1>{scrapbook?.title} </h1>
                <p>{scrapbook?.description}</p>
                <button className="invite-btn" onClick={() => setShowInvite(!showInvite)}>
    + Invite Member
</button>

{showInvite && (
    <div className="memory-form">
        <form onSubmit={handleInvite}>
            <input
                type="email"
                placeholder="Enter member's email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button type="submit" disabled={inviting}>
    {inviting ? 'Inviting...' : 'Invite'}
</button>
        </form>
    </div>
)}
                <button className="add-memory-btn" onClick={() => setShowForm(!showForm)}>
                    + Add Memory
                </button>
            </div>

          
            {showForm && (
                <div className="memory-form">
                    <form onSubmit={handleCreate}>
                        <input
                            type="text"
                            placeholder="Memory Title"
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
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                        <button type="submit" disabled={creatingMemory}>
    {creatingMemory ? 'Adding memory...' : 'Add Memory'}
</button>
                    </form>
                </div>
            )}

     
            <div className="memories-section">
                <h2>Memories</h2>
                 {loading ? (
                     <Loader />
                 )  : memories.length === 0 ? (
                    <div className="empty-state">
                        <p>No memories yet. Add your first one! 🌸</p>
                    </div>
                ) : (
                    <div className="memories-grid">
                        {memories.map((memory) => (
                     
                            <div key={memory._id} className="memory-card">
                               
                                <div className="memory-card-image">
                                    {memory.image ? (
                                        <img 
                                        src={memory.image} alt={memory.title}
                                        onClick={() => setLightbox(memory.image)}
                                            style={{cursor: 'pointer'}}
                                        
                                        />
                                    ) : (
                                        '🌸'
                                    )}
                                 
                                </div>
                                <h3>{memory.title}</h3>
                                <p>{memory.description}</p>
                               
                                
                                {/* <p className='memory-date'>
                                     {new Date(memory.createdAt).toLocaleString()}
                                    </p> */}
                                    <p className="memory-meta">
  By {memory.createdBy?.username} • {new Date(memory.createdAt).toLocaleDateString()}
</p>
                                 <button className="delete-btn" onClick={() => handleDeleteMemory(memory._id)} disabled={deletingMemoryId === memory._id}>
                                       {deletingMemoryId === memory._id ? 'Deleting...' : 'Delete'}
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
{lightbox && (
    <div className="lightbox" onClick={() => setLightbox(null)}>
        <img src={lightbox} alt="full view" />
    </div>
)}
        </div>
    );
};

export default ScrapbookPage;