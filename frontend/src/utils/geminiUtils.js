import axios from 'axios';
import { server } from '../main';

/**
 * Retrieves the Gemini API key from local storage
 * @returns {string|null} The API key or null if not set
 */
export const getGeminiApiKey = () => {
  return localStorage.getItem('geminiApiKey');
};

/**
 * Saves the Gemini API key to local storage
 * @param {string} key The API key to save
 */
export const saveGeminiApiKey = (key) => {
  localStorage.setItem('geminiApiKey', key);
};

/**
 * Clears the stored Gemini API key
 */
export const clearGeminiApiKey = () => {
  localStorage.removeItem('geminiApiKey');
};

/**
 * Sends a request to the Gemini API through our server
 * @param {string} apiKey The Gemini API key (for client-side fallback)
 * @param {string} prompt The prompt to send to the API
 * @param {Object} options Additional options for the API request
 * @returns {Promise<string>} The AI response
 */
export const sendGeminiRequest = async (apiKey, prompt, options = {}) => {
  try {
    // Try server-side API first
    try {
      const response = await axios.post(
        `${server}/api/ai/gemini`,
        { prompt },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          }
        }
      );

      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (serverError) {
      console.log('Server API failed, falling back to client-side:', serverError);
      // If server-side fails, fall back to client-side
      if (!apiKey) {
        throw new Error('API key is required for client-side fallback');
      }
    }

    // Client-side fallback using the provided API key
    const defaultOptions = {
      temperature: 0.7,
      maxOutputTokens: 800,
      model: 'gemini-1.5-pro'
    };

    const requestOptions = { ...defaultOptions, ...options };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${requestOptions.model}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: requestOptions.temperature,
          maxOutputTokens: requestOptions.maxOutputTokens
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    if (error.response?.data?.error) {
      throw new Error(`Gemini API error: ${error.response.data.error.message}`);
    }
    
    throw new Error('Failed to communicate with Gemini API. Please check your API key and try again.');
  }
};

/**
 * Creates a learning assistant prompt with course context
 * @param {Object} courseInfo The course information
 * @param {Object} currentLecture The current lecture (if any)
 * @param {string} lectureNotes Lecture notes content (if any)
 * @param {string} userQuery The user's question
 * @param {string} pageContext Additional context about the current page
 * @returns {string} The formatted prompt for the AI
 */
export const createLearningAssistantPrompt = (courseInfo, currentLecture, lectureNotes, userQuery, pageContext = '') => {
  let context = "";
  
  // Add page context if available
  if (pageContext) {
    context += `PAGE CONTEXT:
${pageContext}
`;
  }
  
  if (courseInfo) {
    context += `COURSE INFORMATION:
Title: ${courseInfo.title || 'Not available'}
Instructor: ${courseInfo.createdBy || 'Not available'}
Description: ${courseInfo.description || 'Not available'}
Duration: ${courseInfo.duration || 'Not available'} weeks
`;
  }

  if (currentLecture) {
    context += `\nCURRENT LECTURE:
Title: ${currentLecture.title || 'Not available'}
Description: ${currentLecture.description || 'Not available'}
`;
  }

  if (lectureNotes) {
    context += `\nLECTURE NOTES SUMMARY:
${lectureNotes}
`;
  }

  return `You are an AI assistant for an e-learning platform. Your role is to help students with their course-related questions and assist with platform navigation.
                  
Context:
${context}

Instructions:
- Be helpful, concise, and educational in your responses
- If you don't know something specific about the course or platform, acknowledge that and provide general guidance
- Focus on explaining concepts clearly and providing learning strategies
- For code examples, use markdown formatting with \`\`\` code blocks
- Avoid making up facts about the course content that aren't provided in the context
- Keep responses concise and focused on the student's question
- You can use markdown formatting for better readability in your responses

User question: ${userQuery}`;
}; 