import React from 'react';

const About = () => {
    return (
        <div className="tab-content about-view premium-container">
            <h2 className="tab-title">About ProDecide</h2>
            <div className="about-grid">
                <div className="about-card">
                    <div className="icon-circle">M</div>
                    <h3>Our Mission</h3>
                    <p>To help people make informed decisions through simple, personalized, and intelligent guidance.</p>
                </div>
                <div className="about-card">
                    <div className="icon-circle">V</div>
                    <h3>Our Vision</h3>
                    <p>To empower people everywhere to make better decisions and take control of their future.</p>
                </div>
            </div>
        </div>
    );
};

export default About;
