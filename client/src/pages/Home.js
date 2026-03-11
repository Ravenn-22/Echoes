import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getScrapbooks, createScrapbook, deleteScrapbook, updateScrapbook} from '../services/api';
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
     const [creatingScrap, setCreatingScrap] = useState(false);
    const { user , updateProfilePicture} = useAuth();
    const navigate = useNavigate();

     const [deletingScrapId, setDeletingScrapId] = useState(null);
     const [saveScrapEdit, setSaveScrapEdit] = useState(null);

const [loading, setLoading] = useState(false);
const [ cover, setCover] = useState(null);
  const [editingScrapbook,setEditingScrapbook] = useState(null)
    const [editTitle,setEditTitle] = useState("")
    const [editDescription,setEditDescription] = useState("")
    const [editImage,setEditImage] = useState(null);


const [toast, setToast] = useState(null)
const [search, setSearch] = useState("")

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
        setCreatingScrap(true)
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

  
    
    const handleEditClick = (scrapbook) => {
        setEditingScrapbook(scrapbook._id);
        setEditTitle(scrapbook.title);
        setEditDescription(scrapbook.description);
    };

     const handleEditSubmit = async (e, id) => {
       setSaveScrapEdit(id)
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
            }  const updateData = {
                title: editTitle,
                description: editDescription,
                ...(imageUrl && { coverImage: imageUrl })
            };
            const { data } =await updateScrapbook(id, updateData);
            setScrapbooks(scrapbooks.map((m) => m._id === id ? data : m));
            setEditingScrapbook(null);
            setToast({ message: 'Scrapbook updated!', type: 'success'})
        }catch(error){
            setToast({ message: 'Failed to update scrapbook', type: 'error'})
        }finally {
        setSaveScrapEdit(null);
    }
    };

    const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const formData = new FormData();
        formData.append('image', file);

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



    
    return (
        <div className='home-container'>
           
            <nav className="navbar">
                <div className="navbar-logo">ECHOES</div>
                <div className="navbar-user">
                    <span className="navbar-username">Hello, {user?.username}</span>
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
                        <button type="submit" disabled={creatingScrap}>
    {creatingScrap ? 'Creating Scrapbook...' : 'Create Scrapbook'}
</button>
                    </form>
                </div>
            )}

            
            <div className="scrapbooks-section">
                <h2>Your Scrapbooks</h2>
                  <input 
                type='text' className='search-input'
                placeholder='Search Scrapbook...'
                value={search} onChange={(e) => setSearch(e.target.value)}
 
                />
            {loading ? (
                <Loader />
            ) : filteredScrapbook.length === 0 ? (
                    <div className="empty-state">
                        <p>No scrapbooks yet. Create your first one! 🌷</p>
                    </div>
                ) : (
                    <div className="scrapbooks-grid">
                       {filteredScrapbook.map((scrapbook) => (
                        <div key={scrapbook._id} className="scrapbook-card"  >
                          {editingScrapbook === scrapbook._id ? (
                            <form onSubmit={(e) => handleEditSubmit(e, scrapbook._id)} className='scrap-edt-form'>
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
                             <button type="submit" id='save-btn'disabled={saveScrapEdit === scrapbook._id}
           > {saveScrapEdit === scrapbook._id ? 'Saving....' : 'Save'}</button>
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