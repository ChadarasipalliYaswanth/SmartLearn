import React, { useState, useEffect } from 'react';
import CourseChatbot from './CourseChatbot';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../main';

/**
 * GlobalChatbot component that loads necessary context and provides the chatbot
 * across the entire application
 */
const GlobalChatbot = () => {
  const [courseInfo, setCourseInfo] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [lectureNotes, setLectureNotes] = useState(null);
  const location = useLocation();
  
  // Determine if we're on a course page
  useEffect(() => {
    const loadContextData = async () => {
      try {
        // Reset state when location changes
        setCourseInfo(null);
        setCurrentLecture(null);
        setLectureNotes(null);
        
        const path = location.pathname;
        
        // Check if we're on a course page
        if (path.includes('/course/') || path.includes('/lectures/')) {
          // Extract course ID from URL
          const matches = path.match(/\/course\/.*?\/([a-zA-Z0-9]+)/) || 
                          path.match(/\/course\/([a-zA-Z0-9]+)/) ||
                          path.match(/\/lectures\/([a-zA-Z0-9]+)/);
          
          if (matches && matches[1]) {
            const courseId = matches[1];
            // Fetch course data
            const response = await axios.get(`${server}/api/course/${courseId}`);
            if (response.data && response.data.course) {
              setCourseInfo(response.data.course);
            }
            
            // Check if we're on a specific lecture
            if (path.includes('/lecture/')) {
              const lectureMatches = path.match(/\/lecture\/([a-zA-Z0-9]+)/);
              if (lectureMatches && lectureMatches[1] && response.data.course.lectures) {
                const lectureId = lectureMatches[1];
                const lecture = response.data.course.lectures.find(lec => lec._id === lectureId);
                if (lecture) {
                  setCurrentLecture(lecture);
                  
                  // If there are lecture notes, fetch their content
                  if (lecture.notes) {
                    try {
                      const notesResponse = await axios.get(`${server}/${lecture.notes}`);
                      if (notesResponse.data) {
                        // Assuming notes are plain text or have a text representation
                        setLectureNotes(notesResponse.data.substr(0, 1000) + '...'); // Limit size
                      }
                    } catch (notesError) {
                      console.log('Unable to fetch lecture notes:', notesError);
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading context for chatbot:', error);
      }
    };
    
    loadContextData();
  }, [location.pathname]);
  
  return (
    <CourseChatbot 
      courseInfo={courseInfo} 
      currentLecture={currentLecture} 
      lectureNotes={lectureNotes} 
    />
  );
};

export default GlobalChatbot; 