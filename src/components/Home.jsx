import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <section className="hero-section premium-container">
            <div className="hero-badge">Next-Gen Decision Intelligence</div>
            <h1 className="hero-title">
                Decrypt Your <span className="highlight">Future</span>
            </h1>
            <p className="hero-subtitle">
                An AI-powered career architect designed to map your cognitive potential to high-impact career paths.
            </p>
            <div className="hero-actions">
                <button className="cta-button" onClick={() => navigate('/start')}>
                    Start Assessment
                </button>
                <button className="secondary-button" onClick={() => navigate('/about')}>
                    Learn More
                </button>
            </div>
        </section>
    );
};

export default Home;
