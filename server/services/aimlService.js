/**
 * AIML-inspired pattern matching service
 * This service provides basic pattern matching functionality similar to AIML
 * (Artificial Intelligence Markup Language) for automated responses
 */

// Basic AIML-like categories structure with patterns and templates
const categories = [
  {
    pattern: "hello",
    template: "Hello! How can I help you with your learning today?"
  },
  {
    pattern: "hi",
    template: "Hi there! Do you have questions about your courses?"
  },
  {
    pattern: "how do i submit an assignment",
    template: "To submit an assignment: 1) Navigate to 'My Assignments' 2) Find your assignment 3) Click 'Submit' and upload your files 4) Click 'Submit Assignment'"
  },
  {
    pattern: "when is * due",
    template: "To check when an assignment is due, please go to the 'My Assignments' section and check the deadline for the specific assignment."
  },
  {
    pattern: "how do i access *",
    template: "You can access course materials by going to your dashboard and selecting the course. All resources will be available in the course study page."
  },
  {
    pattern: "where can i find my grades",
    template: "You can view your grades in your dashboard under each course's progress section."
  },
  {
    pattern: "how to contact instructor",
    template: "You can contact your instructor through the chat feature. Just search for their name and send them a message."
  },
  {
    pattern: "help",
    template: "I can help with: course navigation, assignments, grades, contacting instructors, and technical issues. What do you need help with?"
  },
  {
    pattern: "*",
    template: "I don't have a specific answer for that. Please try asking in a different way or contact support for more help."
  }
];

/**
 * Simple pattern matching function that handles exact matches and wildcard patterns
 * @param {string} userInput - The user's input message
 * @param {string} pattern - The pattern to match against
 * @returns {boolean} - Whether the pattern matches
 */
const matchPattern = (userInput, pattern) => {
  // Convert both to lowercase for case-insensitive matching
  userInput = userInput.toLowerCase().trim();
  pattern = pattern.toLowerCase().trim();

  // Exact match
  if (pattern === userInput) {
    return true;
  }

  // Wildcard pattern (e.g., "how do i access *")
  if (pattern.includes("*")) {
    const parts = pattern.split("*");
    // Check if the input starts with the first part of the pattern
    if (parts[0] && !userInput.startsWith(parts[0])) {
      return false;
    }
    // For single wildcard patterns, this is sufficient
    if (parts.length === 2 && parts[1] === "") {
      return userInput.startsWith(parts[0]);
    }
    // More complex wildcard handling could be implemented here
    return true;
  }

  return false;
};

/**
 * Get a response based on the user's input using pattern matching
 * @param {string} userInput - The user's input message
 * @returns {string} - The automated response
 */
export const getAIMLResponse = (userInput) => {
  // Guard against empty input
  if (!userInput || userInput.trim() === "") {
    return "I'm not sure I understand. Could you please rephrase your question?";
  }

  // Find matching category
  for (const category of categories) {
    if (matchPattern(userInput, category.pattern)) {
      return category.template;
    }
  }

  // Default response if no pattern matches
  return "I don't understand that specific question. Please try asking something about your courses, assignments, or learning resources.";
};

/**
 * Determine if a message should be handled by the AIML system
 * This allows the system to be selective about when to use automated responses
 * @param {string} message - The message to evaluate
 * @returns {boolean} - Whether the message should be handled by AIML
 */
export const shouldUseAIML = (message) => {
  // Only respond to short questions and common help requests
  return message.length < 100 && 
         (message.includes("?") || 
          message.toLowerCase().includes("help") ||
          message.toLowerCase().includes("how") ||
          message.toLowerCase().startsWith("where") ||
          message.toLowerCase().startsWith("when") ||
          message.toLowerCase().startsWith("what") ||
          message.toLowerCase().startsWith("who"));
}; 