import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";
import { FiSave, FiPlus, FiMinus, FiX } from "react-icons/fi";

const TestForm = ({ lectureId, onClose, onSuccess, lecture }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [isExistingTest, setIsExistingTest] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    // Validate lecture ID
    if (!lectureId) {
      toast.error("No lecture selected. Please select a lecture first.");
      if (onClose) onClose();
      return;
    }
    
    console.log("Lecture ID in TestForm:", lectureId);
    console.log("Lecture object:", lecture);
    
    // Set default title based on lecture
    if (lecture && lecture.title) {
      setTitle(`Test: ${lecture.title}`);
      setDescription(`Test your knowledge of the lecture: ${lecture.title}`);
    }

    // Check if test already exists
    const checkForExistingTest = async () => {
      try {
        const { data } = await axios.get(
          `${server}/api/lecture/${lectureId}/test`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        
        if (data.test) {
          setIsExistingTest(true);
          setTitle(data.test.title);
          setDescription(data.test.description);
          setQuestions(data.test.questions);
        }
      } catch (error) {
        // No existing test found, continue with new test creation
        if (error.response && error.response.status === 404) {
          console.log("No existing test found, creating new test");
        } else {
          console.error("Error checking for existing test:", error);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    checkForExistingTest();
  }, [lectureId, lecture]);

  useEffect(() => {
    if (questions.length === 0) {
      // Add initial question when form loads
      setQuestions([{
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }]);
    }
    
    // Ensure form scrolls to the top when it first loads
    if (formRef.current) {
      formRef.current.scrollTop = 0;
    }
  }, []);

  // Auto-scroll to the new question when added
  const scrollToBottom = () => {
    setTimeout(() => {
      if (formRef.current) {
        const lastQuestion = formRef.current.querySelector('.question-item:last-child');
        if (lastQuestion) {
          lastQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  // Add more questions until we have 4
  const addQuestion = () => {
    if (questions.length < 4) {
      setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
      scrollToBottom();
    }
  };

  // Remove a question
  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  // Update question text
  const updateQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  // Update option text
  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  // Update correct answer
  const updateCorrectAnswer = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  // Verify API connectivity
  const testApiConnectivity = async () => {
    try {
      const response = await axios.get(
        `${server}/api/test-route-check`,
        {
          headers: {
            token: localStorage.getItem("token"),
          }
        }
      );
      console.log("API connectivity test result:", response.data);
      toast.success("API connectivity test successful");
    } catch (error) {
      console.error("API connectivity test failed:", error);
      toast.error("API connectivity test failed");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!lectureId) {
      toast.error("No lecture selected. Please select a lecture first.");
      return;
    }
    
    // Validate form
    if (!title.trim() || !description.trim()) {
      return toast.error("Please provide title and description");
    }
    
    if (questions.length !== 4) {
      return toast.error("Please add exactly 4 questions");
    }
    
    // Check if all questions and options are filled
    for (const q of questions) {
      if (!q.question.trim()) {
        return toast.error("Please fill in all question fields");
      }
      
      for (const opt of q.options) {
        if (!opt.trim()) {
          return toast.error("Please fill in all option fields");
        }
      }
    }
    
    setLoading(true);
    console.log("Submitting test:", { title, description, questions, lectureId });
    
    try {
      // Test API connectivity first
      await testApiConnectivity();
      
      let response;
      // If test exists, use PUT to update, otherwise use POST to create
      if (isExistingTest) {
        console.log("Updating existing test for lecture:", lectureId);
        response = await axios.put(
          `${server}/api/lecture/${lectureId}/test`,
          { title, description, questions },
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("Test update response:", response.data);
        toast.success("Test updated successfully");
      } else {
        console.log("Creating new test for lecture:", lectureId);
        response = await axios.post(
          `${server}/api/lecture/${lectureId}/test`,
          { title, description, questions },
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("Test creation response:", response.data);
        toast.success("Test created successfully");
      }
      
      setLoading(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error with test:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || `Failed to ${isExistingTest ? 'update' : 'create'} test`);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="test-form-container">
        <div className="test-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Test Form...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="test-form-container">
      <div className="test-form-header">
        <h2>{isExistingTest ? "Update Test" : "Create Test"} for Lecture</h2>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
      </div>
      
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Test Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter test title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Test Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter test description and instructions"
            required
          ></textarea>
        </div>
        
        <div className="questions-container">
          <h3>Questions ({questions.length}/4)</h3>
          
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-item">
              <div className="question-header">
                <h4>Question {qIndex + 1}</h4>
                <button 
                  type="button" 
                  className="remove-btn"
                  onClick={() => removeQuestion(qIndex)}
                >
                  <FiMinus />
                </button>
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, e.target.value)}
                  placeholder="Enter question text"
                  required
                />
              </div>
              
              <div className="options-container">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="option-item">
                    <input
                      type="radio"
                      name={`correct_${qIndex}`}
                      checked={q.correctAnswer === optIndex}
                      onChange={() => updateCorrectAnswer(qIndex, optIndex)}
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {questions.length < 4 && (
            <button 
              type="button" 
              className="common-btn add-question-btn"
              onClick={addQuestion}
            >
              <FiPlus /> Add Question
            </button>
          )}
        </div>
        
        <div className="form-footer">
          <p className="note">* Select the radio button next to the correct answer for each question</p>
          <div className="button-group">
            <button 
              type="button" 
              className="common-btn api-test-btn"
              onClick={testApiConnectivity}
            >
              Test API Connection
            </button>
            <button 
              type="submit" 
              className="common-btn"
              disabled={loading || questions.length !== 4}
            >
              {loading ? 
                (isExistingTest ? "Updating Test..." : "Creating Test...") : 
                (<>{isExistingTest ? <FiSave /> : <FiPlus />} {isExistingTest ? "Update" : "Create"} Test</>)
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TestForm; 