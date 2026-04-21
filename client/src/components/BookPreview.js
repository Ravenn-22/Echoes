import { useState } from 'react';
import './BookPreview.css';

const BookPreview = ({ scrapbook, memories, dedicationNote, onStyleChange }) => {
    const [previewStyle, setPreviewStyle] = useState('polaroid');
    const [currentPage, setCurrentPage] = useState(0);

    const styles = [
        { id: 'polaroid', label: '📸 Polaroid', description: 'Classic white border with caption' },
        { id: 'magazine', label: '🎨 Magazine', description: 'Full image with text overlay' },
        { id: 'classic', label: '📖 Classic', description: 'Image and text side by side' },
        { id: 'minimal', label: '✨ Minimal', description: 'Clean image with minimal text' }
    ];

    const memoriesWithImages = memories.filter(m => m.image);
    const totalPages = memoriesWithImages.length + 2; // title + memories + closing

    const handleStyleChange = (style) => {
        setPreviewStyle(style);
        onStyleChange(style);
    };

    const renderTitlePage = () => (
        <div className="preview-title-page">
            <h1>{scrapbook?.title || 'Your Scrapbook'}</h1>
            {dedicationNote && <p className="preview-dedication">"{dedicationNote}"</p>}
            <p className="preview-brand">ECHOES · echoesmemo.xyz</p>
        </div>
    );

    const renderClosingPage = () => (
        <div className="preview-closing-page">
            <p className="preview-closing-logo">ECHOES</p>
            <p className="preview-closing-note">
                This book was made with love on Echoes. Every memory in these pages was captured, shared and cherished by the people who matter most to you. Thank you for letting us be part of your story. 🌸
            </p>
            <p className="preview-closing-url">echoesmemo.xyz</p>
        </div>
    );

    const renderMemoryPage = (memory) => {
        switch (previewStyle) {
            case 'polaroid':
                return (
                    <div className="preview-page preview-polaroid">
                        <div className="polaroid-frame">
                            <img src={memory.image} alt={memory.title} />
                            <div className="polaroid-caption">
                                <h3>{memory.title}</h3>
                                {memory.description && <p>{memory.description}</p>}
                                <p className="preview-meta">By {memory.createdBy?.username} • {new Date(memory.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'magazine':
                return (
                    <div className="preview-page preview-magazine">
                        <img src={memory.image} alt={memory.title} />
                        <div className="magazine-overlay">
                            <h3>{memory.title}</h3>
                            {memory.description && <p>{memory.description}</p>}
                            <p className="preview-meta">By {memory.createdBy?.username} • {new Date(memory.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                );
            case 'classic':
                return (
                    <div className="preview-page preview-classic">
                        <div className="classic-image">
                            <img src={memory.image} alt={memory.title} />
                        </div>
                        <div className="classic-text">
                            <h3>{memory.title}</h3>
                            {memory.description && <p>{memory.description}</p>}
                            <p className="preview-meta">By {memory.createdBy?.username}</p>
                            <p className="preview-meta">{new Date(memory.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                );
            case 'minimal':
                return (
                    <div className="preview-page preview-minimal">
                        <img src={memory.image} alt={memory.title} />
                        <h3>{memory.title}</h3>
                        <p className="preview-meta">{new Date(memory.createdAt).toLocaleDateString()}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    const pages = [
        { type: 'title' },
        ...memoriesWithImages.map(m => ({ type: 'memory', memory: m })),
        { type: 'closing' }
    ];

    const currentPageData = pages[currentPage];

    return (
        <div className="book-preview">
            <h3 className="preview-heading">Preview your book</h3>

            <div className="style-toggle">
                {styles.map((style) => (
                    <button
                        key={style.id}
                        className={`style-btn ${previewStyle === style.id ? 'active' : ''}`}
                        onClick={() => handleStyleChange(style.id)}
                    >
                        {style.label}
                    </button>
                ))}
            </div>

            <div className="preview-book">
                {currentPageData.type === 'title' && renderTitlePage()}
                {currentPageData.type === 'memory' && renderMemoryPage(currentPageData.memory)}
                {currentPageData.type === 'closing' && renderClosingPage()}
            </div>

            <div className="preview-navigation">
                <button
                    className="preview-nav-btn"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    ← Prev
                </button>
                <span className="preview-page-count">
                    Page {currentPage + 1} of {pages.length}
                </span>
                <button
                    className="preview-nav-btn"
                    disabled={currentPage === pages.length - 1}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default BookPreview;