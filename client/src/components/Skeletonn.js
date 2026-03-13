import './Skeletonn.css';

const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-meta"></div>
        </div>
    );
};

const Skeleton = ({ count = 3 }) => {
    return (
        <div className="skeleton-grid">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
};

export default Skeleton;