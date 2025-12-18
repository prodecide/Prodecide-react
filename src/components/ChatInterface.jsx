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

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (currentQuestionIndex < questions.length) {
            typeMessage(questions[currentQuestionIndex]);
        } else {
            typeMessage("Thank you for your responses. Analyzing your profile...");
            // Future logic for analysis or result display would go here
        }
    }, [currentQuestionIndex]);

    const typeMessage = async (text) => {
        setIsTyping(true);
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Add message progressively or just full message with blinking cursor simulation
        // For this implementation, we'll just add the AI message.
        // To make it look cooler, we could type it char by char, but let's keep it simple first.
        setMessages(prev => [...prev, { sender: 'ai', text }]);
        setIsTyping(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message
        const newMessages = [...messages, { sender: 'user', text: inputValue }];
        setMessages(newMessages);
        setInputValue('');

        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
    };

    return (
        <div className="chat-interface-container">
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        {msg.sender === 'ai' && (
                            <div className="ai-bubble"></div>
                        )}
                        <span className="message-text">{msg.text}</span>
                    </div>
                ))}
                {isTyping && (
                    <div className="chat-message ai">
                        <div className="ai-bubble"></div>
                        <span className="typing-cursor">█</span>
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
                    placeholder={isTyping ? "..." : "Type your answer..."}
                    disabled={isTyping || currentQuestionIndex >= questions.length}
                />
            </form>
        </div>
    );
};

export default ChatInterface;
