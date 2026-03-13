import { useNavigate } from "react-router-dom";
import './NotFound.css'
import notFoundImg from "../assets/fonts/undraw_page-not-found_6wni.svg";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="notfound-container">
            <div className="notfound-content">
                <img src={notFoundImg} alt="Page not found" className="notfound-img" />
                
                <p className="notfound-subtitle">Oops! This memory doesn't exist 🌸</p>
                <p className="notfound-text">The page you're looking for has faded away like an old photograph.</p>
                <button className="notfound-btn" onClick={() => navigate('/')}>
                    Take me home
                </button>
            </div>
        </div>
    );
};

export default NotFound;