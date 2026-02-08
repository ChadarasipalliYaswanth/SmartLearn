import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/Loading";
import CourseChatbot from "../../components/chatbot/CourseChatbot";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();
  const { fetchCourse, course } = CourseData();

  useEffect(() => {
    fetchCourse(params.id);
  }, []);

  return (
    <>
      {!course ? (
        <Loading />
      ) : (
        <div className="course-description">
          <div className="course-header">
            <img
              src={`${server}/${course.image}`}
              alt=""
              className="course-image"
            />
            <div className="course-info">
              <h2>{course.title}</h2>
              <p>Instructor: {course.createdBy}</p>
              <p>Duration: {course.duration} weeks</p>
            </div>
          </div>

          <p>{course.description}</p>
          <p>Let's get started with the course. It's completely free!</p>

          <button
            onClick={() => navigate(`/course/study/${course._id}`)}
            className="common-btn"
          >
            Get Started
          </button>
          
          {/* Chatbot Integration */}
          <CourseChatbot 
            courseInfo={course} 
            lectureNotes={null} 
          />
        </div>
      )}
    </>
  );
};

export default CourseDescription;
