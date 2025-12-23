import { useState } from 'react';
import './App.css';
import MatrixRain from './components/MatrixRain';
import PersonaSelection from './components/PersonaSelection';
import ChatInterface from './components/ChatInterface';

function App() {
  const [view, setView] = useState('landing');
  const [activeTab, setActiveTab] = useState('decide');

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
            <div className="tab-content">
              <h2 className="tab-title">Our Consultants</h2>
              <p className="tab-text">Expert guidance for your career journey.</p>
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
