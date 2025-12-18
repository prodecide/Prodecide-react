import React from 'react';

const PersonaSelection = ({ onSelect }) => {
    return (
        <div className="persona-container">
            <h2 className="persona-title">What kind of decision are you taking right now?</h2>

            <div className="persona-options">
                {/* Career Decision */}
                <div className="persona-card" onClick={() => onSelect('career')}>
                    <div className="icon-circle">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="persona-icon">
                            <path d="M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" />
                            <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 2.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z" opacity="0.5" />
                            {/* Adding a person-like shape overlay for 'Career' specifically if needed, but standard briefcase is clear. 
                  Let's try to match the image: Person with tie + briefcase. 
                  Simplifying to a User + Briefcase hybrid for clarity or just clean SVG.
                  The user wants it based on the image: Person icon + Briefcase.
              */}
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <p>Career Decision</p>
                </div>

                {/* Personal Decision */}
                <div className="persona-card">
                    <div className="icon-circle">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="persona-icon">
                            {/* Person + Heart */}
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            <path d="M16.5 13c-1.2 0-2.27.45-3.09 1.19L16.5 17l3.09-2.81C18.77 13.45 17.7 13 16.5 13z" fill="red" style={{ display: 'none' }} /> {/* Hidden complexity */}
                            <path d="M20.6 14.5c-.83-1.09-2.27-1.5-3.6-1.5-3.15 0-5.83 2.4-6.85 5.5.95-.5 2.05-.8 3.25-.8 3.75 0 6.9 2.55 7.9 6-2.5-4.1-6.1-7.1-10.9-8.4" />
                            {/* Simpler Heart Icon overlay next to person */}
                            <path d="M16.5 15.5c-1.38 0-2.5 1.12-2.5 2.5 0 1.67 2.5 4.5 2.5 4.5s2.5-2.83 2.5-4.5c0-1.38-1.12-2.5-2.5-2.5z" transform="translate(4, -4)" />
                        </svg>
                    </div>
                    <p>Personal Decision</p>
                </div>

                {/* Business Decision */}
                <div className="persona-card">
                    <div className="icon-circle">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="persona-icon">
                            {/* Briefcase + Graph */}
                            <path d="M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" />
                            <path d="M5 19h14v-2H5v2zm0-4h14v-2H5v2zm0-4h14V9H5v2z" opacity="0.3" />
                            <path d="M16 6l2.29-2.29-4.88-4.88-4 4L2 0v17h22V6z" style={{ display: 'none' }} />
                            {/* Growing graph arrow */}
                            <path d="M7 14l3.5-3.5 2.5 2.5 4-4L18 10v-5h-5l1.5 1.5-2.5 2.5-2.5-2.5-4 4z" />
                        </svg>
                    </div>
                    <p>Business Decision</p>
                </div>
            </div>
        </div>
    );
};

export default PersonaSelection;
