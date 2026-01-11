import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';
import './ConsultantProfile.css';

const ConsultantProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [consultant, setConsultant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        const fetchConsultant = async () => {
            try {
                // Determine if we need to fetch specific ID or just simulate for demo/fallback
                let data = null;

                // If it's a demo/test ID like 'demo' or undefined (though route requires ID), fallback
                if (id === 'demo') {
                    data = {
                        name: "Dr. Aris V.",
                        role: "Strategic Career Analyst",
                        bio: "Expert in mapping psychological patterns to future-proof career paths.",
                        experience: 12,
                        location: "San Francisco, CA",
                        expertise: "Career Coaching",
                        motivation: "Helping people find their true calling.",
                        email: "aris.v@example.com",
                        linkedin: "https://linkedin.com"
                    };
                } else {
                    const response = await fetch(`/api/consultants?id=${id}`);
                    if (!response.ok) {
                        // Check if it's because of invalid ID format (local fallback support if needed)
                        if (response.status === 400 || response.status === 404) {
                            // Fallback for demo purposes if DB fetch fails or ID is "demo"
                            // (Already handled 'demo' above, but legitimate fetch errors land here)
                            throw new Error('Consultant not found');
                        }
                        throw new Error('Consultant not found');
                    }
                    data = await response.json();
                }
                setConsultant(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchConsultant();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="premium-container loading-state">
                <div className="loading-spinner"></div>
                <p>Decrypting Profile Data...</p>
            </div>
        );
    }

    if (error || !consultant) {
        return (
            <div className="premium-container error-state">
                <h2>Profile Not Found</h2>
                <button className="cta-button" onClick={() => navigate('/consultants')}>
                    Return to Network
                </button>
            </div>
        );
    }

    return (
        <div className="profile-dashboard-container">
            <button className="back-link-simple" onClick={() => navigate('/consultants')}>
                ← Back
            </button>

            <div className="profile-layout">
                {/* Sidebar */}
                <aside className="profile-sidebar-card">
                    <div className="profile-image-placeholder">
                        {/* Placeholder Image / Initials */}
                        <div className="placeholder-avatar">
                            {consultant.name ? consultant.name.charAt(0) : 'U'}
                        </div>
                        <div className="camera-icon-badge">📷</div>
                    </div>

                    <h2 className="sidebar-name">{consultant.name}</h2>
                    <p className="sidebar-role">{consultant.role}</p>

                    <div className="sidebar-stats">
                        <div className="stat-row">
                            <span className="stat-label">Exp</span>
                            <span className="stat-value">{consultant.experience || 0} Yrs</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">Location</span>
                            <span className="stat-value">{consultant.location || 'Remote'}</span>
                        </div>
                    </div>

                    <div className="sidebar-actions">
                        <button className="cta-button full-width" onClick={() => alert('Booking system coming soon!')}>
                            Book a Consultation
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="profile-main-content">
                    <div className="profile-tabs">
                        <button
                            className={`profile-tab ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Profile Details
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'feedback' ? 'active' : ''}`}
                            onClick={() => setActiveTab('feedback')}
                        >
                            Consultation Feedback
                        </button>
                    </div>

                    <div className="profile-tab-content">
                        {activeTab === 'details' ? (
                            <div className="details-grid">
                                <div className="detail-group full-width">
                                    <label>Professional Bio</label>
                                    <div className="detail-value text-block">{consultant.bio}</div>
                                </div>
                                <div className="detail-group">
                                    <label>Expertise</label>
                                    <div className="detail-value">{consultant.role || consultant.expertise}</div>
                                </div>
                                <div className="detail-group">
                                    <label>Email</label>
                                    <div className="detail-value">{consultant.email || 'N/A'}</div>
                                </div>
                                <div className="detail-group full-width">
                                    <label>Motivation</label>
                                    <div className="detail-value">"{consultant.motivation}"</div>
                                </div>
                                <div className="detail-group full-width">
                                    <label>LinkedIn</label>
                                    <div className="detail-value">
                                        {consultant.linkedin ? (
                                            <a href={consultant.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
                                                {consultant.linkedin}
                                            </a>
                                        ) : 'Not provided'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="feedback-view">
                                <div className="feedback-placeholder">
                                    <div className="placeholder-icon">💬</div>
                                    <h3>No Feedback Yet</h3>
                                    <p>Reviews from recent consultations will appear here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ConsultantProfile;
