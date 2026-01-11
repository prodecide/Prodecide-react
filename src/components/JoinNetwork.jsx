import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './JoinNetwork.css';

const EXPERTISE_OPTIONS = [
    {
        category: "Healthcare & Medicine",
        options: ["Medicine (MBBS / MD / Specializations)", "Allied Healthcare (Physio, Nursing, Pharmacy)", "Mental Health & Psychology"]
    },
    {
        category: "Aviation & Aerospace",
        options: ["Pilot (Commercial / Defense)", "Aerospace Engineering", "Aviation Operations & Safety"]
    },
    {
        category: "Defense & Uniformed Services",
        options: ["Indian Army", "Indian Navy", "Indian Air Force", "Paramilitary / CAPF", "Defense Strategy & Training"]
    },
    {
        category: "Civil Services & Government",
        options: ["Civil Services (UPSC / State PSC)", "Government Jobs (SSC, Banking, PSU)", "Public Policy & Administration"]
    },
    {
        category: "Education & Teaching",
        options: ["Teaching & Academia", "School Education", "Higher Education & Research", "Career Counseling"]
    },
    {
        category: "Sports, Fitness & Physical Training",
        options: ["Fitness & Strength Training", "Sports Coaching", "Martial Arts (Karate, Taekwondo, MMA, etc.)", "Yoga & Wellness"]
    },
    {
        category: "Engineering & Technology",
        options: ["Software Engineering", "Data Science & AI", "Core Engineering", "Robotics & Emerging Tech"]
    },
    {
        category: "Business & Management",
        options: ["Product Management", "Business Strategy", "Consulting", "Entrepreneurship & Startups", "Finance & Banking"]
    },
    {
        category: "Creative & Communication",
        options: ["Design (UI/UX, Graphic)", "Content & Media", "Public Speaking & Communication"]
    },
    {
        category: "Law & Public Services",
        options: ["Law & Legal Practice", "Judiciary Preparation"]
    },
    {
        category: "Trades & Alternative Careers",
        options: ["Skilled Trades & Vocational Careers", "Defence Coaching Institutes"]
    },
    {
        category: "Other",
        options: ["Other"]
    }
];

const MultiSelectDropdown = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (option) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    const removeTag = (e, option) => {
        e.stopPropagation();
        onChange(selected.filter(item => item !== option));
    };

    const filteredGroups = EXPERTISE_OPTIONS.map(group => ({
        ...group,
        options: group.options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(group => group.options.length > 0);

    return (
        <div className="custom-dropdown-container" ref={dropdownRef}>
            <div className={`dropdown-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {selected.length > 0 ? (
                    <div className="selected-tags">
                        {selected.map(opt => (
                            <span key={opt} className="tag">
                                {opt} <span className="tag-close" onClick={(e) => removeTag(e, opt)}>×</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="placeholder">Select Expertise</span>
                )}
                <span className="arrow">▼</span>
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-search">
                        <input
                            type="text"
                            placeholder="Search expertise..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    {filteredGroups.map(group => (
                        <div key={group.category}>
                            <div className="dropdown-group-header">{group.category}</div>
                            {group.options.map(option => (
                                <div
                                    key={option}
                                    className={`dropdown-item ${selected.includes(option) ? 'selected' : ''}`}
                                    onClick={() => toggleOption(option)}
                                >
                                    <div className="checkbox-icon"></div>
                                    {option}
                                </div>
                            ))}
                        </div>
                    ))}
                    {filteredGroups.length === 0 && (
                        <div className="dropdown-item" style={{ justifyContent: 'center', color: '#666' }}>
                            No matches found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const JoinNetwork = () => {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '', // City / Country
        expertise: [], // Changed to array
        experience: '',
        role: '', // Current Role
        organization: '', // New field
        bio: '',
        linkedin: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExpertiseChange = (newExpertise) => {
        setFormData(prev => ({ ...prev, expertise: newExpertise }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (formData.expertise.length === 0) {
            alert("Please select at least one area of expertise.");
            return;
        }

        const newConsultant = {
            ...formData,
            name: formData.fullName, // Map for DB
            // Role in DB is typically "Consultant Type", here we map current role or primary expertise?
            // Let's keep 'role' as Current Role and add expertise array to DB
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
                <NavLink to="/consultants" className={({ isActive }) => `sub-tab ${isActive ? 'active' : ''}`} end>
                    All Experts
                </NavLink>
                <NavLink to="/join-network" className={({ isActive }) => `sub-tab ${isActive ? 'active' : ''}`}>
                    Join Network
                </NavLink>
            </div>

            <div className="join-us-section">
                {formSubmitted ? (
                    <div className="form-success-message">
                        <div className="success-icon">✓</div>
                        <h3 className="section-title">Application Received</h3>
                        <p className="section-text">We’ll review your profile and get back to you soon.</p>
                        <button className="cta-button mini" onClick={() => setFormSubmitted(false)}>Submit Another</button>
                    </div>
                ) : (
                    <form className="consultant-form" onSubmit={handleSubmit}>
                        <h3 className="section-title"><span>Join</span> as a Consultant</h3>

                        <div className="form-grid">
                            {/* Row 1 */}
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 234 567 890" />
                            </div>

                            {/* Row 2 */}
                            <div className="form-group">
                                <label>City / Country</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="New York, USA" />
                            </div>
                            <div className="form-group">
                                <label>Area of Expertise</label>
                                <MultiSelectDropdown selected={formData.expertise} onChange={handleExpertiseChange} />
                            </div>
                            <div className="form-group">
                                <label>Years of Experience</label>
                                <input type="number" name="experience" value={formData.experience} onChange={handleChange} required placeholder="5" />
                            </div>

                            {/* Row 3 */}
                            <div className="form-group">
                                <label>Current Role / Profession</label>
                                <input type="text" name="role" value={formData.role} onChange={handleChange} required placeholder="Senior Developer" />
                            </div>
                            <div className="form-group">
                                <label>Organization</label>
                                <input type="text" name="organization" value={formData.organization} onChange={handleChange} required placeholder="Prodecide Inc." />
                            </div>
                            <div className="form-group">
                                <label>LinkedIn / Portfolio Link</label>
                                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} required placeholder="https://linkedin.com/in/username" />
                            </div>

                            {/* Row 4 */}
                            <div className="form-group full-width">
                                <label>Short Bio (2–3 lines)</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} required placeholder="Tell us about your professional journey..." rows="4" />
                            </div>
                        </div>

                        <button type="submit" className="submit-form-btn">Submit Application</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default JoinNetwork;
