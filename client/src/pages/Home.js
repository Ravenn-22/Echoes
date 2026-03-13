import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getScrapbooks, createScrapbook, deleteScrapbook, updateScrapbook, changePassword, getMemories} from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import compressImage from '../compressImage';
import Toast from '../components/Toast'
import axios from 'axios';
import WelcomeModal from '../components/WelcomeModal';
import polaroidImg from "../assets/fonts/undraw_polaroid_qqdz.svg";
import Skeleton from '../components/Skeletonn';


const Home = () => {
    const [scrapbooks, setScrapbooks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(false);
     const [creatingScrap, setCreatingScrap] = useState(false);
    const { user , updateProfilePicture, updateUsername} = useAuth();
    const navigate = useNavigate();
    const [showWelcome, setShowWelcome] = useState(false);

     const [deletingScrapId, setDeletingScrapId] = useState(null);
     const [saveScrapEdit, setSaveScrapEdit] = useState(null);

const [loading, setLoading] = useState(false);
const [ cover, setCover] = useState(null);
  const [editingScrapbook,setEditingScrapbook] = useState(null)
    const [editTitle,setEditTitle] = useState("")
    const [editDescription,setEditDescription] = useState("")
    const [editImage,setEditImage] = useState(null);
    const [sortBy, setSortBy] = useState("newest")
    const [editingUsername, setEditingUsername] = useState(false);
const [newUsername, setNewUsername] = useState('');
const [showChangePassword, setShowChangePassword] = useState(false);
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [changingPassword, setChangingPassword] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
const [scrapbookMemories, setScrapbookMemories] = useState([]);
const [showMemoryPicker, setShowMemoryPicker] = useState(false);

const [toast, setToast] = useState(null)
const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchScrapbooks = async () => {
    try {
        setLoading(true);
        const { data } = await getScrapbooks();
        setScrapbooks(data);
        setLoading(false);
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
            if (!hasSeenWelcome && data.length === 0) {
                setShowWelcome(true);
            }
    } catch (error) {
        console.log(error);
        setLoading(false);
    }
};
        fetchScrapbooks();
    }, []);

    const handleCloseWelcome = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
};

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreatingScrap(true)
        try {
            let coverImage = '';
            if(cover) {
                const compressed = await compressImage(cover);
                const formData = new FormData();
                formData.append('image', compressed);

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
            console.log("Scrapbook Created")
            setToast({ message: 'Scrapbook created successfully! 🎉', type: 'success' });
        } catch (error) {
            setToast({message: 'Failed to create Scrapbook', type:'error'});
            console.log("Scrapbook creation error:", error.response?.data || error);
        }finally {
        setCreatingScrap(false);
    }
    };
const handleDelete = async (id) => {
    setDeletingScrapId(id);
        try {
            await deleteScrapbook(id);
            setScrapbooks(scrapbooks.filter((s) => s._id !== id));
            setToast({ message: 'Scrapbook deleted!', type: 'success' });
        } catch (error) {
           setToast({ message: 'Failed to delete scrapbook', type: 'error' });
        }finally {
        setDeletingScrapId(null);
    }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate('/', {replace: true });
       
    };
    const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
        await updateUsername(newUsername);
        setEditingUsername(false);
        setToast({ message: 'Username updated! 🌸', type: 'success' });
    } catch (error) {
        setToast({ message: error.response?.data?.message || 'Failed to update username', type: 'error' });
    }
};
  
    
    const handleEditClick = (scrapbook) => {
        setEditingScrapbook(scrapbook._id);
        setEditTitle(scrapbook.title);
       setEditDescription(scrapbook.description);
    setShowMemoryPicker(false);
    
    getMemories(scrapbook._id).then(({ data }) => {
        setScrapbookMemories(data.filter((m) => m.image));
    }).catch(() => {});
    };

     const handleEditSubmit = async (e, id) => {
    setSaveScrapEdit(id);
    e.preventDefault();
    try {
        let coverImage = undefined;

        if (editImage) {
            if (typeof editImage === 'string') {
                coverImage = editImage;
            } else {
                const formData = new FormData();
                formData.append('image', editImage);

                const user = JSON.parse(localStorage.getItem('user'));
                const { data } = await axios.post('https://echoes-j0mn.onrender.com/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}`
                    }
                });
                coverImage = data.imageUrl;
            }
        }

        const updateData = {
            title: editTitle,
            description: editDescription,
            ...(coverImage && { coverImage })
        };

        const { data } = await updateScrapbook(id, updateData);
        setScrapbooks(scrapbooks.map((m) => m._id === id ? data : m));
        setEditingScrapbook(null);
        setToast({ message: 'Scrapbook updated!', type: 'success' });
    } catch (error) {
        setToast({ message: 'Failed to update scrapbook', type: 'error' });
    } finally {
        setSaveScrapEdit(null);
    }
};

    const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const compressed = await compressImage(file);
                const formData = new FormData();
                formData.append('image', compressed);
        

        const storedUser = JSON.parse(localStorage.getItem('user'));
        const { data } = await axios.post('https://echoes-j0mn.onrender.com/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${storedUser.token}`
            }
        });

        await updateProfilePicture(data.imageUrl);
        setToast({ message: 'Profile picture updated! 🌸', type: 'success' });
    } catch (error) {
        setToast({ message: 'Failed to update profile picture', type: 'error' });
    }
};

        
 const filteredScrapbook = scrapbooks.filter((scrapbook) =>
    scrapbook.title.toLowerCase().includes(search.toLowerCase()) ||
    scrapbook.description.toLowerCase().includes(search.toLowerCase())
);
const sortedScrapbook = [...filteredScrapbook].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'author') return a.createdBy?.username.localCompare(b.createdBy?.username);
    return 0;
})

const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
        await changePassword(currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setShowChangePassword(false);
        setToast({ message: 'Password changed successfully! 🌸', type: 'success' });
    } catch (error) {
        setToast({ message: error.response?.data?.message || 'Failed to change password', type: 'error' });
    } finally {
        setChangingPassword(false);
    }
};



    
    return (
        <div className='home-container'>
           
            <nav className="navbar">
    <div className="navbar-logo">ECHOES</div>
    <div className="navbar-user">
        
        {editingUsername ? (
            <form onSubmit={handleUpdateUsername} className='change-username-form'>
                <input
                    type="text"
                    placeholder="New username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="username-input"
                />
                <button type="submit" className="save-username-btn">Save</button>
                <button type="button" className="cancel-username-btn" onClick={() => setEditingUsername(false)}>Cancel</button>
            </form>
        ) : (
            <span className="navbar-username" onClick={() => { setEditingUsername(true); setNewUsername(user?.username); }} style={{ cursor: 'pointer' }}>
              Hello,  {user?.username} 
            </span>
        )}
        <div className="profile-pic-container">
            <label htmlFor="profile-upload" style={{ cursor: 'pointer' }}>
                {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="profile" className="profile-pic" />
                ) : (
                    <div className="profile-pic-placeholder">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                )}
            </label>
            <input
                id="profile-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePicUpload}
            />
        </div>
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
        </div>
        {menuOpen && (
            <div className="hamburger-menu">
                <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
                <button className="change-password-btn" 
                onClick={() => { setShowChangePassword(!showChangePassword); 
                setMenuOpen(false); }}>🔒 Change Password</button>
            </div>
        )}
    </div>
</nav>

{showChangePassword && (
    <div className="change-password-form">
        <form onSubmit={handleChangePassword}>
            <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="submit" disabled={changingPassword}>
                {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
            <button type="button" className="cancel-password-btn" onClick={() => setShowChangePassword(false)}>Cancel</button>
        </form>
    </div>
)}

            <div className="hero">
                <h1>Your Memories </h1>

                <p>Capture and cherish every beautiful moment</p>
              
                <button className="create-btn" onClick={() => setShowForm(!showForm)}>
                    + Create Scrapbook
                </button>

            </div>  {showForm && (
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
                        <button type="submit" disabled={creatingScrap}>
    {creatingScrap ? 'Creating Scrapbook...' : 'Create Scrapbook'}
</button>
                    </form>
                </div>
            )} <div className="scrapbooks-section">
                <h2>Your Scrapbooks</h2>
                  <div className='scrapbooks-controls'>
                  <input 
                type='text' className='search-input'
                placeholder='Search Scrapbook...'
                value={search} onChange={(e) => setSearch(e.target.value)}
 
                /> <select 
                className='sort-select' value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                > 
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="author">By Author</option>

                </select>
                </div>
            {loading ? (
               <Skeleton count={6} />
            ) : filteredScrapbook.length === 0 ? (
                   <div className="empty-state">
    <img src={polaroidImg} alt="No scrapbooks yet" className="empty-state-img" />
    <h2>Your story starts here 🌸</h2>
    <p>Create your first scrapbook and start capturing the moments that matter most.</p>
    <button className="create-btn" onClick={() => setShowForm(true)}>
        + Create your first scrapbook
    </button>
</div>
                ) : (
                    <div className="scrapbooks-grid">
                       {sortedScrapbook.map((scrapbook) => (
                        <div key={scrapbook._id} className="scrapbook-card"  >
                          {editingScrapbook === scrapbook._id ? (
                            <form onSubmit={(e) => handleEditSubmit(e, scrapbook._id)} className='scrap-edt-form'>
                                   <input
                                   type="text"
                                    value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title"
                                     />
                                     <input type="text" value={editDescription}  onChange={(e) => setEditDescription(e.target.value)}
                                      placeholder="Description" />
                                     <input type="file" accept="image/*"  onChange={(e) => setEditImage(e.target.files[0])} />
                                     <button  type="button" className="pick-memory-btn" id='pick-memory-btn' onClick={() => setShowMemoryPicker(!showMemoryPicker)} >
                                         🖼️ Pick from memories
                                     </button>
          {showMemoryPicker && (
             <div className="memory-picker" id='memory-picker'>
                {scrapbookMemories.length === 0 ? (
                    <p>No memories with images yet</p>
                ) : (
                scrapbookMemories.map((memory) => (
                    <img
                        key={memory._id}
                        src={memory.image}
                        alt={memory.title}
                        className={`memory-picker-img ${editImage === memory.image ? 'selected' : ''}`}
                        onClick={() => {
                            setEditImage(memory.image);
                            setShowMemoryPicker(false);
                        }}
                    />
                ))
            )}
        </div>
    )}
    <button type="submit" id='save-btn' disabled={saveScrapEdit === scrapbook._id}>
        {saveScrapEdit === scrapbook._id ? 'Saving....' : 'Save'}
    </button>
    <button type="button" onClick={() => setEditingScrapbook(null)}>Cancel</button>
</form>
          ) : ( 
            <>
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
                <span>📸 {scrapbook.memoryCount} memories</span>
            </div>
   
         <div className="scrapook-actions">
           <button className="edit-btn" onClick={(e) => {  e.stopPropagation(); handleEditClick(scrapbook)} }  > ✏️ Edit </button>

             <button
            className="delete-btn"
            onClick={(e) => {
                e.stopPropagation();
                handleDelete(scrapbook._id);
            }}
            disabled={deletingScrapId === scrapbook._id}
           >
             {deletingScrapId === scrapbook._id ? 'Deleting...' : 'Delete'}
            </button>
           </div>
        </div>
         </>
       )}
       
        </div>
        
    ))}
</div>
   )}
            </div>
            {showWelcome && (
    <WelcomeModal
        username={user?.username}
        onClose={handleCloseWelcome}
    />
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

export default Home;