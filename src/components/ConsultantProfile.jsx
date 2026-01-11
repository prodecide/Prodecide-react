import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ConsultantProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [consultant, setConsultant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConsultant = async () => {
            try {
                const response = await fetch(`/api/consultants?id=${id}`);
                if (!response.ok) {
                    throw new Error('Consultant not found');
                }
                const data = await response.json();
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
        <div className="consultant-profile-view premium-container">
            <button className="back-button" onClick={() => navigate('/consultants')}>
                ← Back to Experts
            </button>

            <div className="profile-header">
                <div className="profile-badge-large">{consultant.name?.charAt(0)}</div>
                <div className="profile-title-block">
                    <h1 className="profile-name">{consultant.name}</h1>
                    <span className="profile-role">{consultant.role}</span>
                    <div className="profile-meta-tags">
                        {consultant.experience && <span className="meta-tag">{consultant.experience} Years Exp</span>}
                        {consultant.location && <span className="meta-tag">{consultant.location}</span>}
                    </div>
                </div>
            </div>

            <div className="profile-content-grid">
                <div className="profile-section main-bio">
                    <h3>Professional Bio</h3>
                    <p>{consultant.bio}</p>
                </div>

                <div className="profile-sidebar">
                    <div className="profile-section">
                        <h3>Expertise</h3>
                        <div className="expertise-pill">{consultant.role || consultant.expertise}</div>
                    </div>

                    {consultant.motivation && (
                        <div className="profile-section">
                            <h3>Motivation</h3>
                            <p className="motivation-text">"{consultant.motivation}"</p>
                        </div>
                    )}

                    <div className="profile-actions">
                        <button className="cta-button full-width" onClick={() => alert('Booking system coming soon!')}>
                            Book a Consultation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultantProfile;
