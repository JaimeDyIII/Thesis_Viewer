import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import { ShieldCheck, Glasses, ChartNoAxesCombined } from 'lucide-react';
import GoogleIcon from "@mui/icons-material/Google";

const HomePage: React.FC = () => {
    const navigate = useNavigate();
  
    return (
    <div className="homepage">
      <header className="navbar">
        <div className="logo">
          <img src="favicon.ico" alt="logo" className="favicon" />
          ThesisViewer
        </div>
      </header>
    
      <main className="content-wrapper">
        <section className="main-section">
            <div className="text-section">
            <h1>
                Discover, Retrieve,<br />and Build Upon NEU's Academic Legacy
            </h1>
            <p>
                Thesis Viewer provides a smart, secure, and accessible platform for managing
                research, powered by knowledge and innovation.
            </p>
            <button className="get-started-btn" onClick={() => navigate('/login')}>
                <GoogleIcon className="google-icon" />
                Get Started with Google
            </button>
            </div>
            <div className="image-section">
            <img src="book-image.png" alt="Stack of thesis books" />
            </div>
        </section>

        <section className="features">
            <div className="feature-card">
                <ShieldCheck className="icon" />
                <h3>Secure Viewing</h3>
                <p>Access theses in a secure, read-only format. Downloads are disabled to protect research.</p>
            </div>
            <div className="feature-card">
                <ChartNoAxesCombined className="icon" />
                <h3>Track & Bookmark</h3>
                <p>Bookmark theses, see view counts, and track popular research trends.</p>
            </div>
            <div className="feature-card">
                <Glasses className="icon" />
                <h3>ThessaAI Assistant</h3>
                <p>Get thesis summaries, research suggestions, and ask questions through our AI chatbot.</p>
            </div>
            </section>
      </main>

      <footer className="footer">
      <div className="footer-logo">
        <div className="logo-row">
            <img src="favicon.ico" alt="logo" className="favicon" />
            <span>ThesisViewer</span>
        </div>
        <div className="footer-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
        </div>
        </div>
        <div>© 2025 NEU Thesis Viewer. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default HomePage;