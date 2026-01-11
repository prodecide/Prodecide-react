import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

const sessionQuestions = [
    { key: "name", text: "What is your name?" },
    { key: "education_level", text: "Your current class or qualification?", options: ["10th", "12th", "UG"] },
    {
        key: "logical_sudoku",
        text: "Let's solve a quick puzzle!\n🔺   ⬛   ⭕\n⭕   🔺   ?\n⬛   ⭕   🔺\n👉 Which shape follows the pattern?",
        instructions: "RULES: Each shape appears once per row. Each shape appears once per column.",
        options: ["🔺", "⬛", "⭕"]
    },
    {
        key: "numerical_puzzle",
        text: "Let’s try a quick number puzzle 👇\n\n🔵 + 🔵 = 10\n🔵 + 🔺 = 8\n🔺 + ⬛ = 7\n\n👉 What number does ⬛ represent?",
        options: ["1", "2", "3", "4"]
    },
    { key: "extracurriculars", text: "What activities excite you outside academics? (e.g., coding, writing, designing, debating, sports)" },
    { key: "learning_preference", text: "Do you prefer theoretical learning or practical, hands-on work?" },
    { key: "ideal_environment", text: "What kind of work environment do you imagine for yourself? (Office / Remote / Fieldwork / Creative studio / Research)" },
    { key: "risk_profile", text: "Are you more interested in stability or risk-taking? (Stable job / Entrepreneurship / Freelancing)" },
    { key: "career_interests", text: "Do you have any career role or profession in mind already? (even if unsure)" },
    { key: "primary_motivation", text: "What matters more to you right now? (Passion / Salary / Social impact / Work-life balance)" }
];

const AIIndicator = () => (
    <div className="ai-indicator-wrapper">
        <div className="ai-bubble">
            <div className="ai-bubble-inner"></div>
            <div className="ai-bubble-pulse"></div>
        </div>
    </div>
);

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [isManualPath, setIsManualPath] = useState(false);
    const [manualBrief, setManualBrief] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const lastAskedIndex = useRef(-1);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        if (!isTyping && !isAnalyzing) {
            inputRef.current?.focus();
        }
    }, [messages, isTyping, isAnalyzing]);

    useEffect(() => {
        const handleGlobalClick = (e) => {
            if (inputRef.current && !inputRef.current.disabled && document.activeElement !== inputRef.current) {
                inputRef.current.focus();
            }
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    const handleSkipAssessment = () => {
        setIsManualPath(true);
        setCurrentQuestionIndex(sessionQuestions.length);
    };

    const silentSubmit = async (finalData) => {
        setIsAnalyzing(true);
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
        if (currentQuestionIndex === lastAskedIndex.current) return;
        lastAskedIndex.current = currentQuestionIndex;

        if (currentQuestionIndex < sessionQuestions.length) {
            typeMessage(sessionQuestions[currentQuestionIndex].text);
        } else if (isManualPath && !manualBrief) {
            typeMessage("Please describe the specific career path you're considering.");
        } else if (isManualPath && manualBrief) {
            setSuggestions([{ title: manualBrief, description: "Analysis results for your specified career path." }]);
        } else {
            typeMessage("Synthesizing your cognitive profile. Please standby for results...");
            silentSubmit(userAnswers);
        }
    }, [currentQuestionIndex, isManualPath, manualBrief]);

    const typeMessage = async (text) => {
        setIsTyping(true);
        setTypingText('');
        await new Promise(resolve => setTimeout(resolve, 400));

        let currentText = '';
        for (let i = 0; i < text.length; i++) {
            currentText += text[i];
            setTypingText(currentText);
            const speed = Math.random() * 20 + 10;
            await new Promise(resolve => setTimeout(resolve, speed));
        }

        setMessages(prev => [...prev, { sender: 'ai', text }]);
        setTypingText('');
        setIsTyping(false);
    };

    const handleChoiceSelect = (choice) => {
        submitAnswer(choice);
    };

    const submitAnswer = (value) => {
        if (isManualPath && currentQuestionIndex >= sessionQuestions.length) {
            setMessages(prev => [...prev, { sender: 'user', text: value }]);
            setInputValue('');
            setIsAnalyzing(true);
            setTimeout(() => {
                setIsAnalyzing(false);
                setManualBrief(value);
            }, 1200);
            return;
        }

        const currentKey = sessionQuestions[currentQuestionIndex]?.key;
        if (!currentKey) return;

        // Add user message to chat history
        setMessages(prev => [...prev, { sender: 'user', text: value }]);

        setUserAnswers(prev => ({
            ...prev,
            [currentKey]: value
        }));

        setInputValue('');
        setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
        }, 300);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        submitAnswer(inputValue);
    };

    if (suggestions.length > 0) {
        if (!isSignedUp) {
            return (
                <div className="results-container gate-container premium-container">
                    <div className="gate-content">
                        <h2 className="gate-title">Analysis Complete</h2>
                        <p className="gate-subtitle">Your comprehensive career architect profile is ready.</p>

                        <div className="premium-lock-box">
                            <p>We've synthesized your logical, numerical, and verbal patterns to identify your peak potential trajectories.</p>
                        </div>

                        <div className="gate-cta-box">
                            <button className="cta-button" onClick={() => setIsSignedUp(true)}>
                                Access Results
                            </button>
                            <span className="cta-subtext">Immediate secure access to your profile</span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="results-container premium-container">
                <header className="results-header">
                    <h2 className="persona-title">{isManualPath ? "Career Path Analysis" : "Strategic Roadmap"}</h2>
                </header>
                <div className="results-grid">
                    {suggestions.map((s, i) => (
                        <div key={i} className="result-card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <h3>{s.title}</h3>
                            <p>{s.description}</p>
                        </div>
                    ))}
                </div>
                <div className="results-footer">
                    <button className="cta-button" onClick={() => window.location.reload()}>Restart Session</button>
                </div>
            </div>
        );
    }

    const progress = Math.min((currentQuestionIndex / sessionQuestions.length) * 100, 100);

    const aptitudeIndicators = [
        { label: "LOGICAL ANALYSIS", keys: ["logical_sudoku"] },
        { label: "NUMERICAL INTELLIGENCE", keys: ["numerical_puzzle"] },
        { label: "VERBAL PRECISION", keys: ["extracurriculars"] },
        { label: "STRATEGIC VISION", keys: ["ideal_environment"] },
        { label: "ADAPTABILITY INDEX", keys: ["career_interests"] }
    ];

    return (
        <div className="chat-interface-container premium-container">
            <div className="chat-main-layout">
                <div className="chat-window-wrapper">
                    <div className="chat-window">
                        {sessionQuestions[currentQuestionIndex]?.instructions && (
                            <div className="system-instruction-box">
                                <span className="system-tag">PROTOCOL INSTRUCTIONS</span>
                                <p>{sessionQuestions[currentQuestionIndex].instructions}</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.sender}`}>
                                <span className="message-prefix">
                                    {msg.sender === 'ai' ? <AIIndicator /> : 'USER'}
                                </span>
                                <span className="message-text">{msg.text}</span>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chat-message ai">
                                <span className="message-prefix"><AIIndicator /></span>
                                <span className="message-text">{typingText}</span>
                                <span className="typing-cursor">_</span>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="chat-message ai">
                                <span className="message-prefix"><AIIndicator /></span>
                                <span className="message-text">Synthesizing cognitive patterns...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-control-wrapper">
                        {!isTyping && sessionQuestions[currentQuestionIndex]?.options && (
                            <div className="choice-options-container">
                                {sessionQuestions[currentQuestionIndex].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        className="choice-button"
                                        onClick={() => handleChoiceSelect(option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="chat-input-area">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="chat-input"
                                autoFocus
                                placeholder={isTyping || isAnalyzing ? "Processing..." : "Enter response..."}
                                disabled={isTyping || isAnalyzing || (currentQuestionIndex >= sessionQuestions.length && !isManualPath) || (isManualPath && manualBrief)}
                            />
                        </form>

                        {!isManualPath && currentQuestionIndex < sessionQuestions.length && !isTyping && (
                            <button className="skip-btn" onClick={handleSkipAssessment}>
                                SPECIFY CAREER PATH MANUALLY
                            </button>
                        )}
                    </div>
                </div>

                <div className="status-card">
                    <div className="status-card-title">Cognitive Profile</div>
                    <div className="mini-progress-track">
                        <div className="mini-progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="aptitude-list">
                        {aptitudeIndicators.map((indicator, idx) => {
                            const isCollected = indicator.keys.every(key => userAnswers[key]);
                            return (
                                <div key={idx} className="status-item">
                                    <span className="status-label">{indicator.label}</span>
                                    <span className={`status-indicator ${isCollected ? 'collected' : 'missing'}`}>
                                        {isCollected ? 'COMPLETE' : 'PENDING'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
