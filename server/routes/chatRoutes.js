import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { 
    getChats, 
    sendMessage, 
    getChatList, 
    searchUsers, 
    getAllUsers,
    getUnreadCount,
    markAsRead
} from '../controllers/chatController.js';

const router = express.Router();

// Get chat list
router.get('/list', isAuth, getChatList);

// Get all users
router.get('/users', isAuth, getAllUsers);

// Search users
router.get('/users/search', isAuth, searchUsers);

// Get unread message count
router.get('/unread/count', isAuth, getUnreadCount);

// Mark messages as read
router.put('/:userId/read', isAuth, markAsRead);

// Get chats with a specific user
router.get('/:userId', isAuth, getChats);

// Send a message
router.post('/send', isAuth, sendMessage);

export default router; 