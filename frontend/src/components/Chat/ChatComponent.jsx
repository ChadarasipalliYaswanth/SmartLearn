import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './ChatComponent.css';

const ChatComponent = () => {
    const [chatList, setChatList] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const { user } = useSelector((state) => state.auth);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchChatList();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.user._id);
        }
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChatList = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/chat/list', {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            setChatList(response.data);
        } catch (error) {
            console.error('Error fetching chat list:', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/chat/${userId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const response = await axios.post('http://localhost:5000/api/chat/send', 
                {
                    receiverId: selectedChat.user._id,
                    message: newMessage
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );
            setMessages([...messages, response.data]);
            setNewMessage('');
            fetchChatList(); // Update chat list to show latest message
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-list">
                <h2>Conversations</h2>
                {chatList.map((chat) => (
                    <div
                        key={chat.user._id}
                        className={`chat-item ${selectedChat?.user._id === chat.user._id ? 'active' : ''}`}
                        onClick={() => setSelectedChat(chat)}
                    >
                        <div className="chat-item-name">{chat.user.name}</div>
                        <div className="chat-item-last-message">{chat.lastMessage}</div>
                    </div>
                ))}
            </div>
            <div className="chat-messages">
                {selectedChat ? (
                    <>
                        <div className="chat-header">
                            <h3>{selectedChat.user.name}</h3>
                        </div>
                        <div className="messages-container">
                            {messages.map((message) => (
                                <div
                                    key={message._id}
                                    className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
                                >
                                    <div className="message-content">{message.message}</div>
                                    <div className="message-timestamp">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="message-input-form">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="message-input"
                            />
                            <button type="submit" className="send-button">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatComponent; 