import mongoose from 'mongoose';

// This is a special user record for the AI assistant bot
const botUserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        default: 'aiml-support-bot'
    },
    name: {
        type: String,
        required: true,
        default: 'Learning Assistant'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        default: 'assistant@elearning.com'
    },
    role: {
        type: String,
        default: 'bot'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const BotUser = mongoose.model('BotUser', botUserSchema);

// Create default bot user if it doesn't exist
export const ensureBotUserExists = async () => {
    try {
        const existingBot = await BotUser.findOne({ userId: 'aiml-support-bot' });
        if (!existingBot) {
            const newBot = new BotUser();
            await newBot.save();
            console.log('Created AI assistant bot user');
            return newBot;
        }
        return existingBot;
    } catch (error) {
        console.error('Error creating bot user:', error);
        throw error;
    }
}; 