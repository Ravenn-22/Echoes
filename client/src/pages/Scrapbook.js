import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScrapbook, getMemories, createMemory, deleteMemory, inviteMember} from '../services/api';
import axios from 'axios';
import './Scrapbook.css';


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

    useEffect(() => {
         const fetchData = async () => {
            try {
                const { data: scrapbookData } = await getScrapbook(id);
                setScrapbook(scrapbookData);

                const { data: memoriesData } = await getMemories(id);
                setMemories(memoriesData);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [id]);


     const [inviteEmail, setInviteEmail] = useState('');
     const [showInvite, setShowInvite] = useState(false);

    const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
        await inviteMember(id, inviteEmail);
        setInviteEmail('');
        setShowInvite(false);
        alert('Member invited successfully! 🎉');
    } catch (error) {
        alert('User not found!');
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
        } catch (error) {
            console.log(error);
        }finally {
        setCreatingMemory(false);
    };}


    const handleDeleteMemory = async (id) => {
    setDeletingMemoryId(id);
    try {
        await deleteMemory(id);
        setMemories(memories.filter((m) => m._id !== id));
    } catch (error) {
        console.log(error);
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
                {memories.length === 0 ? (
                    <div className="empty-state">
                        <p>No memories yet. Add your first one! 🌸</p>
                    </div>
                ) : (
                    <div className="memories-grid">
                        {memories.map((memory) => (
                            <div key={memory._id} className="memory-card">
                                <div className="memory-card-image">
                                    {memory.image ? (
                                        <img src={memory.image} alt={memory.title} />
                                    ) : (
                                        '🌸'
                                    )}
                                </div>
                                <h3>{memory.title}</h3>
                                <p>{memory.description}</p>
                                 <button className="delete-btn" onClick={() => handleDeleteMemory(memory._id)} disabled={deletingMemoryId === memory._id}>
                                       {deletingMemoryId === memory._id ? 'Deleting...' : 'Delete'}
</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScrapbookPage;