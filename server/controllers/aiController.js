import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Process a request through Gemini API
export const processGeminiRequest = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured on the server'
      });
    }
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      }
    );
    
    return res.status(200).json({
      success: true,
      data: response.data.candidates[0].content.parts[0].text
    });
    
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Error processing request with Gemini API',
      error: error.response?.data?.error?.message || error.message
    });
  }
}; 