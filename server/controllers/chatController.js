import Chat from '../models/Chat.js';
import { User } from '../models/User.js';
import { processBotResponse, getBotUser, initializeBot } from '../services/botService.js';

// Initialize bot when server starts
(async () => {
    try {
        await initializeBot();
        console.log('Bot service initialized');
    } catch (error) {
        console.error('Failed to initialize bot service:', error);
    }
})();

// Get all chats between two users
export const getChats = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user._id;

        const chats = await Chat.find({
            $or: [
                { sender: currentUser, receiver: userId },
                { sender: userId, receiver: currentUser }
            ]
        })
        .sort({ timestamp: 1 })
        .populate('sender', 'name email')
        .populate('receiver', 'name email');

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user._id;

        if (!receiverId || !message) {
            return res.status(400).json({ message: "Receiver ID and message are required" });
        }

        const newChat = new Chat({
            sender: senderId,
            receiver: receiverId,
            message
        });

        await newChat.save();

        const populatedChat = await Chat.findById(newChat._id)
            .populate('sender', 'name email')
            .populate('receiver', 'name email');
            
        // Process bot response if the message is not already to/from the bot
        const botUser = await getBotUser();
        if (receiverId !== botUser._id.toString() && senderId !== botUser._id.toString()) {
            // Process the message through the bot service
            const botResponse = await processBotResponse(newChat, req.user);
            
            // If there's a bot response, include it in the response
            if (botResponse) {
                res.status(201).json({
                    userMessage: populatedChat,
                    botResponse: botResponse
                });
                return;
            }
        }

        res.status(201).json(populatedChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get chat list (unique users the current user has chatted with)
export const getChatList = async (req, res) => {
    try {
        const currentUser = req.user._id;

        // Find all chats where the current user is either sender or receiver
        const chats = await Chat.find({
            $or: [
                { sender: currentUser },
                { receiver: currentUser }
            ]
        })
        .sort({ createdAt: -1 }) // Sort by newest first
        .populate('sender', 'name email')
        .populate('receiver', 'name email');
        
        // Create a map to store the latest chat for each user
        const userMap = new Map();
        
        chats.forEach(chat => {
            // Determine if the other user is the sender or receiver
            const otherUserId = chat.sender._id.toString() === currentUser.toString() 
                ? chat.receiver._id.toString() 
                : chat.sender._id.toString();
                
            // If we haven't seen this user yet, add them to the map
            if (!userMap.has(otherUserId)) {
                const otherUser = chat.sender._id.toString() === currentUser.toString() 
                    ? chat.receiver 
                    : chat.sender;
                    
                userMap.set(otherUserId, {
                    user: otherUser,
                    lastMessage: chat.message,
                    timestamp: chat.createdAt
                });
            }
        });
        
        // Convert the map values to an array and sort by timestamp (newest first)
        const chatList = Array.from(userMap.values())
            .sort((a, b) => b.timestamp - a.timestamp);
            
        res.status(200).json(chatList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search users to start a new chat
export const searchUsers = async (req, res) => {
    try {
        const { term } = req.query;
        const currentUser = req.user._id;
        
        if (!term) {
            return res.status(400).json({ message: "Search term is required" });
        }
        
        // Search users by name or email, excluding current user
        const users = await User.find({
            $and: [
                { _id: { $ne: currentUser } }, // Not equal to current user
                {
                    $or: [
                        { name: { $regex: term, $options: 'i' } }, // Case insensitive search
                        { email: { $regex: term, $options: 'i' } }
                    ]
                }
            ]
        }).select('name email _id');
        
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users for chat
export const getAllUsers = async (req, res) => {
    try {
        const currentUser = req.user._id;
        
        // Get all users except the current user
        const users = await User.find({ _id: { $ne: currentUser } })
            .select('name email _id')
            .sort({ name: 1 });
            
        // Add the bot user to the list
        const botUser = await getBotUser();
        if (botUser) {
            users.unshift({
                _id: botUser._id,
                name: botUser.name,
                email: botUser.email,
                isBot: true
            });
        }
        
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
    try {
        const currentUser = req.user._id;
        
        // Create a model for tracking read/unread status if it doesn't exist yet
        // For now, we'll count all messages received as unread for simplicity
        const chats = await Chat.find({
            receiver: currentUser,
            read: { $ne: true } // Only count messages that haven't been marked as read
        });
        
        const count = chats.length;
        
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const currentUser = req.user._id;
        const { userId } = req.params;
        
        // Mark all messages from this user as read
        await Chat.updateMany(
            {
                sender: userId,
                receiver: currentUser,
                read: { $ne: true }
            },
            { read: true }
        );
        
        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 