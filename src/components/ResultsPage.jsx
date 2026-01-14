import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css';

const ResultsPage = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await fetch(`/api/get-result?id=${id}`);
                if (!response.ok) {
                    throw new Error('Result not found');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error("Failed to fetch results:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchResult();
        }
    }, [id]);

    if (loading) return (
        <div className="results-container premium-container loading-state">
            <div className="matrix-loader">Decrypting Strategic Roadmap...</div>
        </div>
    );

    if (error) return (
        <div className="results-container premium-container error-state">
            <h2>Access Denied</h2>
            <p>{error}</p>
            <Link to="/" className="cta-button">Return to Base</Link>
        </div>
    );

    return (
        <div className="results-container premium-container">
            <header className="results-header">
                <h2 className="persona-title">Strategic Roadmap</h2>
                <div className="result-meta">
                    <span>ID: {id.slice(-6).toUpperCase()}</span>
                    <span>Date: {new Date(data.createdAt).toLocaleDateString()}</span>
                </div>
            </header>

            <div className="results-grid">
                {data.analysis && data.analysis.map((s, i) => (
                    <div key={i} className="result-card" style={{ animationDelay: `${i * 0.1}s` }}>
                        <h3>{s.title}</h3>
                        <p>{s.description}</p>
                    </div>
                ))}
            </div>

            <div className="results-footer">
                <Link to="/" className="cta-button">Start New Assessment</Link>
            </div>
        </div>
    );
};

export default ResultsPage;
