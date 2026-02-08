import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { processGeminiRequest } from '../controllers/aiController.js';

const router = express.Router();

// Process a request with Gemini API
router.post('/gemini', isAuth, processGeminiRequest);

export default router; 