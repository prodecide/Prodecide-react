import React from 'react';
import { Link } from 'react-router-dom';

const PersonaSelection = ({ onSelect }) => {
    return (
        <div className="persona-selection-view premium-container">
            <Link to="/" className="home-link-corner" title="Back to Home">
                <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>⌂</span> Home
            </Link>
            <h1 className="persona-title">Select Your Path</h1>

            <div className="persona-options">
                {/* Career Decision */}
                <div className="persona-card" onClick={() => onSelect('career')}>
                    <div className="icon-circle">💼</div>
                    <h3>Career Architect</h3>
                    <p>Map your cognitive blueprint to high-impact career trajectories and academic milestones.</p>
                </div>

                {/* Personal Decision */}
                <div className="persona-card">
                    <div className="icon-circle">🧠</div>
                    <h3>Life Strategy</h3>
                    <p>Optimize personal growth, relationship dynamics, and daily cognitive performance.</p>
                </div>

                {/* Business Decision */}
                <div className="persona-card">
                    <div className="icon-circle">📈</div>
                    <h3>Business Intel</h3>
                    <p>Leverage AI analysis for market entry, strategic pivots, and operational efficiency.</p>
                </div>
            </div>
        </div>
    );
};

export default PersonaSelection;
