import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import MatrixRain from './components/MatrixRain';
import PersonaSelection from './components/PersonaSelection';
import ChatInterface from './components/ChatInterface';
import Home from './components/Home';
import Consultants from './components/Consultants';
import JoinNetwork from './components/JoinNetwork';
import About from './components/About';

function App() {
  const location = useLocation();

  // Determine if header should be visible
  // Header is visible on landing pages: /, /consultants, /about
  // Hidden on interactive flows: /start, /chat/career
  const showHeader = !['/start', '/chat/career'].includes(location.pathname);

  const getActiveTab = (path) => {
    if (path === '/') return 'decide';
    if (path === '/consultants') return 'consultants';
    if (path === '/about') return 'about';
    return '';
  };

  const activeTab = getActiveTab(location.pathname);

  return (
    <>
      <MatrixRain />
      <MatrixRain />
      <div className="app-main-wrapper">
        {showHeader && (
          <header className={`main-header ${activeTab !== 'decide' ? 'scrolled' : ''}`}>
            <div className="brand">
              <span className="brand-dot"></span>
              ProDecide
            </div>
            <nav className="nav-tabs">
              <Link
                to="/"
                className={`nav-link ${activeTab === 'decide' ? 'active' : ''}`}
              >
                Decide
              </Link>
              <Link
                to="/consultants"
                className={`nav-link ${activeTab === 'consultants' ? 'active' : ''}`}
              >
                Our Consultants
              </Link>
              <Link
                to="/about"
                className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
              >
                About Us
              </Link>
            </nav>
          </header>
        )}

        <main className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/consultants" element={<Consultants />} />
            <Route path="/about" element={<About />} />
            <Route path="/start" element={<PersonaSelection onSelect={(persona) => {
              if (persona === 'career') {
                // Navigation handled within component or parent wrapper if needed, 
                // but here we just need to ensure the route exists.
                // Ideally PersonaSelection should navigate using useNavigate() internally 
                // or we pass a handler that navigates.
                // Since I didn't edit PersonaSelection, I should check if it needs props modifications.
                // For now, let's assume I might need to fast-follow update PersonaSelection if it uses state callback only.
                // Actually, in the original App.jsx:
                // <PersonaSelection onSelect={handlePersonaSelect} />
                // handlePersonaSelect set view to 'chat-career'.
                // So I should pass a handler that navigates.
                window.location.href = '/chat/career'; // Or better, use a wrapper to use useNavigate.
              }
            }} />} />
            {/* 
                We need to handle the onSelect prop for PersonaSelection properly without window.location.ref 
                inside the JSX if possible. 
                However, since we can't use useNavigate inside the render of Routes easily for this prop callback 
                unless we wrap it.
                Actually, simpler: define a wrapper component or just inline a small wrapper function.
             */}
            <Route path="/chat/career" element={<ChatInterface />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

// Small wrapper to handle navigation logic for PersonaSelection
import { useNavigate } from 'react-router-dom';

const PersonaSelectionWrapper = () => {
  const navigate = useNavigate();
  return (
    <PersonaSelection onSelect={(persona) => {
      if (persona === 'career') {
        navigate('/chat/career');
      }
    }} />
  );
};

// Re-exporting App with corrected Route for PersonaSelection
function AppWithRouter() {
  const location = useLocation();

  // Determine if header should be visible
  const showHeader = !['/start', '/chat/career'].includes(location.pathname);

  const getActiveTab = (path) => {
    if (path === '/') return 'decide';
    if (['/consultants', '/join-network'].includes(path)) return 'consultants';
    if (path === '/about') return 'about';
    return '';
  };

  const activeTab = getActiveTab(location.pathname);

  return (
    <>
      <MatrixRain />
      <MatrixRain />
      <div className="app-main-wrapper">
        {showHeader && (
          <header className={`main-header ${activeTab !== 'decide' ? 'scrolled' : ''}`}>
            <div className="brand">
              <span className="brand-dot"></span>
              ProDecide
            </div>
            <nav className="nav-tabs">
              <Link
                to="/"
                className={`nav-link ${activeTab === 'decide' ? 'active' : ''}`}
              >
                Decide
              </Link>
              <Link
                to="/consultants"
                className={`nav-link ${activeTab === 'consultants' ? 'active' : ''}`}
              >
                Our Consultants
              </Link>
              <Link
                to="/about"
                className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
              >
                About Us
              </Link>
            </nav>
          </header>
        )}

        <main className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/consultants" element={<Consultants />} />
            <Route path="/join-network" element={<JoinNetwork />} />
            <Route path="/about" element={<About />} />
            <Route path="/start" element={<PersonaSelectionWrapper />} />
            <Route path="/chat/career" element={<ChatInterface />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default AppWithRouter;
