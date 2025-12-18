import { useState } from 'react';
import './App.css';
import MatrixRain from './components/MatrixRain';
import PersonaSelection from './components/PersonaSelection';
import ChatInterface from './components/ChatInterface';

function App() {
  const [view, setView] = useState('landing');

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
        {view === 'landing' ? (
          <>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              margin: 0,
              fontFamily: 'Roboto, sans-serif', // Updated to Roboto
              letterSpacing: '0.2rem',
              color: '#fff', // White text
              textShadow: 'none' // Remove glow
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
