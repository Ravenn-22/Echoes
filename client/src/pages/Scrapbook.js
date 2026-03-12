import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScrapbook, getMemories, createMemory, deleteMemory, inviteMember, updateMemory, removeMember} from '../services/api';
import axios from 'axios';
import './Scrapbook.css';
import Loader from '../components/Loader';
import Toast from "../components/Toast";
import {io} from 'socket.io-client';
import { useAuth } from '../context/AuthContext';


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
    const [removeMemberId, setRemoveMemoryId] = useState(null);
    const [inviting, setInviting] = useState(false);
    const [toast, setToast] = useState(null)
    const [loading, setLoading] = useState(false);
     const [inviteEmail, setInviteEmail] = useState('');
     const [showInvite, setShowInvite] = useState(false);
     const [downloading, setDownloading] = useState(false);
     const [lightbox, setLightbox] = useState(null);
      const [editingMemory,setEditingMemory] = useState(null)
    const [editTitle,setEditTitle] = useState("")
    const [editDescription,setEditDescription] = useState("")
    const [editImage,setEditImage] = useState(null);

     const [saveMemoryEdit, setSaveMemoryEdit] = useState(null);
     const { user } = useAuth();
     const [search, setSearch] = useState('');
         const [sortBy, setSortBy] = useState("newest")


    
    useEffect(() => {
          const socket = io('https://echoes-j0mn.onrender.com', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
    });
    
    socket.emit('joinScrapbook', id);

    socket.on('newMemory', (memory) => {
        setMemories((prev) => {
            const exists = prev.find((m) => m._id === memory._id);
            if (exists) return prev;
            setToast({ message: `${memory.createdBy?.username} added a new memory! 🌸`, type: 'success' });
            return [...prev, memory];
        });
    });
         const fetchData = async () => {
            try {
                setLoading(true);
                const { data: scrapbookData } = await getScrapbook(id);
                setScrapbook(scrapbookData);

                const { data: memoriesData } = await getMemories(id);
                setMemories(memoriesData);
                 setLoading(false);
            } catch (error) {
                console.log(error);
            } setLoading(false);
        };
        fetchData();
        console.log('User opened Scrapbook')

    return () => {
        socket.disconnect();
    };
    }, [id]);
    
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
          console.log("User created Memory")
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
    }};

   

    const handleEditClick = (memory) => {
        setEditingMemory(memory._id);
        setEditTitle(memory.title);
        setEditDescription(memory.description);
    };

    const handleEditSubmit = async (e, id) => {
         setSaveMemoryEdit(id);
        e.preventDefault();
        try{
            let imageUrl = editImage ? null : undefined;
            if(editImage){
                const formData = new FormData();
                formData.append('image', editImage);

                const user = JSON.parse(localStorage.getItem('user'));
                const {data} = await axios.post('https://echoes-j0mn.onrender.com/api/upload', formData, {
                    headers:{
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}`
                    }
                });
                imageUrl = data.imageUrl
            }
            const updateData = {
                title: editTitle,
                description: editDescription,
                ...(imageUrl && { image: imageUrl })
            };
            const { data } =await updateMemory(id, updateData);
            setMemories(memories.map((m) => m._id === id ? data : m));
            setEditingMemory(null);
            setToast({ message: 'Memory updated!', type: 'success'})
        }catch(error){
            setToast({ message: 'Failed to update memory', type: 'error'})
        }finally {
        setSaveMemoryEdit(null);
    }
    };

const handleRemoveMember = async (memberId) => {
    setRemoveMemoryId(id)
    try {
        await removeMember(id, memberId);
        setScrapbook((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m._id !== memberId)
        }));
        setToast({ message: 'Member removed!', type: 'success' });
    } catch (error) {
        setToast({ message: 'Failed to remove member', type: 'error' });
    }finally {
       setRemoveMemoryId(null);

    }
};
const handleDownload = async (e, url) => {
    e.stopPropagation();
    setDownloading(true);
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'echoes-memory.jpg';
        link.click();
    } catch (error) {
        setToast({ message: 'Failed to download image', type: 'error' });
    } finally {
        setDownloading(false);
    }
};


const filteredMemories = memories.filter((memory) =>
    memory.title.toLowerCase().includes(search.toLowerCase()) ||
    memory.description.toLowerCase().includes(search.toLowerCase())
); 
const sortedMemory = [...filteredMemories].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'author') return a.createdBy?.username.localCompare(b.createdBy?.username);
    return 0;
})


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
        {scrapbook?.members?.length > 0 && (
            
    <div className="members-list">{console.log(scrapbook?.members)}
        <h3>Members</h3>
        
        {scrapbook.members.map((member) => (
    <div key={member._id} className="member-item">
        <div className="member-info">
            {member.profilePicture ? (
                <img src={member.profilePicture} alt={member.username} className="member-avatar" />
            ) : (
                <div className="member-avatar-placeholder">
                    {member.username?.charAt(0).toUpperCase()}
                </div>
            )}
            <span>👤 {member.username}</span>
        </div>
        {scrapbook.owner?._id === user?._id && (
            <button
                className="remove-member-btn"
                onClick={() => handleRemoveMember(member._id)}
                disabled={removeMemberId === member._id}
            >
                {removeMemberId === member._id ? 'Removing...' : `Remove ${member.username}`}
            </button>
        )}
    </div>
))}
    </div>
)}
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
                <div className='memories-controls'>
    <input
        type="text"
        className="search-input"
        placeholder="Search memories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        />
        <select 
                className='sort-select' value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                > 
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="author">By Author</option>

                </select>
        </div>
                 {loading ? (
                     <Loader />
                 )  : memories.length === 0 ? (
                    <div className="empty-state">
                        <p>No memories yet. Add your first one! 🌸</p>
                    </div>
                ) : (
                    
                    <div className="memories-grid">
                        {sortedMemory.map((memory) => (
                     
                            <div key={memory._id} className="memory-card">
                                {editingMemory === memory._id ? (
                                <form onSubmit={(e) => handleEditSubmit(e, memory._id)} className='scrap-edt-form'>
                              <input
                             type="text"
                                   value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                               placeholder="Title"
                                 />
                           <input
                           type="text"
                          value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                         placeholder="Description"
                         />
                         <input
                          type="file"
                             accept="image/*"
                           onChange={(e) => setEditImage(e.target.files[0])}
                           />
                              <button type="submit" id='save-btn'disabled={saveMemoryEdit === memory._id}
           > {saveMemoryEdit === memory._id ? 'Saving....' : 'Save'}</button>
                          <button type="button" onClick={() => setEditingMemory(null)}>Cancel</button>
                          </form>
          ) : ( 
            <>
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
                            
                                    <p className="memory-meta">
                                        By {memory.createdBy?.username} • {new Date(memory.createdAt).toLocaleDateString()}
                                        </p>
                              <div className="memory-actions">
                                              <button className="edit-btn" onClick={() => handleEditClick(memory)}   >
                                                          ✏️ Edit 
                                                          </button>
                                                          <button className="delete-btn" onClick={() => handleDeleteMemory(memory._id)} disabled={deletingMemoryId === memory._id}>
                                                              {deletingMemoryId === memory._id ? 'Deleting...' : 'Delete'}
                                                           </button>
                            </div>
                              </>
                             )}
                        </div>
                    ))}
                    
                </div>
             )}
        </div>

            {lightbox && (
    <div className="lightbox" onClick={() => setLightbox(null)}>
        <img src={lightbox} alt="full view" />
        <button
            className="download-btn"
            onClick={(e) => handleDownload(e, lightbox)}
            disabled={downloading}
        >
            {downloading ? 'Downloading...' : ' Download'}
        </button>
    </div>
)}

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

export default ScrapbookPage;