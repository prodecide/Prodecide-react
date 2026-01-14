import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

// Helper component for puzzle shapes
const PuzzleShape = ({ type }) => {
    switch (type) {
        case 'triangle':
            return (
                <svg viewBox="0 0 24 24" className="shape-svg shape-triangle">
                    <path d="M12 4L22 20H2z" fill="currentColor" />
                </svg>
            );
        case 'circle':
            return (
                <svg viewBox="0 0 24 24" className="shape-svg shape-circle">
                    <circle cx="12" cy="12" r="9" fill="transparent" strokeWidth="3" stroke="currentColor" />
                </svg>
            );
        case 'square':
            return (
                <svg viewBox="0 0 24 24" className="shape-svg shape-square">
                    <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" />
                </svg>
            );
        case '?':
            return <span className="shape-question">?</span>;
        default:
            return null;
    }
};

const sessionQuestions = [
    { key: "name", text: "What is your name?" },
    { key: "education_level", text: "Your current class or qualification?", options: ["10th", "12th", "UG"] },
    {
        key: "logical_sudoku",
        type: "grid_puzzle",
        text: "Let's solve a quick puzzle! Which shape follows the pattern?",
        grid: [
            ["triangle", "square", "circle"],
            ["circle", "triangle", "?"],
            ["square", "circle", "triangle"]
        ],
        instructions: "RULES: Each shape appears once per row. Each shape appears once per column.",
        options: ["triangle", "square", "circle"]
    },
    {
        key: "numerical_puzzle",
        type: "equation_puzzle",
        text: "Let's try a quick number puzzle. What number does the square represent?",
        equations: [
            ["circle", "+", "circle", "=", "10"],
            ["circle", "+", "triangle", "=", "8"],
            ["triangle", "+", "square", "=", "7"]
        ],
        instructions: "Solve the equations to find the value of the square.",
        options: ["1", "2", "3", "4"]
    },
    {
        key: "verbal_precision_q1",
        text: "The instructions were so ______ that everyone followed them without confusion.",
        options: ["A. ambiguous", "B. concise", "C. excessive", "D. careless"]
    },
    {
        key: "verbal_precision_q2",
        text: "Identify the sentence that is grammatically and semantically correct:",
        options: ["A. She did not knew the answer.", "B. He explained the concept clearly.", "C. The results was surprising.", "D. They was waiting outside."]
    },
    {
        key: "verbal_precision_q3",
        text: "Choose the sentence where the word \"critical\" is used most accurately:",
        options: ["A. The weather is critical today.", "B. He made a critical error during the test.", "C. The book was critical to read.", "D. She spoke critical because she was happy."]
    },
    {
        key: "verbal_precision_q4",
        text: "Which sentence is the most precise?",
        options: ["A. The meeting was long.", "B. The meeting took some time.", "C. The meeting lasted 47 minutes.", "D. The meeting felt endless."]
    },
    {
        key: "strategic_vision_q1",
        text: "You are opening a new high-tech bookstore. How do you spend your budget to ensure the store is still successful in 10 years?",
        options: [
            "A) Buy the largest collection of physical books to beat competitors.",
            "B) Spend on comfortable lounges, a high-end cafe, and community space.",
            "C) Hire the fastest cashiers for quick purchasing."
        ]
    },
    {
        key: "strategic_vision_q2",
        text: "A planner suggests making the city's main bridge \"Toll-Free\" to help people save money. What is a likely unintended consequence?",
        options: [
            "A) People will have extra money for groceries.",
            "B) More people will drive instead of taking the train, worsening traffic.",
            "C) The bridge will become cleaner due to more usage."
        ]
    },
    {
        key: "strategic_vision_q3",
        text: "Your robotics team is losing because the opponent can climb. You cannot climb. What is your strategy for the last 5 minutes?",
        options: [
            "A) Try to build a climber quickly, risking breakage.",
            "B) Focus entirely on \"speed tasks\" that the climber is too slow to do.",
            "C) Protest to the judges that the other robot is too advanced."
        ]
    },
    {
        key: "strategic_vision_q4",
        text: "You have $1,000 for a YouTube channel. How do you allocate for best long-term growth?",
        options: [
            "A) Spend $900 on a camera and $100 on lighting.",
            "B) Spend $300 on a camera and $700 on a storytelling/editing course.",
            "C) Save all $1,000 and use your old phone."
        ]
    },

    {
        key: "adaptability_assessment",
        type: "adaptability_assessment",
        scenarios: {
            blue: {
                baseline: "Blue",
                items: ["The Sky", "A Banana", "The Ocean"],
                answers: ["Blue", "Not Blue", "Blue"],
                replacement: "Green",
                finalQuestion: "Quick! Without overthinking... What color is the Ocean now?",
                options: ["A) Green", "B) Blue", "C) The system is broken."]
            },
            red: {
                baseline: "Red",
                items: ["A Fire Truck", "A Cucumber", "A Rose"],
                answers: ["Red", "Not Red", "Red"],
                replacement: "Violet",
                finalQuestion: "Quick! Without overthinking... What color is the Fire Truck now?",
                options: ["A) Violet", "B) Red", "C) The system is broken."]
            }
        }
    },
    {
        key: "extracurriculars",
        text: "The \"After-School\" Scene: It’s 4:00 PM on a Friday. What is the one project or activity that makes you lose track of time?",
        options: [
            "💻 The Creator (Coding, Building, Tech)",
            "🎨 The Artist (Designing, Drawing, Crafting)",
            "🎤 The Influencer (Debating, Writing, Content)",
            "🏆 The Competitor (Sports, Gaming, Strategy)"
        ],
        allowInput: true
    },
    {
        key: "learning_preference",
        text: "The \"How-To\" Test: If I gave you a complex piece of IKEA furniture to build, how would you start?",
        options: [
            "A) Read the Manual: I want to understand the theory and the 'why' before I touch anything.",
            "B) Just Build It: I want to get my hands dirty and figure it out as I go."
        ],
        reactions: {
            "A) Read the Manual: I want to understand the theory and the 'why' before I touch anything.": "A theoretical learner! You'd likely enjoy Research or Law.",
            "B) Just Build It: I want to get my hands dirty and figure it out as I go.": "Practical and hands-on. Engineering or Design might be your playground."
        }
    },
    {
        key: "ideal_environment",
        text: "The \"Vibe\" Check: Close your eyes. Where do you see yourself on a Monday morning five years from now?",
        options: [
            "🏢 The High-Rise: A fast-paced corporate office.",
            "🏠 The Digital Nomad: Working from a laptop in a cafe or at home.",
            "🌲 The Field: Outdoors, at a construction site, or traveling for work.",
            "🧪 The Lab: A quiet space for deep research and discovery.",
            "🎨 The Studio: A messy, creative space filled with tools and inspiration."
        ]
    },
    {
        key: "risk_profile",
        text: "The \"Bridge\" Metaphor: Let’s talk about your safety net. Which of these sounds more like you?",
        options: [
            "A) The Solid Ground: I want a steady paycheck, clear hours, and a guaranteed career ladder.",
            "B) The Leap of Faith: I’m okay with uncertainty if it means I can build my own empire.",
            "C) The Independent: I want to be my own boss and work on different projects for different people."
        ]
    },
    {
        key: "career_interests",
        text: "The \"North Star\": Is there a specific job title that has ever made you think, 'I could actually do that'? (Type it below)",
        allowInput: true,
        reaction: "Interesting! I’ll factor {{User_Input}} into our final match analysis."
    },
    {
        key: "primary_motivation",
        text: "The \"Fuel\" Question: What is the biggest 'driver' behind your future career?",
        options: [
            "💰 The Fortune: Financial freedom and a high salary.",
            "❤️ The Heart: Doing what I love, regardless of the pay.",
            "🌍 The Legacy: Making a massive positive impact on the world.",
            "⚖️ The Balance: Having plenty of time for my family, hobbies, and travel."
        ]
    }

];

const AIIndicator = () => (
    <div className="ai-indicator-wrapper">
        <div className="ai-bubble">
            <div className="ai-bubble-inner"></div>
            <div className="ai-bubble-pulse"></div>
        </div>
    </div>
);

const UserIndicator = () => (
    <div className="user-indicator-wrapper">
        <div className="user-bubble">
            <div className="user-bubble-pulse"></div>
        </div>
    </div>
);

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [assessmentAnswers, setAssessmentAnswers] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [isManualPath, setIsManualPath] = useState(false);
    const [manualBrief, setManualBrief] = useState('');
    const [adaptabilityStep, setAdaptabilityStep] = useState(0); // 0:Intro, 1-3:Pattern, 4:Glitch, 5:Final
    const [adaptabilityColor, setAdaptabilityColor] = useState(null);
    const [glitchActive, setGlitchActive] = useState(false);
    const [isAnalysisReady, setIsAnalysisReady] = useState(false);
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
            console.log("🚀 Initiating Analysis & Save...");

            // Call the new Save+Analyze endpoint
            const response = await fetch('/api/save-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAnswers: finalData })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }

            const result = await response.json();
            console.log("✅ SUCCESS:", result);

            // Redirect to the results page
            if (result.id) {
                window.location.href = `/results/${result.id}`;
            }

        } catch (error) {
            console.error("❌ PROCESS FAILED:", error);
            alert("Analysis Error: " + error.message);
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        if (currentQuestionIndex === lastAskedIndex.current) return;
        lastAskedIndex.current = currentQuestionIndex;

        const sectionStartKeys = ['verbal_precision_q1', 'strategic_vision_q1', 'adaptability_assessment'];

        if (currentQuestionIndex < sessionQuestions.length) {
            const currentQ = sessionQuestions[currentQuestionIndex];

            // Clear chat if starting a new section
            if (sectionStartKeys.includes(currentQ.key)) {
                setMessages([]);
            }

            if (currentQ.text) {
                typeMessage(currentQ.text);
            }
        } else if (isManualPath && !manualBrief) {
            typeMessage("Please describe the specific career path you're considering.");
        } else if (isManualPath && manualBrief) {
            setSuggestions([{ title: manualBrief, description: "Analysis results for your specified career path." }]);
        } else {
            typeMessage("Analysis complete. Detailed cognitive profile generated. Please click 'EXPLORE RESULTS' in the sidebar to reveal your future.");
            setIsAnalysisReady(true);
        }
    }, [currentQuestionIndex, isManualPath, manualBrief]);

    const handleExploreResults = () => {
        console.log("🚀 EXPLORE RESULTS CLICKED - Initiating submission...");
        silentSubmit(userAnswers);
    };

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

    const submitAnswer = async (value) => {
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

        const currentQ = sessionQuestions[currentQuestionIndex];
        const currentKey = currentQ?.key;
        if (!currentKey) return;

        // Add user message to chat history
        setMessages(prev => [...prev, { sender: 'user', text: value }]);

        setUserAnswers(prev => ({
            ...prev,
            [currentKey]: value
        }));

        setInputValue('');

        // Handle Dynamic Reaction
        let delay = 300;
        let reactionText = null;

        if (currentQ.reactions && currentQ.reactions[value]) {
            reactionText = currentQ.reactions[value];
        } else if (currentQ.reaction) {
            reactionText = currentQ.reaction.replace('{{User_Input}}', value);
        }

        if (reactionText) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await typeMessage(reactionText);
            delay = 100; // Small delay after typing finishes
        }

        setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
        }, delay);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        submitAnswer(inputValue);
    };

    const handleAssessmentSelect = (questionId, option) => {
        setAssessmentAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleAssessmentSubmit = () => {
        const currentQ = sessionQuestions[currentQuestionIndex];
        const answers = {};
        currentQ.questions.forEach(q => {
            answers[q.id] = assessmentAnswers[q.id];
        });

        // Add to user answers
        // Also mark the section key as complete for the progress indicator
        if (currentQ.key) {
            answers[currentQ.key] = true;
        }

        setUserAnswers(prev => ({
            ...prev,
            ...answers
        }));

        setAssessmentAnswers({}); // Reset for next set if needed
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handleAdaptabilityColor = (color) => {
        setAdaptabilityColor(color);
        setAdaptabilityStep(1);
    };

    const handlePatternClick = (answer) => {
        if (adaptabilityStep < 3) {
            setAdaptabilityStep(prev => prev + 1);
        } else {
            // Trigger Glitch
            setGlitchActive(true);
            setTimeout(() => {
                setAdaptabilityStep(5); // Skip to final
                setGlitchActive(false);
            }, 2000); // 2 secong glitch
        }
    };

    const handleAdaptabilityFinal = (answer) => {
        setAssessmentAnswers(prev => ({ ...prev, adaptability_final: answer }));
        // Submit and move on
        const currentQ = sessionQuestions[currentQuestionIndex];
        const answers = {
            [currentQ.key]: {
                color: adaptabilityColor,
                finalAnswer: answer
            }
        };
        setUserAnswers(prev => ({
            ...prev,
            ...answers
        }));

        setCurrentQuestionIndex(prev => prev + 1);
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

                    {isAnalysisReady && suggestions.length === 0 && (
                        <div className="analysis-pending-message">
                            <h3>Analysis Complete</h3>
                            <p>Please check the sidebar to reveal your results.</p>
                        </div>
                    )}
                </div>
                {!isAnalysisReady && !suggestions.length && (
                    <div className="results-footer">
                        <button className="cta-button" onClick={() => window.location.reload()}>Restart Session</button>
                    </div>
                )}
            </div>
        );
    }

    const progress = Math.min((currentQuestionIndex / sessionQuestions.length) * 100, 100);

    const aptitudeIndicators = [
        { label: "LOGICAL ANALYSIS", keys: ["grid_puzzle"] },
        { label: "NUMERICAL INTELLIGENCE", keys: ["numerical_puzzle"] },
        { label: "VERBAL PRECISION", keys: ["verbal_precision_q1", "verbal_precision_q2", "verbal_precision_q3", "verbal_precision_q4"] },
        { label: "STRATEGIC VISION", keys: ["strategic_vision_q1", "strategic_vision_q2", "strategic_vision_q3", "strategic_vision_q4"] },
        { label: "ADAPTABILITY INDEX", keys: ["adaptability_assessment"] },
        { label: "COGNITIVE ALIGNMENT", keys: ["extracurriculars", "learning_preference", "ideal_environment", "risk_profile", "career_interests", "primary_motivation"] }
    ];

    return (
        <div className="chat-interface-container premium-container">
            <div className="chat-main-layout">
                <div className="chat-window-wrapper">
                    <div className="chat-window">
                        {sessionQuestions[currentQuestionIndex]?.instructions && (
                            <div className="system-instruction-box">
                                <span className="system-tag">INSTRUCTIONS</span>
                                <p>{sessionQuestions[currentQuestionIndex].instructions}</p>
                            </div>
                        )}

                        {sessionQuestions[currentQuestionIndex]?.type === 'grid_puzzle' ? (
                            <div className="puzzle-container">
                                <div className="puzzle-question">{sessionQuestions[currentQuestionIndex].text}</div>
                                <div className="puzzle-grid">
                                    {sessionQuestions[currentQuestionIndex].grid.flat().map((cell, idx) => (
                                        <div key={idx} className={`puzzle-cell ${cell === '?' ? 'question-mark' : ''}`}>
                                            <PuzzleShape type={cell} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : sessionQuestions[currentQuestionIndex]?.type === 'equation_puzzle' ? (
                            <div className="puzzle-container">
                                <div className="puzzle-question">{sessionQuestions[currentQuestionIndex].text}</div>
                                <div className="puzzle-equations">
                                    {sessionQuestions[currentQuestionIndex].equations.map((eq, i) => (
                                        <div key={i} className="equation-row">
                                            {eq.map((item, j) => (
                                                <span key={j} className="equation-item">
                                                    {['circle', 'triangle', 'square'].includes(item) ? (
                                                        <PuzzleShape type={item} />
                                                    ) : (
                                                        <span className="equation-operator">{item}</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : sessionQuestions[currentQuestionIndex]?.type === 'multi_choice_assessment' ? (
                            <div className="assessment-container">
                                {sessionQuestions[currentQuestionIndex].questions.map((q, i) => (
                                    <div key={i} className="assessment-card">
                                        <div className="assessment-question-text">{q.text}</div>
                                        <div className="assessment-options-grid">
                                            {q.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`assessment-option ${assessmentAnswers[q.id] === opt ? 'selected' : ''}`}
                                                    onClick={() => handleAssessmentSelect(q.id, opt)}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : sessionQuestions[currentQuestionIndex]?.type === 'adaptability_assessment' ? (
                            <div className="adaptability-container">
                                {glitchActive && (
                                    <div className="system-glitch-overlay">
                                        <div className="glitch-text">⚠️ CRITICAL SYSTEM UPDATE ⚠️</div>
                                        <div className="glitch-subtext">REWRITING REALITY DATABASE...</div>
                                    </div>
                                )}

                                {!glitchActive && adaptabilityStep === 0 && (
                                    <div className="adaptability-phase anchor-phase">
                                        <h3>Let's test your Adaptability Index.</h3>
                                        <p>First, choose a 'Focus Color' for this session. This will be your baseline.</p>
                                        <div className="adaptability-buttons">
                                            <button className="adaptability-btn red" onClick={() => handleAdaptabilityColor('red')}>RED</button>
                                            <button className="adaptability-btn blue" onClick={() => handleAdaptabilityColor('blue')}>BLUE</button>
                                        </div>
                                    </div>
                                )}

                                {!glitchActive && adaptabilityStep >= 1 && adaptabilityStep <= 3 && (
                                    <div className="adaptability-phase pattern-phase">
                                        <h3>{adaptabilityColor === 'red' ? "Red. A color of high energy." : "Blue it is. Let's see how fast your brain categorizes."}</h3>
                                        <p>Tag this item as '{sessionQuestions[currentQuestionIndex].scenarios[adaptabilityColor].baseline}' or 'Not {sessionQuestions[currentQuestionIndex].scenarios[adaptabilityColor].baseline}':</p>

                                        <div className="pattern-item-card">
                                            {sessionQuestions[currentQuestionIndex].scenarios[adaptabilityColor].items[adaptabilityStep - 1]}
                                        </div>

                                        <div className="adaptability-buttons">
                                            <button className={`adaptability-btn ${adaptabilityColor}`} onClick={() => handlePatternClick(sessionQuestions[currentQuestionIndex].scenarios[adaptabilityColor].baseline)}>
                                                {sessionQuestions[currentQuestionIndex].scenarios[adaptabilityColor].baseline}
                                            </button>
                                            <button className="adaptability-btn neutral" onClick={() => handlePatternClick(`Not ${sessionQuestions[currentQuestionIndex].scenarios[adaptabilityColor].baseline}`)}>
                                                Not {sessionQuestions[currentQuestionIndex].scenarios[adaptabilityColor].baseline}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!glitchActive && adaptabilityStep === 5 && (
                                    <div className="adaptability-phase trigger-phase">
                                        <h3 className="glitch-title">REALITY SHIFT DETECTED</h3>
                                        <p>The system has been rewritten. {adaptabilityColor === 'red' ? "Red is now Violet." : "Blue is now Green."}</p>
                                        <p className="trigger-question">{sessionQuestions[currentQuestionIndex].scenarios[adaptabilityColor].finalQuestion}</p>

                                        <div className="adaptability-options-stack">
                                            {sessionQuestions[currentQuestionIndex].scenarios[adaptabilityColor].options.map((opt, i) => (
                                                <button key={i} className="adaptability-option-btn" onClick={() => handleAdaptabilityFinal(opt)}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`chat-message ${msg.sender}`}>
                                        <span className="message-prefix">
                                            {msg.sender === 'ai' ? <AIIndicator /> : <UserIndicator />}
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
                            </>
                        )}
                    </div>

                    <div className="chat-control-wrapper">
                        {!isTyping && sessionQuestions[currentQuestionIndex]?.options && (
                            <div className={`choice-options-container ${['grid_puzzle', 'equation_puzzle'].includes(sessionQuestions[currentQuestionIndex].type) ? 'puzzle-options' : ''}`}>
                                {sessionQuestions[currentQuestionIndex].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        className="choice-button"
                                        onClick={() => handleChoiceSelect(option)}
                                    >
                                        {['triangle', 'square', 'circle'].includes(option) ? (
                                            <PuzzleShape type={option} />
                                        ) : (
                                            option
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {sessionQuestions[currentQuestionIndex]?.type === 'multi_choice_assessment' && (
                            <button
                                className="assessment-submit-btn control-area-btn"
                                onClick={handleAssessmentSubmit}
                                disabled={sessionQuestions[currentQuestionIndex].questions.some(q => !assessmentAnswers[q.id])}
                            >
                                CONTINUE
                            </button>
                        )}

                        {sessionQuestions[currentQuestionIndex]?.type !== 'multi_choice_assessment' && sessionQuestions[currentQuestionIndex]?.type !== 'adaptability_assessment' && (
                            <form onSubmit={handleSubmit} className="chat-input-area">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="chat-input"
                                    autoFocus
                                    placeholder={!sessionQuestions[currentQuestionIndex]?.allowInput && sessionQuestions[currentQuestionIndex]?.options ? "Select an option above..." : (isTyping || isAnalyzing ? "Processing..." : "Enter response...")}
                                    disabled={isTyping || isAnalyzing || (currentQuestionIndex >= sessionQuestions.length && !isManualPath) || (isManualPath && manualBrief) || (!sessionQuestions[currentQuestionIndex]?.allowInput && sessionQuestions[currentQuestionIndex]?.options)}
                                />
                            </form>
                        )}

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
                    {isAnalysisReady && (
                        <div className="sidebar-explore-section">
                            <button
                                className="explore-results-btn sidebar-btn"
                                onClick={handleExploreResults}
                            >
                                EXPLORE RESULTS
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ChatInterface;
