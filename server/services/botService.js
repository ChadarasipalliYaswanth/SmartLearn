import Chat from '../models/Chat.js';
import { BotUser, ensureBotUserExists } from '../models/BotUser.js';
import { getAIMLResponse, shouldUseAIML } from './aimlService.js';
import mongoose from 'mongoose';

// Initialize the bot when service is loaded
let botUser = null;

/**
 * Initialize the bot user
 * @returns {Promise<Object>} The bot user object
 */
export const initializeBot = async () => {
  try {
    botUser = await ensureBotUserExists();
    return botUser;
  } catch (error) {
    console.error('Failed to initialize bot:', error);
    throw error;
  }
};

/**
 * Check if a message should be handled by the bot
 * @param {string} message - The message content
 * @returns {boolean} - Whether the bot should respond
 */
export const shouldBotRespond = (message) => {
  return shouldUseAIML(message);
};

/**
 * Get bot's response to a user message
 * @param {string} message - The user's message
 * @returns {string} - The bot's response
 */
export const getBotResponse = (message) => {
  return getAIMLResponse(message);
};

/**
 * Process an incoming message and generate a bot response if appropriate
 * @param {Object} chatMessage - The chat message object
 * @param {Object} sender - The sender user object
 * @returns {Promise<Object|null>} - The bot's response message or null
 */
export const processBotResponse = async (chatMessage, sender) => {
  try {
    // Ensure bot is initialized
    if (!botUser) {
      await initializeBot();
    }
    
    // Check if this is a message the bot should handle
    if (!shouldBotRespond(chatMessage.message)) {
      return null;
    }
    
    // Get bot's response to the message
    const responseText = getBotResponse(chatMessage.message);
    
    // Create a new chat message from the bot
    const botResponse = new Chat({
      sender: botUser._id,
      receiver: sender._id,
      message: responseText,
      read: false,
    });
    
    await botResponse.save();
    
    // Return the populated message
    const populatedResponse = await Chat.findById(botResponse._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');
      
    return populatedResponse;
  } catch (error) {
    console.error('Error generating bot response:', error);
    return null;
  }
};

/**
 * Get the bot user profile
 * @returns {Promise<Object>} - The bot user
 */
export const getBotUser = async () => {
  if (!botUser) {
    await initializeBot();
  }
  return botUser;
}; 