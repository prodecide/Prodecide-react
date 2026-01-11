import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Consultants = () => {
    const [consultants, setConsultants] = useState([]);

    useEffect(() => {
        fetchConsultants();
    }, []);

    const fetchConsultants = async () => {
        try {
            const response = await fetch('/api/consultants');
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                setConsultants(data);
            } else {
                setConsultants([
                    {
                        name: "Dr. Aris V.",
                        role: "Strategic Career Analyst",
                        bio: "Expert in mapping psychological patterns to future-proof career paths."
                    },
                    {
                        name: "Neo Spectra",
                        role: "Digital Systems Guide",
                        bio: "Specializes in technology shifts and emerging high-impact markets."
                    },
                    {
                        name: "Trinity M.",
                        role: "Aptitude Architect",
                        bio: "Focuses on unlocking latent cognitive potential through logic training."
                    }
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch consultants:', error);
        }
    };

    return (
        <div className="tab-content consultants-view premium-container">
            <div className="sub-nav">
                <NavLink
                    to="/consultants"
                    className={({ isActive }) => `sub-tab ${isActive ? 'active' : ''}`}
                    end
                >
                    All Experts
                </NavLink>
                <NavLink
                    to="/join-network"
                    className={({ isActive }) => `sub-tab ${isActive ? 'active' : ''}`}
                >
                    Join Network
                </NavLink>
            </div>

            <div className="consultants-grid">
                {consultants.map((c, i) => (
                    <div key={i} className="consultant-card">
                        <div className="card-glitch-overlay"></div>
                        <h3 className="consultant-name">{c.name}</h3>
                        <span className="consultant-role">{c.role}</span>
                        <div className="consultant-meta">
                            {c.experience && <span className="meta-tag">{c.experience} Years Exp</span>}
                            {c.location && <span className="meta-tag">{c.location}</span>}
                        </div>
                        <p className="consultant-bio">{c.bio}</p>
                        {c.linkedin && (
                            <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                                View Profile →
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Consultants;
