import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

const questions = [
    "What is your name?",
    "What grade or level are you currently studying in? (e.g., 10th, 12th, undergraduate year)",
    "Which subjects do you enjoy the most?",
    "Which subjects do you perform best in academically?",
    "What activities excite you outside academics? (e.g., coding, writing, designing, debating, sports)",
    "Do you prefer theoretical learning or practical, hands-on work?",
    "What kind of work environment do you imagine for yourself? (Office / Remote / Fieldwork / Creative studio / Research)",
    "Are you more interested in stability or risk-taking? (Stable job / Entrepreneurship / Freelancing)",
    "Do you have any career role or profession in mind already? (even if unsure)",
    "What matters more to you right now? (Passion / Salary / Social impact / Work-life balance)"
];

const questionKeys = [
    "name",
    "education_level",
    "favorite_subjects",
    "academic_strengths",
    "extracurriculars",
    "learning_preference",
    "ideal_environment",
    "risk_profile",
    "career_interests",
    "primary_motivation"
];

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const silentSubmit = async (finalData) => {
        setIsAnalyzing(true);
        console.log("--- STARTING LLM ANALYSIS ---");

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAnswers: finalData })
            });

            const data = await response.json();
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error("Analysis failed:", error);
            // Mock data for development if API fails or isn't configured yet
            setSuggestions([
                { title: "Software Engineer", description: "Matches your interest in hands-on practical work and problem solving." },
                { title: "UI/UX Designer", description: "Fits your creative drive and design-oriented thinking." },
                { title: "Data Scientist", description: "Aligns with your academic strengths in math and theoretical logic." },
                { title: "Cybersecurity Analyst", description: "Good for your preference for hands-on, high-impact work." },
                { title: "Product Manager", description: "Leverages your ability to balance risks and passions." }
            ]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        if (currentQuestionIndex < questions.length) {
            typeMessage(questions[currentQuestionIndex]);
        } else {
            typeMessage("Thank you for your responses. Analyzing your profile...");
            silentSubmit(userAnswers);
        }
    }, [currentQuestionIndex]);

    const playMessageSound = () => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
    };

    const typeMessage = async (text) => {
        setIsTyping(true);
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        playMessageSound();
        setMessages(prev => [...prev, { sender: 'ai', text }]);
        setIsTyping(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Capture answer in background
        const currentKey = questionKeys[currentQuestionIndex];
        setUserAnswers(prev => ({
            ...prev,
            [currentKey]: inputValue
        }));

        // Add user message
        const newMessages = [...messages, { sender: 'user', text: inputValue }];
        setMessages(newMessages);
        setInputValue('');

        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
    };

    if (suggestions.length > 0) {
        return (
            <div className="results-container persona-container">
                <h2 className="persona-title">Top 5 Career Segments</h2>
                <div className="results-grid">
                    {suggestions.map((s, i) => (
                        <div key={i} className="result-card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <h3>{s.title}</h3>
                            <p>{s.description}</p>
                        </div>
                    ))}
                </div>
                <button className="cta-button" onClick={() => window.location.reload()}>Start Over</button>
            </div>
        );
    }

    return (
        <div className="chat-interface-container">
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        {msg.sender === 'ai' && (
                            <div className="ai-waveform">
                                <div className="bar"></div>
                                <div className="bar"></div>
                                <div className="bar"></div>
                            </div>
                        )}
                        <span className="message-text">{msg.text}</span>
                    </div>
                ))}
                {isTyping && (
                    <div className="chat-message ai">
                        <div className="ai-waveform">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </div>
                        <span className="typing-cursor">█</span>
                    </div>
                )}
                {isAnalyzing && (
                    <div className="chat-message ai">
                        <div className="ai-waveform">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </div>
                        <span className="message-text italic">Analyzing your digital profile... Matrix crunching data...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input-area">
                <span className="input-prefix">{'>'}</span>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="chat-input"
                    autoFocus
                    placeholder={isTyping || isAnalyzing ? "..." : "Type your answer..."}
                    disabled={isTyping || isAnalyzing || currentQuestionIndex >= questions.length}
                />
            </form>
        </div>
    );
};

export default ChatInterface;
