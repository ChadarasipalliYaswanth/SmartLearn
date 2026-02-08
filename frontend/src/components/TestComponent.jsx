import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";
import { FiCheckCircle, FiAward, FiClipboard, FiDownload, FiChevronDown } from "react-icons/fi";
import Certificate from "./Certificate";
import { CircularProgress } from "@mui/material";
import { Button } from "@mui/material";

const TestComponent = ({ lectureId, onClose }) => {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const questionsListRef = useRef(null);

  // Fetch test for this lecture
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await axios.get(
          `${server}/api/lecture/${lectureId}/test`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        
        setTest(data.test);
        // Initialize answers array with null values
        setAnswers(new Array(data.test.questions.length).fill(null));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching test:", error);
        toast.error(error.response?.data?.message || "Failed to load test");
        setLoading(false);
      }
    };

    fetchTest();
  }, [lectureId]);

  // Update answer for a specific question
  const updateAnswer = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // Submit test answers
  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.includes(null)) {
      return toast.error("Please answer all questions before submitting");
    }
    
    setSubmitting(true);
    
    try {
      const { data } = await axios.post(
        `${server}/api/test/${test._id}/submit`,
        { answers },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      
      setResult(data);
      setSubmitting(false);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error(error.response?.data?.message || "Failed to submit test");
      setSubmitting(false);
    }
  };

  // Check if all questions are answered
  const allQuestionsAnswered = () => {
    return answers.every((answer) => answer !== null);
  };

  // Scroll to next unanswered question
  const scrollToNextUnanswered = () => {
    if (!questionsListRef.current) return;
    
    const unansweredIndex = answers.findIndex(answer => answer === null);
    if (unansweredIndex !== -1) {
      const questionElements = questionsListRef.current.querySelectorAll('.question-box');
      if (questionElements[unansweredIndex]) {
        questionElements[unansweredIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Effect to scroll to next unanswered question when answers change
  useEffect(() => {
    // Only attempt to scroll if test is loaded and we have a questions list
    if (test && questionsListRef.current && !result) {
      const allAnswered = !answers.includes(null);
      if (!allAnswered) {
        // Short delay to ensure UI is updated
        const timer = setTimeout(scrollToNextUnanswered, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [answers, test, result]);

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  // Show certificate if user passed the test
  if (showCertificate && result?.certificate) {
    return (
      <Certificate 
        certificate={result.certificate} 
        onClose={() => setShowCertificate(false)} 
      />
    );
  }

  // Show test results after submission
  if (result) {
    return (
      <div className="test-result-container">
        <div className="test-result-header">
          <h2>{result.passed ? "Congratulations!" : "Test Results"}</h2>
        </div>
        
        <div className="test-result-content">
          <div className="score-display">
            <div className="score-circle">
              <span className="score-value">{result.score}</span>
              <span className="score-total">/{result.totalQuestions}</span>
            </div>
          </div>
          
          <div className="result-details">
            {result.passed ? (
              <>
                <p className="success-message">
                  <FiCheckCircle /> You have successfully passed the test!
                </p>
                <p>
                  You scored {result.score} out of {result.totalQuestions} questions correctly. 
                  The passing score was {result.passingMarks} (more than 2 correct answers).
                </p>
                <button 
                  className="common-btn certificate-btn" 
                  onClick={() => setShowCertificate(true)}
                >
                  <FiAward /> View Certificate
                </button>
              </>
            ) : (
              <>
                <p className="failure-message">
                  You scored {result.score} out of {result.totalQuestions}.
                </p>
                <p>
                  You need at least {result.passingMarks} correct answers (more than 2) to pass the test and earn a certificate.
                </p>
                <button 
                  className="common-btn retry-btn" 
                  onClick={() => {
                    setResult(null);
                    setAnswers(new Array(test.questions.length).fill(null));
                  }}
                >
                  <FiClipboard /> Retry Test
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="test-result-footer">
          <button className="common-btn close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  // Show test questions
  return (
    <div className="test-container">
      <div className="test-header">
        <h2>{test.title}</h2>
        <p className="test-description">{test.description}</p>
        <div className="test-instructions">
          <p>This test contains {test.questions.length} multiple choice questions.</p>
          <p>You need to score at least {test.passingMarks} to pass and get a certificate.</p>
          <p><strong>You must get more than 2 questions correct to earn a certificate.</strong></p>
          {test.questions.length > 1 && (
            <div className="scroll-indicator">
              <div className="scroll-text">Scroll for more questions</div>
              <div className="scroll-arrow">↓</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="questions-list" ref={questionsListRef}>
        {test.questions.map((q, qIndex) => (
          <div key={qIndex} className="question-box">
            <h3>Question {qIndex + 1} of {test.questions.length}</h3>
            <p className="question-text">{q.question}</p>
            
            <div className="options-list">
              {q.options.map((option, optIndex) => (
                <div 
                  key={optIndex} 
                  className={`option-item ${answers[qIndex] === optIndex ? 'selected' : ''}`}
                  onClick={() => updateAnswer(qIndex, optIndex)}
                >
                  <input 
                    type="radio" 
                    id={`q${qIndex}_opt${optIndex}`}
                    name={`question_${qIndex}`} 
                    checked={answers[qIndex] === optIndex}
                    onChange={() => updateAnswer(qIndex, optIndex)}
                  />
                  <label htmlFor={`q${qIndex}_opt${optIndex}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="test-footer">
        <div className="questions-answered">
          {answers.filter(a => a !== null).length} of {test.questions.length} questions answered
        </div>
        <button 
          className="common-btn submit-btn"
          disabled={!allQuestionsAnswered() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </button>
      </div>
    </div>
  );
};

export default TestComponent; 