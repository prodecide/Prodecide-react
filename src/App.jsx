import { useState } from 'react';
import './App.css';
import MatrixRain from './components/MatrixRain';
import PersonaSelection from './components/PersonaSelection';
import ChatInterface from './components/ChatInterface';

function App() {
  const [view, setView] = useState('landing');
  const [activeTab, setActiveTab] = useState('decide');
  const [consultantTab, setConsultantTab] = useState('list');
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

  const [consultants, setConsultants] = useState([
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

  const handlePersonaSelect = (persona) => {
    if (persona === 'career') {
      setView('chat-career');
    }
    // Other personas can be handled here later
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Add new consultant to state
    const newConsultant = {
      name: formData.fullName,
      role: formData.expertise,
      bio: formData.bio
    };

    setConsultants(prev => [newConsultant, ...prev]);
    setFormSubmitted(true);
  };

  return (
    <>
      <MatrixRain />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        color: '#0f0',
        textShadow: '0 0 10px #0f0'
      }}>
        {view === 'landing' && (
          <nav className="top-nav">
            <div className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'decide' ? 'active' : ''}`}
                onClick={() => setActiveTab('decide')}
              >
                Decide
              </button>
              <button
                className={`nav-tab ${activeTab === 'consultants' ? 'active' : ''}`}
                onClick={() => setActiveTab('consultants')}
              >
                Our Consultants
              </button>
              <button
                className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About Us
              </button>
            </div>
          </nav>
        )}

        {view === 'landing' ? (
          activeTab === 'decide' ? (
            <>
              <h1 style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                margin: 0,
                fontFamily: 'Roboto, sans-serif',
                letterSpacing: '0.2rem',
                color: '#fff',
                textShadow: 'none'
              }}>
                ProDecide
              </h1>
              <p style={{
                fontSize: '1.5rem',
                margin: '1rem 0 0',
                color: '#fff',
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 700,
                fontStyle: 'italic',
                letterSpacing: '0.1rem',
                opacity: 0.9
              }}>
                Your Intelligent decision Maker
              </p>

              <button className="cta-button" onClick={() => setView('personas')}>
                Decide
              </button>
            </>
          ) : activeTab === 'consultants' ? (
            <div className="tab-content consultants-view">
              <div className="sub-nav">
                <button
                  className={`sub-tab ${consultantTab === 'list' ? 'active' : ''}`}
                  onClick={() => setConsultantTab('list')}
                >
                  Consultants
                </button>
                <button
                  className={`sub-tab ${consultantTab === 'join' ? 'active' : ''}`}
                  onClick={() => setConsultantTab('join')}
                >
                  Join Us
                </button>
              </div>

              {consultantTab === 'list' ? (
                <div className="consultants-grid">
                  {consultants.map((c, i) => (
                    <div key={i} className="consultant-card">
                      <div className="card-glitch-overlay"></div>
                      <h3 className="consultant-name">{c.name}</h3>
                      <span className="consultant-role">{c.role}</span>
                      <p className="consultant-bio">{c.bio}</p>
                    </div>
                  ))}
                </div>
              ) : (
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
                      <button type="submit" className="cta-button mini submit-form-btn">Submit</button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'about' ? (
            <div className="tab-content">
              <h2 className="tab-title">About Us</h2>
              <p className="tab-text">Innovating decision making through technology.</p>
            </div>
          ) : null
        ) : view === 'personas' ? (
          <PersonaSelection onSelect={handlePersonaSelect} />
        ) : view === 'chat-career' ? (
          <ChatInterface />
        ) : null}
      </div>
    </>
  );
}

export default App;
