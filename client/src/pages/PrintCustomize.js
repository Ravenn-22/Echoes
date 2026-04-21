import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PrintCustomize.css';
import {  getMemories, initializePayment } from '../services/api';
import axios from 'axios';
import compressImage from '../compressImage';
import {getData} from 'country-list';
import {useAuth} from '../context/AuthContext';
import BookPreview from '../components/BookPreview';




const PrintCustomize = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [memoriesCount, setMemoriesCount] = useState(0);
    const [loadingMemories, setLoadingMemories] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
const [allMemories, setAllMemories] = useState([]);
const [bookStyle, setBookStyle] = useState('polaroid');

const [customCover, setCustomCover] = useState(null);
    const [step, setStep] = useState(1);
    const [dedicationNote, setDedicationNote] = useState('');
    const [coverStyle, setCoverStyle] = useState('classic');
    const [bookSize, setBookSize] = useState('standard');
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
    });
    const [loading, setLoading] = useState(false);

    const prices = {
        small: 35,
        standard: 50,
        premium: 65
    };

    const handleAddressChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };
   useEffect(() => {
    const fetchMemories = async () => {
        try {
            setLoadingMemories(true);
            const { data } = await getMemories(id, 1);
            const total = data.totalPages || 1;
            
            let allMemories = data.memories || [];
            
           
            if (total > 1) {
                for (let page = 2; page <= total; page++) {
                    const { data: pageData } = await getMemories(id, page);
                    allMemories = [...allMemories, ...(pageData.memories || [])];
                }
            }
            
            setMemoriesCount(allMemories.filter(m => m.image).length);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingMemories(false);
        }
    };
    fetchMemories();
}, [id]);
useEffect(() => {
    const fetchAllMemories = async () => {
        try {
            const { data } = await getMemories(id, 1);
            let memories = data.memories || [];
            if (data.totalPages > 1) {
                for (let page = 2; page <= data.totalPages; page++) {
                    const { data: pageData } = await getMemories(id, page);
                    memories = [...memories, ...(pageData.memories || [])];
                }
            }
            setAllMemories(memories);
        } catch (error) {
            console.log(error);
        }
    };
    fetchAllMemories();
}, [id]);
 
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        let customCoverUrl = '';
        if (customCover) {
            const compressed = await compressImage(customCover);
            const formData = new FormData();
            formData.append('image', compressed);

            const storedUser = JSON.parse(localStorage.getItem('user'));
            const { data } = await axios.post('https://echoes-j0mn.onrender.com/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${storedUser.token}`
                }
            });
            customCoverUrl = data.imageUrl;
        }
        const nairaPrices = {
            small:52500,
            standard:75000,
            premium:97500
        }
         const { data: paymentData } = await initializePayment(
            user.email,
            nairaPrices[bookSize],
            `print_${bookSize}`
        );

             localStorage.setItem('pendingPrintOrder', JSON.stringify({
            scrapbookId: id,
            dedicationNote,
            coverStyle,
            bookSize,
            bookStyle,
            shippingAddress,
            customCoverUrl
        }));
             window.location.href = paymentData.data.authorization_url;
 
    } catch (error) {
        console.log(error);
        alert('Failed to create print order. Please try again.');
    } finally {
        setLoading(false);
    }
};

const countries = getData();

    return (
        <div className="print-container">
            <nav className="navbar">
                <div className="navbar-logo" onClick={() => navigate('/home')}>ECHOES</div>
                <button className="back-btn" onClick={() => navigate(`/scrapbook/${id}`)}>← Back</button>
            </nav>

            <div className="print-content">
                <h1 className="print-title">Print Your Scrapbook 📖</h1>
                <p className="print-subtitle">Turn your digital memories into a beautiful hardcover book</p>
                {memoriesCount < 22 && !loadingMemories && (
    <div className="min-page-warning">
        ⚠️ You need at least 22 memories with images to print a book. You currently have {memoriesCount}. Add more memories to your scrapbook first!
    </div>
)}

                <div className="print-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Customize <button
    type="button"
    className="preview-toggle-btn"
    onClick={() => setShowPreview(!showPreview)}
>
    {showPreview ? '👁️ Hide Preview' : '👁️ Preview your book'}
</button>

{showPreview && (
    <BookPreview
        scrapbook={{ title: 'Your Scrapbook' }}
        memories={allMemories}
        dedicationNote={dedicationNote}
        onStyleChange={(style) => setBookStyle(style)}
    />
)}</div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Shipping</div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Review & Pay</div>
                </div>

                {step === 1 && (
                    <div className="print-step-content">
                        <div className="print-section">
                            <h3>Dedication Note</h3>
                            <p className="print-hint">Write a personal message for the first page of your book</p>
                            <textarea
                                className="dedication-input"
                                placeholder="e.g. To my family, with love..."
                                value={dedicationNote}
                                onChange={(e) => setDedicationNote(e.target.value)}
                                maxLength={300}
                            />
                            <p className="char-count">{dedicationNote.length}/300</p>
                        </div>

                        <div className="print-section">
                            <h3>Cover Style</h3>
                            <div className="options-grid">
    {['classic', 'modern', 'minimal'].map((style) => (
        <div
            key={style}
            className={`option-card ${coverStyle === style ? 'selected' : ''}`}
            onClick={() => setCoverStyle(style)}
        >
            <span className="option-icon">
                {style === 'classic' ? '📔' : style === 'modern' ? '📒' : '📓'}
            </span>
            <p>{style.charAt(0).toUpperCase() + style.slice(1)}</p>
        </div>
    ))}
    <div
        className={`option-card ${coverStyle === 'custom' ? 'selected' : ''}`}
        onClick={() => setCoverStyle('custom')}
    >
        <span className="option-icon">🖼️</span>
        <p>Custom</p>
        <p style={{ fontSize: '0.75rem', color: '#8B6F61' }}>Upload your own</p>
    </div>
</div>

{coverStyle === 'custom' && (
    <div className="custom-cover-upload">
        <input
            type="file"
            accept="image/*"
            id="cover-upload"
            style={{ display: 'none' }}
            onChange={(e) => setCustomCover(e.target.files[0])}
        />
        <label htmlFor="cover-upload" className="cover-upload-label">
            {customCover ? (
                <img src={URL.createObjectURL(customCover)} alt="custom cover" className="cover-preview" />
            ) : (
                <span>Click to upload cover image</span>
            )}
        </label>
    </div>
)}
                        </div>

                        <div className="print-section">
                            <h3>Book Size</h3>
                            <div className="options-grid">
                                <div
                                    className={`option-card ${bookSize === 'small' ? 'selected' : ''}`}
                                    onClick={() => setBookSize('small')}
                                >
                                    <span className="option-icon">📗</span>
                                    <p>Small</p>
                                    <p className="option-price">$35</p>
                                    <p className="option-desc">25 pages · A5</p>
                                </div>
                                <div
                                    className={`option-card ${bookSize === 'standard' ? 'selected' : ''}`}
                                    onClick={() => setBookSize('standard')}
                                >
                                    <span className="option-icon">📘</span>
                                    <p>Standard</p>
                                    <p className="option-price">$50</p>
                                    <p className="option-desc">40 pages · A4</p>
                                </div>
                                <div
                                    className={`option-card ${bookSize === 'premium' ? 'selected' : ''}`}
                                    onClick={() => setBookSize('premium')}
                                >
                                    <span className="option-icon">📙</span>
                                    <p>Premium</p>
                                    <p className="option-price">$65</p>
                                    <p className="option-desc">60 pages · A4</p>
                                </div>
                                
                            </div>
                        </div>

                       <button  className="print-next-btn"  onClick={() => setStep(2)} 
                       disabled={memoriesCount < 22}>
                       Next: Shipping Details → 
                       </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="print-step-content">
                        <div className="print-section">
                            <h3>Shipping Address</h3>
                            <div className="address-form">
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={shippingAddress.fullName}
                                    onChange={handleAddressChange}
                                />
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Street Address"
                                    value={shippingAddress.address}
                                    onChange={handleAddressChange}
                                />
                                <div className="address-row">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={shippingAddress.city}
                                        onChange={handleAddressChange}
                                    />
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="State"
                                        value={shippingAddress.state}
                                        onChange={handleAddressChange}
                                    />
                                </div>
                                <div className="address-row">
                                    <select
                                    name='country' 
                                    value={shippingAddress.country}
                                    onChange={handleAddressChange}
                                    className='address-select'
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((country) => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        placeholder="Zip/Postal Code"
                                        value={shippingAddress.zipCode}
                                        onChange={handleAddressChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="step-buttons">
                            <button className="print-back-btn" onClick={() => setStep(1)}>← Back</button>
                            <button className="print-next-btn" onClick={() => setStep(3)}>Next: Review & Pay →</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="print-step-content">
                        <div className="print-section">
                            <h3>Order Summary</h3>
                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Book Size</span>
                                    <span>{bookSize.charAt(0).toUpperCase() + bookSize.slice(1)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Cover Style</span>
                                    <span>{coverStyle.charAt(0).toUpperCase() + coverStyle.slice(1)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping to</span>
                                    <span>{shippingAddress.city}, {shippingAddress.country}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Dedication Note</span>
                                    <span>{dedicationNote ? '✅ Added' : '❌ None'}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>${prices[bookSize]}</span>
                                </div>
                            </div>
                        </div>

                        <div className="step-buttons">
                            <button className="print-back-btn" onClick={() => setStep(2)}>← Back</button>
                            <button
                                className="print-pay-btn"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : `Pay $${prices[bookSize]}`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrintCustomize;