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

const SiriWaveform = () => (
    <div className="siri-waveform">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none">
            <path className="wave-1" d="M0 20 Q 25 5, 50 20 T 100 20" />
            <path className="wave-2" d="M0 20 Q 25 35, 50 20 T 100 20" />
            <path className="wave-3" d="M0 20 Q 25 10, 50 20 T 100 20" />
        </svg>
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
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const lastAskedIndex = useRef(-1);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        // Focus input after messages change/typing ends
        if (!isTyping && !isAnalyzing) {
            inputRef.current?.focus();
        }
    }, [messages, isTyping, isAnalyzing]);

    // Keep focus even if clicking background
    useEffect(() => {
        const handleGlobalClick = (e) => {
            // Only refocus if not clicking on the input itself or other interactive elements (if any)
            if (inputRef.current && !inputRef.current.disabled && document.activeElement !== inputRef.current) {
                inputRef.current.focus();
            }
        };

        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

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
        if (currentQuestionIndex === lastAskedIndex.current) return;
        lastAskedIndex.current = currentQuestionIndex;

        if (currentQuestionIndex < sessionQuestions.length) {
            typeMessage(sessionQuestions[currentQuestionIndex].text);
        } else {
            typeMessage("Thank you for your responses. Analyzing your profile...");
            silentSubmit(userAnswers);
        }
    }, [currentQuestionIndex]);

    const playMessageSound = () => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        try {
            const ctx = new AudioContext();

            // 1. Mechanical 'Impact' (White Noise burst)
            const bufferSize = ctx.sampleRate * 0.04;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = buffer;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.04, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = 1200;
            noiseFilter.Q.value = 1;

            noiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);

            // 2. Short metallic resonance (Triangle)
            const oscillator = ctx.createOscillator();
            const resGain = ctx.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.02);

            resGain.gain.setValueAtTime(0.01, ctx.currentTime);
            resGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

            oscillator.connect(resGain);
            resGain.connect(ctx.destination);

            noiseSource.start();
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.04);
        } catch (e) {
            console.error("Audio context error:", e);
        }
    };

    const typeMessage = async (text) => {
        setIsTyping(true);
        setTypingText('');

        // Initial delay
        await new Promise(resolve => setTimeout(resolve, 600));

        let currentText = '';
        for (let i = 0; i < text.length; i++) {
            currentText += text[i];
            setTypingText(currentText);

            // Play sound every few characters for a "printing" effect
            if (i % 3 === 0) playMessageSound();

            // Randomize typing speed for organic feel
            const speed = Math.random() * 30 + 20;
            await new Promise(resolve => setTimeout(resolve, speed));
        }

        // Move completed message to state
        setMessages(prev => [...prev, { sender: 'ai', text }]);
        setTypingText('');
        setIsTyping(false);
    };

    const handleChoiceSelect = (choice) => {
        submitAnswer(choice);
    };

    const submitAnswer = (value) => {
        const currentKey = sessionQuestions[currentQuestionIndex]?.key;
        if (!currentKey) return;

        setUserAnswers(prev => ({
            ...prev,
            [currentKey]: value
        }));

        setInputValue('');

        // Move to next question after a small lag
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
                <div className="results-container gate-container">
                    <div className="gate-content">
                        <div className="success-icon">✓</div>
                        <h2 className="gate-title">Analysis Complete</h2>
                        <p className="gate-subtitle">Your personalized career roadmap is ready for decryption.</p>

                        <div className="premium-lock-box">
                            <div className="lock-icon">🔒</div>
                            <p>We've analyzed your logical, numerical, and verbal patterns to find your top 5 matching careers.</p>
                        </div>

                        <div className="gate-cta-box">
                            <p className="cta-text">Join ProDecide to unlock your full profile</p>
                            <button className="cta-button signup-button" onClick={() => setIsSignedUp(true)}>
                                Sign Up to View Results
                            </button>
                            <span className="cta-subtext">Free immediate access to your analysis</span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="results-container persona-container">
                <h2 className="persona-title">Your Career Roadmap</h2>
                <div className="results-grid">
                    {suggestions.map((s, i) => (
                        <div key={i} className="result-card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <h3>{s.title}</h3>
                            <p>{s.description}</p>
                        </div>
                    ))}
                </div>
                <div className="results-footer">
                    <button className="cta-button" onClick={() => window.location.reload()}>Start New Session</button>
                </div>
            </div>
        );
    }

    const progress = Math.min((currentQuestionIndex / sessionQuestions.length) * 100, 100);

    const aptitudeIndicators = [
        { label: "Logical reasoning", keys: ["logical_sudoku"] },
        { label: "Numerical ability", keys: ["numerical_puzzle"] },
        { label: "Verbal ability", keys: ["extracurriculars"] },
        { label: "Abstract reasoning", keys: ["ideal_environment"] },
        { label: "Spatial ability", keys: ["career_interests"] }
    ];

    return (
        <div className="chat-interface-container">
            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <span className="progress-text">Session Data Collected: {Math.round(progress)}%</span>
            </div>

            <div className="chat-main-layout">
                <div className="chat-window-wrapper">
                    <div className="chat-window">
                        <div className="scanline"></div>

                        {/* Display specific instructions/rules at the top if they exist for the current question */}
                        {sessionQuestions[currentQuestionIndex]?.instructions && (
                            <div className="system-instruction-box">
                                <span className="system-tag">SYSTEM RULES</span>
                                <p>{sessionQuestions[currentQuestionIndex].instructions}</p>
                            </div>
                        )}

                        {/* Only show the current AI message or typing state to 'hide' previous questions */}
                        {isTyping ? (
                            <div className="chat-message ai">
                                <span className="message-prefix"><SiriWaveform /></span>
                                <span className="message-text">{typingText}</span>
                                <span className="typing-cursor">█</span>
                            </div>
                        ) : (
                            messages.length > 0 && (
                                <div className={`chat-message ai`}>
                                    <span className="message-prefix"><SiriWaveform /></span>
                                    <span className="message-text">{messages[messages.length - 1].text}</span>
                                </div>
                            )
                        )}

                        {isAnalyzing && (
                            <div className="chat-message ai">
                                <span className="message-prefix">SYSTEM</span>
                                <span className="message-text italic">Analyzing your digital profile... Matrix crunching data...</span>
                                <div className="ai-waveform" style={{ marginLeft: '1rem', marginTop: '2px' }}>
                                    <div className="bar"></div>
                                    <div className="bar"></div>
                                    <div className="bar"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-control-wrapper">
                        {/* Render options if they exist for the current question */}
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
                            <span className="input-prefix">{'>'}</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="chat-input"
                                autoFocus
                                placeholder={isTyping || isAnalyzing ? "..." : "Type your answer..."}
                                disabled={isTyping || isAnalyzing || currentQuestionIndex >= sessionQuestions.length}
                            />
                        </form>
                    </div>
                </div>

                <div className="status-card">
                    <div className="status-card-title">Aptitude Profile</div>
                    {aptitudeIndicators.map((indicator, idx) => {
                        const isCollected = indicator.keys.every(key => userAnswers[key]);
                        return (
                            <div key={idx} className="status-item">
                                <span className="status-label">{indicator.label}</span>
                                <span className={`status-indicator ${isCollected ? 'collected' : 'missing'}`}>
                                    {isCollected ? 'ANALYZED' : 'PENDING'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
