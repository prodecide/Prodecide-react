import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const JoinNetwork = () => {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        expertise: '',
        experience: '',
        role: '',
        bio: '',
        linkedin: '',
        motivation: ''
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const newConsultant = {
            ...formData,
            name: formData.fullName,
            role: formData.expertise,
            bio: formData.bio
        };

        try {
            const response = await fetch('/api/consultants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConsultant)
            });

            if (response.ok) {
                setFormSubmitted(true);
            } else {
                console.error('Failed to save consultant');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
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

            <div className="join-us-section">
                {formSubmitted ? (
                    <div className="form-success-message">
                        <div className="success-icon">✓</div>
                        <h3 className="section-title">Application Received</h3>
                        <p className="section-text">We’ll review and get back to you.</p>
                        <button
                            className="cta-button mini"
                            onClick={() => { setFormSubmitted(false); setFormData({ fullName: '', email: '', phone: '', location: '', expertise: '', experience: '', role: '', bio: '', linkedin: '', motivation: '' }) }}
                        >
                            Apply Again
                        </button>
                    </div>
                ) : (
                    <form className="consultant-form" onSubmit={handleFormSubmit}>
                        <h3 className="section-title">Join as a Consultant</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleFormChange} required placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleFormChange} required placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} required placeholder="+1 234 567 890" />
                            </div>
                            <div className="form-group">
                                <label>City / Country</label>
                                <input type="text" name="location" value={formData.location} onChange={handleFormChange} required placeholder="New York, USA" />
                            </div>
                            <div className="form-group full-width">
                                <label>Area of Expertise</label>
                                <select name="expertise" value={formData.expertise} onChange={handleFormChange} required>
                                    <option value="">Select Expertise</option>
                                    <option value="Career Coaching">Career Coaching</option>
                                    <option value="Tech Mentoring">Tech Mentoring</option>
                                    <option value="Aptitude Training">Aptitude Training</option>
                                    <option value="HR & Recruitment">HR & Recruitment</option>
                                    <option value="Strategic Planning">Strategic Planning</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Years of Experience</label>
                                <input type="number" name="experience" value={formData.experience} onChange={handleFormChange} required placeholder="5" />
                            </div>
                            <div className="form-group">
                                <label>Current Role / Profession</label>
                                <input type="text" name="role" value={formData.role} onChange={handleFormChange} required placeholder="Senior Developer" />
                            </div>
                            <div className="form-group full-width">
                                <label>Short Bio (2–3 lines)</label>
                                <textarea name="bio" value={formData.bio} onChange={handleFormChange} required placeholder="Tell us about your professional journey..." rows="3" />
                            </div>
                            <div className="form-group full-width">
                                <label>LinkedIn / Portfolio link</label>
                                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleFormChange} required placeholder="https://linkedin.com/in/username" />
                            </div>
                            <div className="form-group full-width">
                                <label>Why do you want to join Prodecide? (one line)</label>
                                <input type="text" name="motivation" value={formData.motivation} onChange={handleFormChange} required placeholder="I want to help people make better career choices." />
                            </div>
                        </div>
                        <button type="submit" className="cta-button submit-form-btn">Submit Application</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default JoinNetwork;
