import { useState } from 'react';
import './App.css';
import MatrixRain from './components/MatrixRain';
import PersonaSelection from './components/PersonaSelection';
import ChatInterface from './components/ChatInterface';

function App() {
  const [view, setView] = useState('landing');
  const [activeTab, setActiveTab] = useState('decide');
  const [consultantTab, setConsultantTab] = useState('list');

  const consultants = [
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
  ];

  const handlePersonaSelect = (persona) => {
    if (persona === 'career') {
      setView('chat-career');
    }
    // Other personas can be handled here later
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
                  <h3 className="section-title">Become a ProDecide Guide</h3>
                  <p className="section-text">
                    Are you an expert in human potential or career analysis? <br />
                    Join our network of elite consultants to help users decrypt their future.
                  </p>
                  <button className="cta-button mini">Apply to Join</button>
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
