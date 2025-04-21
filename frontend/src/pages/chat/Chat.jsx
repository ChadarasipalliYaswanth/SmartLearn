import React, { useState, useEffect, useRef } from 'react';
import { Container, Paper, Typography, Button, Tab, Tabs, Box, CircularProgress, Avatar, Badge, Tooltip, Divider, Snackbar, Alert } from '@mui/material';
import { UserData } from '../../context/UserContext';
import axios from 'axios';
import { server } from '../../main';
import { io } from 'socket.io-client';
import './Chat.css';
import { 
    Send as SendIcon, 
    Forum as ForumIcon,
    People as PeopleIcon,
    EmojiEmotions as EmojiIcon,
    AttachFile as AttachIcon,
    Search as SearchIcon,
    MoreVert as MoreIcon,
    Mic as MicIcon,
    FiberManualRecord as LiveIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import * as NotificationUtils from '../../utils/notifications';

const Chat = () => {
    const [chatList, setChatList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [tabValue, setTabValue] = useState(0); // 0 for chats, 1 for users
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChats, setActiveChats] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = UserData();
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);
    const [notification, setNotification] = useState({ open: false, message: '', sender: '', senderId: null });
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationQueue, setNotificationQueue] = useState([]);
    const originalTitle = useRef(document.title);
    const titleInterval = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        if (user && user._id) {
            // Connect to socket.io server
            socketRef.current = io(server.replace('/api', ''));
            
            // Join user's room
            socketRef.current.emit('join', user._id);
            
            // Listen for new messages
            socketRef.current.on('newMessage', (data) => {
                // If the message is from the currently selected chat, add it to the messages
                if (selectedChat && (data.senderId === selectedChat.userId || data.senderId === selectedChat._id)) {
                    setMessages(prevMessages => [...prevMessages, {
                        sender: { _id: data.senderId },
                        receiver: { _id: user._id },
                        message: data.message,
                        createdAt: data.timestamp
                    }]);
                    
                    // Mark new message as read right away
                    markMessagesAsRead(data.senderId);
                } else {
                    // Find sender name in chatList
                    const senderChat = chatList.find(chat => 
                        chat.user._id === data.senderId || 
                        chat._id === data.senderId
                    );
                    
                    const senderName = senderChat?.user?.name || 'Someone';
                    
                    // Add to notification queue
                    const newNotification = {
                        id: Date.now(),
                        sender: senderName,
                        message: data.message,
                        senderId: data.senderId,
                        timestamp: new Date()
                    };
                    
                    setNotificationQueue(prev => [...prev, newNotification]);
                    
                    // Show notification for the most recent message
                    setNotification({
                        open: true,
                        message: data.message,
                        sender: senderName,
                        senderId: data.senderId
                    });
                    
                    // Play notification sound
                    NotificationUtils.playNotificationSound();
                    
                    // Show browser notification
                    NotificationUtils.showBrowserNotification(
                        `New message from ${senderName}`,
                        data.message,
                        null,
                        () => {
                            // When notification is clicked, navigate to the chat
                            if (senderChat) {
                                handleChatClick(senderChat);
                                setTabValue(0); // Switch to chat tab
                            }
                        }
                    );
                    
                    // Increment unread count
                    setUnreadCount(prevCount => prevCount + 1);
                }
                
                // Update chat list to show the latest message
                fetchChatList();
                
                // Update active chats
                updateActiveChats(data.senderId);
            });
            
            // Listen for user online status
            socketRef.current.on('userStatus', (data) => {
                setOnlineUsers(data.onlineUsers || []);
            });
            
            // Clean up on unmount
            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [user, selectedChat]);
    
    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        fetchChatList();
        fetchAllUsers();
        
        // Request notification permission when the component mounts
        if ("Notification" in window) {
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }
        }
    }, []);

    useEffect(() => {
        if (selectedChat) {
            const userId = selectedChat.userId || selectedChat._id;
            fetchMessages(userId);
            markMessagesAsRead(userId);
            
            // Focus on message input when a chat is selected
            setTimeout(() => {
                messageInputRef.current?.focus();
            }, 300);
            
            console.log("Selected chat updated:", selectedChat);
        }
    }, [selectedChat]);
    
    // Update active chats
    const updateActiveChats = (userId) => {
        // Find the chat in the chat list
        const chatInfo = chatList.find(chat => 
            chat.user._id === userId || 
            chat.userId === userId || 
            chat._id === userId
        );
        
        if (!chatInfo) return;
        
        // Check if this chat is already in active chats
        setActiveChats(prev => {
            // Filter out this chat if it exists
            const filtered = prev.filter(chat => 
                chat.user._id !== userId && 
                chat.userId !== userId && 
                chat._id !== userId
            );
            
            // Add this chat to the beginning
            return [chatInfo, ...filtered].slice(0, 5); // Keep only the 5 most recent
        });
    };

    const fetchChatList = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${server}/api/chat/list`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            
            // Ensure we have valid data
            if (response.data && Array.isArray(response.data)) {
                setChatList(response.data);
                
                // Initialize active chats from the chat list if empty
                if (activeChats.length === 0 && response.data.length > 0) {
                    // Show only the first 3 most recent chats as active
                    setActiveChats(response.data.slice(0, 3)); 
                }
                
                // Log the chat lists for debugging
                setTimeout(debugChatList, 1000);
            } else {
                console.error('Invalid chat list data:', response.data);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching chat list:', error.response?.data || error.message);
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get(`${server}/api/chat/users`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            setUserList(response.data);
        } catch (error) {
            console.error('Error fetching users:', error.response?.data || error.message);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${server}/api/chat/${userId}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error.response?.data || error.message);
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            // Get the user ID depending on whether it's from chat list or user list
            const receiverId = selectedChat.userId || selectedChat._id || selectedChat.user?._id;
            
            if (!receiverId) {
                console.error('Cannot determine receiver ID');
                return;
            }
            
            // Add the message to the UI immediately for better UX
            const tempMessage = {
                _id: 'temp-' + Date.now(),
                sender: { _id: user._id, name: user.name },
                receiver: { _id: receiverId },
                message: newMessage,
                createdAt: new Date().toISOString(),
                isTemp: true
            };
            
            setMessages(prev => [...prev, tempMessage]);
            setNewMessage('');
            
            // Send via API
            const response = await axios.post(`${server}/api/chat/send`,
                {
                    receiverId,
                    message: newMessage
                },
                {
                    headers: {
                        token: localStorage.getItem('token')
                    }
                }
            );
            
            // Replace temp message with the actual one from the server
            setMessages(prev => 
                prev.map(msg => 
                    msg.isTemp && msg._id === tempMessage._id ? response.data : msg
                )
            );
            
            // Update chat list with latest message
            fetchChatList();
        } catch (error) {
            console.error('Error sending message:', error.response?.data || error.message);
        }
    };

    const startChatWithUser = (selectedUser) => {
        // Create a standardized chat object
        const chatObj = {
            _id: selectedUser._id,
            userId: selectedUser._id,
            name: selectedUser.name,
            user: selectedUser
        };
        
        setSelectedChat(chatObj);
        setTabValue(0); // Switch to chat tab
        
        // Update active chats to include this user
        updateActiveChats(selectedUser._id);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    };

    // Format time (e.g., "3:45 PM")
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date (e.g., "Today", "Yesterday", or "Jan 15")
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
    };

    // Improve the isRecentlyActive function
    const isRecentlyActive = (chat) => {
        if (!chat) return false;
        
        // Check for updatedAt (primary timestamp)
        if (chat.updatedAt) {
            const lastActivity = new Date(chat.updatedAt);
            const now = new Date();
            const timeDiff = now - lastActivity;
            // Consider a chat recently active if there was activity in the last 7 days
            return timeDiff < 7 * 24 * 60 * 60 * 1000;
        }
        
        // Fallback to lastMessageAt if available
        if (chat.lastMessageAt) {
            const lastMsgTime = new Date(chat.lastMessageAt);
            const now = new Date();
            const timeDiff = now - lastMsgTime;
            return timeDiff < 7 * 24 * 60 * 60 * 1000;
        }
        
        // If we have a lastMessage, treat as recently active
        if (chat.lastMessage && chat.lastMessage.trim() !== '') {
            return true;
        }
        
        // Default to false if no timestamp or message information
        return false;
    };

    // Improve the hasNewMessages function
    const hasNewMessages = (chat) => {
        // Check for unreadCount property
        if (chat.unreadCount && chat.unreadCount > 0) {
            return true;
        }
        
        // For backward compatibility
        if (chat.unread && chat.unread > 0) {
            return true;
        }
        
        return false;
    };

    // Handle clicking on a chat
    const handleChatClick = (chat) => {
        // Make sure we have a valid chat object
        if (!chat) return;
        
        console.log("Selected chat:", chat);
        
        // Determine the correct user ID
        const userId = chat.user?._id || chat._id || chat.userId;
        const name = chat.user?.name || chat.name;
        
        if (!userId) {
            console.error("Cannot determine user ID for chat:", chat);
            return;
        }
        
        // Create a standardized chat object
        const selectedChatObj = {
            _id: chat._id,
            userId: userId,
            name: name,
            user: chat.user || { _id: userId, name: name }
        };
        
        setSelectedChat(selectedChatObj);
        
        // Update active chats
        updateActiveChats(userId);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        
        // If switching to chat tab, reset unread count
        if (newValue === 0) {
            setUnreadCount(0);
        }
    };

    const markMessagesAsRead = async (userId) => {
        try {
            await axios.put(`${server}/api/chat/${userId}/read`, {}, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
        } catch (error) {
            console.error('Error marking messages as read:', error.response?.data || error.message);
        }
    };

    const getRandomColor = (str) => {
        if (!str) return '#6a1b9a';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4',
            '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    };

    // Filter users/chats based on search query
    const filteredUsers = userList.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredChats = chatList.filter(chat => 
        chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Check if a user is online
    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    // For categorizing chats
    const categorizeChats = () => {
        const ongoing = [];
        const previous = [];
        
        // First, skip only the exact same chats that are already in activeChats
        filteredChats.forEach(chat => {
            // Only check if chat is actually in activeChats array
            const isInActiveChats = activeChats.some(ac => 
                ac._id === chat._id || 
                (chat.user && ac.user && ac.user._id === chat.user._id)
            );
            
            if (isInActiveChats) return;
            
            // Check activity based on updatedAt or lastMessageTime
            const isRecent = isRecentlyActive(chat) || hasNewMessages(chat);
            
            if (isRecent) {
                ongoing.push(chat);
            } else {
                previous.push(chat);
            }
        });
        
        return { ongoing, previous };
    };

    // Add this function to log chat list for debugging
    const debugChatList = () => {
        console.log("Active Chats:", activeChats);
        console.log("All Chats:", chatList);
        const { ongoing, previous } = categorizeChats();
        console.log("Ongoing:", ongoing);
        console.log("Previous:", previous);
    };

    // Add a better empty state component
    const EmptyConversationsState = () => (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: 3
            }}
        >
            <ForumIcon 
                sx={{ 
                    fontSize: 64, 
                    color: 'text.disabled', 
                    mb: 2,
                    opacity: 0.6
                }} 
            />
            <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 1 }}>
                No Conversations Yet
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: 'text.disabled', maxWidth: '300px', mb: 3 }}>
                You haven't started any conversations. Go to the People tab and message someone to start chatting.
            </Typography>
            <Button 
                variant="contained" 
                color="primary"
                startIcon={<PeopleIcon />}
                onClick={() => setTabValue(1)}
                sx={{ borderRadius: '20px' }}
            >
                Find People
            </Button>
        </Box>
    );

    // Add a cleanup effect for title notifications
    useEffect(() => {
        // Set up title toggling when notifications are present
        let stopTitleNotification;
        if (unreadCount > 0) {
            stopTitleNotification = NotificationUtils.startTitleNotification(unreadCount, document.title);
        }
        
        // Clean up on unmount
        return () => {
            if (stopTitleNotification) {
                stopTitleNotification();
            }
        };
    }, [unreadCount]);

    // Handle notification click
    const handleNotificationClick = () => {
        if (notification.senderId) {
            // Find the chat with this sender
            const senderChat = chatList.find(chat => 
                chat.user?._id === notification.senderId || 
                chat._id === notification.senderId
            );
            
            // If we found the chat, select it
            if (senderChat) {
                handleChatClick(senderChat);
                setTabValue(0); // Switch to chat tab
            }
        }
        
        // Close the notification
        setNotification({ open: false, message: '', sender: '', senderId: null });
        
        // Show the next notification if there are any in the queue
        if (notificationQueue.length > 1) {
            // Remove the current one and show the next
            const updatedQueue = [...notificationQueue];
            updatedQueue.shift(); // Remove the one we just showed
            setNotificationQueue(updatedQueue);
            
            const nextNotification = updatedQueue[0];
            if (nextNotification) {
                setTimeout(() => {
                    setNotification({
                        open: true,
                        message: nextNotification.message,
                        sender: nextNotification.sender,
                        senderId: nextNotification.senderId
                    });
                }, 300);
            }
        } else {
            // Clear the queue if this was the last one
            setNotificationQueue([]);
        }
    };
    
    // Handle notification close
    const handleNotificationClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        
        // Close the notification
        setNotification({ open: false, message: '', sender: '', senderId: null });
        
        // Show the next notification if there are any in the queue
        if (notificationQueue.length > 1) {
            // Remove the current one and show the next
            const updatedQueue = [...notificationQueue];
            updatedQueue.shift(); // Remove the one we just showed
            setNotificationQueue(updatedQueue);
            
            const nextNotification = updatedQueue[0];
            if (nextNotification) {
                setTimeout(() => {
                    setNotification({
                        open: true,
                        message: nextNotification.message,
                        sender: nextNotification.sender,
                        senderId: nextNotification.senderId
                    });
                }, 300);
            }
        } else {
            // Clear the queue if this was the last one
            setNotificationQueue([]);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ 
            height: 'calc(100vh - 120px)', 
            mt: 3, 
            mb: 4,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    backgroundColor: '#f8fafc',
                }}
            >
                <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                        Messages
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            sx={{ 
                                minHeight: '40px',
                                '& .MuiTab-root': {
                                    minHeight: '40px',
                                    fontWeight: 500
                                }
                            }}
                        >
                            <Tab 
                                icon={
                                    <Badge 
                                        color="error" 
                                        badgeContent={unreadCount} 
                                        invisible={unreadCount === 0}
                                        sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: '16px', minWidth: '16px' } }}
                                    >
                                        <ForumIcon fontSize="small" />
                                    </Badge>
                                } 
                                label="Chats" 
                                sx={{ fontSize: '0.875rem' }}
                            />
                            <Tab 
                                icon={<PeopleIcon fontSize="small" />} 
                                label="People"
                                sx={{ fontSize: '0.875rem' }}
                            />
                        </Tabs>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <Box
                        className="chat-list"
                        sx={{ 
                            width: { xs: selectedChat ? '0px' : '100%', sm: '300px' },
                            minWidth: { xs: selectedChat ? '0px' : '100%', sm: '300px' },
                            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                            display: { xs: selectedChat ? 'none' : 'block', sm: 'block' },
                            transition: 'width 0.3s ease'
                        }}
                    >
                        <Box className="search-container" sx={{ p: 2 }}>
                            <Box className="search-input-wrapper">
                                <SearchIcon className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search messages or users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                                {searchQuery && (
                                    <Button
                                        size="small"
                                        className="clear-search-btn"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {tabValue === 0 ? (
                            <>
                                {activeChats.length > 0 && (
                                    <Box className="live-chats-section">
                                        <Box className="section-header">
                                            <Typography variant="body2" sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                color: 'text.primary',
                                                fontWeight: 600
                                            }}>
                                                <LiveIcon sx={{ color: '#4caf50', mr: 1, fontSize: '0.8rem' }} />
                                                Active Conversations
                                            </Typography>
                                        </Box>
                                        {activeChats.map((chat) => {
                                            const chatUser = chat.user || {};
                                            return (
                                                <Box 
                                                    key={chat._id || chatUser._id}
                                                    className={`chat-item recent-conversation ${selectedChat && (selectedChat._id === chat._id || (selectedChat.userId === chatUser._id) || (selectedChat._id === chatUser._id)) ? 'active' : ''} ${hasNewMessages(chat) ? 'has-new' : ''}`}
                                                    onClick={() => handleChatClick(chat)}
                                                    sx={{
                                                        borderLeft: '3px solid #4caf50',
                                                        backgroundColor: 'rgba(76, 175, 80, 0.08)'
                                                    }}
                                                >
                                                    <Box className="chat-avatar">
                                                        <Badge
                                                            overlap="circular"
                                                            variant="dot"
                                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                            color={isUserOnline(chatUser._id) ? "success" : "default"}
                                                        >
                                                            <Avatar 
                                                                sx={{ 
                                                                    bgcolor: getRandomColor(chatUser.name),
                                                                    border: '2px solid #4caf50'
                                                                }}
                                                            >
                                                                {getInitials(chatUser.name)}
                                                            </Avatar>
                                                        </Badge>
                                                    </Box>
                                                    <Box className="chat-info">
                                                        <Typography variant="body1" className="chat-item-name">
                                                            {chatUser.name}
                                                        </Typography>
                                                        <Typography variant="body2" className="chat-item-last-message">
                                                            {chat.lastMessage}
                                                        </Typography>
                                                    </Box>
                                                    <Box className="chat-meta">
                                                        <Typography variant="caption" className="chat-time" sx={{ color: '#4caf50' }}>
                                                            {formatTime(chat.updatedAt)}
                                                        </Typography>
                                                        {chat.unreadCount > 0 && (
                                                            <Box className="unread-badge" sx={{ backgroundColor: '#4caf50' }}>
                                                                {chat.unreadCount}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}

                                <Box sx={{ overflowY: 'auto', height: 'calc(100% - 170px)' }}>
                                    {(() => {
                                        const { ongoing, previous } = categorizeChats();
                                        return (
                                            <>
                                                {ongoing.length > 0 && (
                                                    <>
                                                        <Box className="section-header">
                                                            <Typography variant="body2" sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'center',
                                                                color: 'text.primary',
                                                                fontWeight: 500
                                                            }}>
                                                                <ForumIcon sx={{ color: '#4caf50', mr: 1, fontSize: '1rem' }} />
                                                                Recent Conversations
                                                            </Typography>
                                                        </Box>
                                                        {ongoing.map((chat) => {
                                                            const chatUser = chat.user || {};
                                                            return (
                                                                <Box 
                                                                    key={chat._id || chatUser._id}
                                                                    className={`chat-item recent-conversation ${selectedChat && (selectedChat._id === chat._id || selectedChat.userId === chatUser._id || selectedChat._id === chatUser._id) ? 'active' : ''} ${hasNewMessages(chat) ? 'has-new' : ''}`}
                                                                    onClick={() => handleChatClick(chat)}
                                                                    sx={{
                                                                        backgroundColor: 'rgba(76, 175, 80, 0.04)'
                                                                    }}
                                                                >
                                                                    <Box className="chat-avatar">
                                                                        <Badge
                                                                            overlap="circular"
                                                                            variant="dot"
                                                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                                            color={isUserOnline(chatUser._id) ? "success" : "default"}
                                                                        >
                                                                            <Avatar 
                                                                                sx={{ 
                                                                                    bgcolor: getRandomColor(chatUser.name)
                                                                                }}
                                                                            >
                                                                                {getInitials(chatUser.name)}
                                                                            </Avatar>
                                                                        </Badge>
                                                                    </Box>
                                                                    <Box className="chat-info">
                                                                        <Typography variant="body1" className="chat-item-name">
                                                                            {chatUser.name}
                                                                        </Typography>
                                                                        <Typography variant="body2" className="chat-item-last-message">
                                                                            {chat.lastMessage}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box className="chat-meta">
                                                                        <Typography variant="caption" className="chat-time" sx={{ color: '#4caf50' }}>
                                                                            {formatTime(chat.updatedAt)}
                                                                        </Typography>
                                                                        {chat.unreadCount > 0 && (
                                                                            <Box className="unread-badge" sx={{ backgroundColor: '#4caf50' }}>
                                                                                {chat.unreadCount}
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })}
                                                    </>
                                                )}

                                                {previous.length > 0 && (
                                                    <>
                                                        <Box className="section-header" sx={{ mt: 2 }}>
                                                            <Typography variant="body2" sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'center',
                                                                color: 'text.secondary',
                                                                fontWeight: 500
                                                            }}>
                                                                <ForumIcon sx={{ color: '#9e9e9e', mr: 1, fontSize: '1rem' }} />
                                                                Previous Conversations
                                                            </Typography>
                                                        </Box>
                                                        {previous.map((chat) => {
                                                            const chatUser = chat.user || {};
                                                            return (
                                                                <Box 
                                                                    key={chat._id || chatUser._id}
                                                                    className={`chat-item previous-conversation ${selectedChat && (selectedChat._id === chat._id || selectedChat.userId === chatUser._id || selectedChat._id === chatUser._id) ? 'active' : ''}`}
                                                                    onClick={() => handleChatClick(chat)}
                                                                >
                                                                    <Box className="chat-avatar">
                                                                        <Badge
                                                                            overlap="circular"
                                                                            variant="dot"
                                                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                                            color={isUserOnline(chatUser._id) ? "success" : "default"}
                                                                        >
                                                                            <Avatar 
                                                                                className="avatar"
                                                                                sx={{ bgcolor: getRandomColor(chatUser.name) }}
                                                                            >
                                                                                {getInitials(chatUser.name)}
                                                                            </Avatar>
                                                                        </Badge>
                                                                    </Box>
                                                                    <Box className="chat-info">
                                                                        <Typography variant="body1" className="chat-item-name">
                                                                            {chatUser.name}
                                                                        </Typography>
                                                                        <Typography variant="body2" className="chat-item-last-message">
                                                                            {chat.lastMessage}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box className="chat-meta">
                                                                        <Typography variant="caption" className="chat-time">
                                                                            {formatTime(chat.updatedAt)}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                                
                                                {loading && (
                                                    <Box className="loading-container">
                                                        <CircularProgress size={30} />
                                                    </Box>
                                                )}
                                                
                                                {chatList.length === 0 && !loading && (
                                                    <EmptyConversationsState />
                                                )}
                                            </>
                                        );
                                    })()}
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ overflowY: 'auto', height: 'calc(100% - 120px)', p: 1 }}>
                                {filteredUsers.map((userItem) => (
                                    <Box 
                                        key={userItem._id}
                                        className="chat-item"
                                        onClick={() => startChatWithUser(userItem)}
                                        sx={{ 
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                            }
                                        }}
                                    >
                                        <Box className="chat-avatar">
                                            <Badge
                                                overlap="circular"
                                                variant="dot"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                color={isUserOnline(userItem._id) ? "success" : "default"}
                                            >
                                                <Avatar sx={{ bgcolor: getRandomColor(userItem.name) }}>
                                                    {getInitials(userItem.name)}
                                                </Avatar>
                                            </Badge>
                                        </Box>
                                        <Box className="chat-info">
                                            <Typography variant="body1" className="chat-item-name">
                                                {userItem.name}
                                            </Typography>
                                            <Typography variant="body2" className="chat-item-email">
                                                {userItem.email}
                                            </Typography>
                                        </Box>
                                        <Box className="chat-action">
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                color="primary"
                                                sx={{ borderRadius: '20px', fontSize: '0.75rem' }}
                                            >
                                                Message
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                                
                                {loading && (
                                    <Box className="loading-container">
                                        <CircularProgress size={30} />
                                    </Box>
                                )}
                                
                                {filteredUsers.length === 0 && !loading && (
                                    <EmptyConversationsState />
                                )}
                            </Box>
                        )}
                    </Box>

                    <Box 
                        className="chat-messages" 
                        sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden',
                            display: { xs: selectedChat ? 'flex' : 'none', sm: 'flex' }
                        }}
                    >
                        {selectedChat ? (
                            <>
                                <Box 
                                    className="chat-header" 
                                    sx={{ 
                                        p: 2, 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                                        backgroundColor: '#fff',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box 
                                            sx={{ 
                                                display: { xs: 'flex', sm: 'none' }, 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                mr: 2,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setSelectedChat(null)}
                                        >
                                            <Box component="span" sx={{ fontSize: '1.5rem' }}>←</Box>
                                        </Box>
                                        <Box className="chat-header-avatar">
                                            <Badge
                                                overlap="circular"
                                                variant="dot"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                color={isUserOnline(selectedChat.userId || selectedChat._id) ? "success" : "default"}
                                            >
                                                <Avatar 
                                                    sx={{ 
                                                        width: 40, 
                                                        height: 40,
                                                        bgcolor: getRandomColor(selectedChat.name)
                                                    }}
                                                >
                                                    {getInitials(selectedChat.name)}
                                                </Avatar>
                                            </Badge>
                                        </Box>
                                        <Box className="chat-header-info" sx={{ ml: 1.5 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {selectedChat.name}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: isUserOnline(selectedChat.userId || selectedChat._id) ? 'success.main' : 'text.secondary',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {isUserOnline(selectedChat.userId || selectedChat._id) ? (
                                                    <>
                                                        <LiveIcon sx={{ fontSize: '0.7rem', mr: 0.5 }} /> Online
                                                    </>
                                                ) : 'Offline'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                
                                <Box 
                                    className="messages-container" 
                                    sx={{ 
                                        flex: 1, 
                                        overflowY: 'auto',
                                        backgroundColor: '#f8f9fa',
                                        p: 2
                                    }}
                                >
                                    {messages.length === 0 && !loading ? (
                                        <Box className="no-messages">
                                            <Typography variant="body1" align="center" sx={{ color: '#888', mt: 4 }}>
                                                No messages yet. Start the conversation by sending a message.
                                            </Typography>
                                        </Box>
                                    ) : loading ? (
                                        <Box className="loading-container">
                                            <CircularProgress size={30} />
                                        </Box>
                                    ) : (
                                        messages.map((message) => (
                                            <Box
                                                key={message._id}
                                                className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
                                            >
                                                <Box className="message-content">
                                                    {message.message}
                                                </Box>
                                                <Typography variant="caption" className="message-timestamp">
                                                    {formatDate(message.createdAt)}
                                                </Typography>
                                            </Box>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </Box>
                                
                                <form 
                                    onSubmit={sendMessage} 
                                    className="message-input-form"
                                    style={{ 
                                        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                                        padding: '16px',
                                        backgroundColor: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            mr: 1
                                        }}
                                    >
                                        <Tooltip title="Attach files">
                                            <Button 
                                                className="message-action-btn"
                                                sx={{ 
                                                    minWidth: '36px', 
                                                    width: '36px', 
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    padding: 0,
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                <AttachIcon fontSize="small" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Add emoji">
                                            <Button 
                                                className="message-action-btn"
                                                sx={{ 
                                                    minWidth: '36px', 
                                                    width: '36px', 
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    padding: 0,
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                <EmojiIcon fontSize="small" />
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                    
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="message-input"
                                        ref={messageInputRef}
                                        style={{
                                            flex: 1,
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '24px',
                                            padding: '12px 16px',
                                            outline: 'none',
                                            fontSize: '14px',
                                            transition: 'border-color 0.3s',
                                        }}
                                    />
                                    
                                    <Button
                                        type="submit"
                                        className="send-button"
                                        disabled={!newMessage.trim()}
                                        sx={{
                                            minWidth: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                            '&:disabled': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                                color: 'rgba(0, 0, 0, 0.26)',
                                            }
                                        }}
                                    >
                                        <SendIcon fontSize="small" />
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <Box
                                className="no-chat-selected"
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    backgroundColor: '#f8f9fa'
                                }}
                            >
                                <ForumIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Select a conversation
                                </Typography>
                                <Typography variant="body2" align="center" sx={{ color: 'text.disabled', maxWidth: '300px' }}>
                                    Choose from existing conversations or start a new one by selecting a person from the People tab.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Paper>
            
            {/* In-app notification toast */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 7 }}
            >
                <Alert 
                    onClose={handleNotificationClose}
                    severity="info"
                    onClick={handleNotificationClick}
                    icon={<NotificationsIcon fontSize="inherit" />}
                    sx={{ 
                        width: '100%',
                        cursor: 'pointer',
                        alignItems: 'flex-start',
                        '& .MuiAlert-message': { width: '100%' }
                    }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        New message from {notification.sender}
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                        {notification.message}
                    </Typography>
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Chat; 