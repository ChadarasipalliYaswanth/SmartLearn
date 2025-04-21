import React, { useState, useRef, useEffect } from 'react';
import './CourseChatbot.css';
import { FiX, FiSend, FiMinimize2, FiMaximize2, FiVideo, FiRefreshCw, FiInfo } from 'react-icons/fi';
import { getGeminiApiKey, saveGeminiApiKey, sendGeminiRequest, createLearningAssistantPrompt } from '../../utils/geminiUtils';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

// Custom Chatbot Icon Component
const ChatbotIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Base circle */}
    <circle cx="20" cy="20" r="20" fill="currentColor" opacity="0.15" />
    
    {/* Brain shape */}
    <path 
      d="M20 10C14.5 10 10 14.5 10 20C10 25.5 14.5 30 20 30C25.5 30 30 25.5 30 20C30 14.5 25.5 10 20 10Z" 
      fill="currentColor" 
      opacity="0.8"
    />
    
    {/* Left brain hemisphere */}
    <path 
      d="M15 15C15 15 13 17 13 20C13 23 15 25 15 25" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    
    {/* Right brain hemisphere */}
    <path 
      d="M25 15C25 15 27 17 27 20C27 23 25 25 25 25" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    
    {/* Brain connection paths */}
    <path 
      d="M15 17C15 17 18 16 20 16C22 16 25 17 25 17" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    
    <path 
      d="M15 20C15 20 18 21 20 21C22 21 25 20 25 20" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    
    <path 
      d="M15 23C15 23 18 24 20 24C22 24 25 23 25 23" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    
    {/* Thought/pulse circles */}
    <circle cx="32" cy="14" r="2" fill="white" opacity="0.7" className="pulse-circle-1" />
    <circle cx="34" cy="20" r="1.5" fill="white" opacity="0.5" className="pulse-circle-2" />
    <circle cx="31" cy="26" r="1" fill="white" opacity="0.3" className="pulse-circle-3" />
  </svg>
);

const CourseChatbot = ({ courseInfo, lectureNotes, currentLecture }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [apiKey, setApiKey] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const location = useLocation();
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Set initial welcome message
  useEffect(() => {
    const initialMessage = {
      id: 1,
      text: getWelcomeMessage(),
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [courseInfo?.title, currentLecture?._id, location.pathname]);

  // Get welcome message based on context and location
  const getWelcomeMessage = () => {
    // If we're on a specific lecture page
    if (currentLecture && currentLecture._id) {
      return `Hi there! I'm your AI course assistant. You're viewing "${currentLecture.title}". How can I help you with this lecture?`;
    } 
    // If we're on a course page
    else if (courseInfo && courseInfo.title) {
      return `Hi there! I'm your AI course assistant. You're viewing the course "${courseInfo.title}". How can I help you learn more effectively?`;
    } 
    // If we're on the homepage
    else if (location.pathname === '/' || location.pathname === '/home') {
      return "Welcome to our learning platform! I'm your AI assistant. How can I help you find courses or answer questions about our platform?";
    }
    // If we're on the courses page
    else if (location.pathname.includes('/courses')) {
      return "Looking for courses? I can help you find the right course or answer questions about our course offerings.";
    }
    // Default message
    else {
      return "Hi there! I'm your AI assistant. How can I help you with your learning today?";
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false); // Always open in full mode
      setUnreadMessages(0); // Reset unread count when opening
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setUnreadMessages(0); // Reset unread count when maximizing
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get current page context for better AI responses
  const getPageContext = () => {
    let pageContext = `Current page: ${location.pathname}`;
    
    if (location.pathname === '/' || location.pathname === '/home') {
      pageContext += "\nUser is on the homepage of the learning platform.";
    } else if (location.pathname.includes('/courses')) {
      pageContext += "\nUser is browsing courses on the platform.";
    } else if (location.pathname.includes('/profile')) {
      pageContext += "\nUser is viewing their profile page.";
    } else if (location.pathname.includes('/dashboard')) {
      pageContext += "\nUser is on their learning dashboard.";
    }
    
    return pageContext;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      if (!apiKey) {
        throw new Error('API key not set');
      }
      
      // Create prompt for Gemini with additional page context
      const pageContext = getPageContext();
      const prompt = createLearningAssistantPrompt(
        courseInfo,
        currentLecture,
        lectureNotes,
        inputText,
        pageContext
      );
      
      // Get response from Gemini API
      const aiResponse = await sendGeminiRequest(apiKey, prompt);
      
      const botResponse = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      
      // Increment unread count if chatbot is minimized
      if (isMinimized || !isOpen) {
        setUnreadMessages(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      
      const errorMessage = !apiKey 
        ? "Please set your Gemini API key to enable intelligent responses." 
        : "I'm having trouble connecting to my knowledge base. Please check your API key or try again later.";
      
      const errorResponse = {
        id: messages.length + 2,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Set API Key from input
  const handleApiKeyInput = () => {
    const key = prompt("Please enter your Gemini API key:", apiKey);
    if (key !== null) {
      setApiKey(key);
      saveGeminiApiKey(key);
      if (key) {
        alert("API key set successfully!");
      }
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt+C to toggle chatbot
      if (e.altKey && e.key === 'c') {
        toggleChatbot();
      }
      
      // Escape to close if open
      if (e.key === 'Escape' && isOpen) {
        toggleChatbot();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedKey = getGeminiApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Handle Enter key press in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="course-chatbot-container">
      {/* Chatbot toggle button */}
      <button 
        className={`chatbot-toggle ${unreadMessages > 0 && !isOpen ? 'pulse-notification' : ''}`}
        onClick={toggleChatbot}
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        title="AI Course Assistant (Alt+C)"
      >
        {isOpen ? <FiX /> : <div className="ai-icon-wrapper"><ChatbotIcon className="ai-robot-icon" /></div>}
        {unreadMessages > 0 && !isOpen && (
          <span className="notification-badge">{unreadMessages}</span>
        )}
      </button>
      
      {/* Chatbot main window */}
      {isOpen && (
        <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
          <div className="chatbot-header">
            <div className="chatbot-title">
              {currentLecture ? 
                <><FiVideo /> AI Lecture Assistant</> : 
                <><ChatbotIcon className="ai-robot-icon" /> EduChat Assistant</>
              }
              {unreadMessages > 0 && isMinimized && (
                <span className="notification-badge-mini">{unreadMessages}</span>
              )}
            </div>
            <div className="chatbot-controls">
              <button onClick={handleApiKeyInput} className="control-btn api-key-btn" title="Set Gemini API Key">
                <FiRefreshCw />
              </button>
              <button onClick={toggleMinimize} className="control-btn" title={isMinimized ? "Maximize" : "Minimize"}>
                {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
              </button>
              <button onClick={toggleChatbot} className="control-btn" title="Close">
                <FiX />
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              <div className="chatbot-messages">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                  >
                    <div className="message-content">
                      {message.sender === 'bot' ? (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      ) : (
                        message.text
                      )}
                    </div>
                    <div className="message-timestamp">{formatTimestamp(message.timestamp)}</div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message bot-message typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSubmit} className="chatbot-input">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about this course or website..."
                  aria-label="Type your message"
                  disabled={isLoading}
                />
                <button type="submit" disabled={!inputText.trim() || isLoading} title="Send">
                  <FiSend />
                </button>
              </form>
              {!apiKey && (
                <div className="api-key-notice">
                  <button onClick={handleApiKeyInput} className="api-key-btn">
                    <FiInfo /> Set Gemini API Key
                  </button>
                </div>
              )}
              <div className="chatbot-footer">
                <span className="powered-by">Powered by Google Gemini AI</span>
                <span className="keyboard-shortcut">Press Alt+C to toggle chatbot</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseChatbot; 