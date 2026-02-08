import React, { useEffect, useState } from "react";
import "./coursestudy.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import { FiClock, FiUser, FiBookOpen, FiCalendar, FiAward, FiArrowLeft, FiPlayCircle } from "react-icons/fi";
import CourseChatbot from "../../components/chatbot/CourseChatbot";

const CourseStudy = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { fetchCourse, course } = CourseData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      if (fetchCourse && params.id) {
        try {
          await fetchCourse(params.id);
        } catch (error) {
          console.error("Error fetching course:", error);
          // Optionally set an error state here
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // Ensure loading stops if fetchCourse or id is missing
      }
    };
    loadCourse();
  }, [params.id, fetchCourse]);

  // Format date for course created date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Calculate estimated completion time (assuming lectures array exists and contains objects)
  const estimatedTime = course?.lectures?.length ? `${course.lectures.length * 1.5} hours` : "N/A"; // Example: 1.5 hours per lecture

  if (loading) {
    return (
      <div className="course-study-page loading-state">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading Course Details...</h2>
          <p>Getting everything ready for you.</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-study-page error-state">
        <div className="error-container">
          <h2>Oops! Course Not Found</h2>
          <p>We couldn't find the course you're looking for. It might have been moved or the link is incorrect.</p>
          <div className="cta-container">
            <button className="secondary-btn" onClick={() => navigate("/courses")}>
              <FiArrowLeft /> Browse Other Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-study-page">
      {/* Optional: Add a back button or breadcrumbs here */}
       <button onClick={() => navigate(-1)} className="back-button">
         <FiArrowLeft /> Back
       </button>

      <div className="course-study-content">
        {/* Main Content Area */}
        <div className="course-main-content">
          <div className="course-badge">Premium Access</div>
          <h1 className="course-title">{course.title}</h1>
          <p className="course-subtitle">
            Master essential skills with expert-led instruction.
          </p>

          <div className="course-image-container">
            <img
              src={`${server}/${course.image}`}
              alt={`${course.title} course image`}
              className="course-image"
            />
             {/* Optional: Play icon overlay */}
             {/* <div className="play-icon-overlay"><FiPlayCircle /></div> */}
          </div>

          <section className="course-description-section">
            <h2>About this Course</h2>
            <p>{course.description || "No description available."}</p>
          </section>

           {/* Main Actions */}
           <div className="main-actions">
             <Link to={`/lectures/${course._id}`} className="lectures-btn primary">
               <FiPlayCircle />
               <span>Start Learning Now</span>
             </Link>
             {/* Add other actions like 'Add to Wishlist' if needed */}
           </div>
        </div>

        {/* Details Panel/Sidebar */}
        <aside className="course-details-panel">
          <h3>Course Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <FiUser className="detail-icon" />
              <div>
                <span className="detail-label">Instructor</span>
                <span className="detail-value">{course.createdBy || "N/A"}</span>
              </div>
            </div>
            <div className="detail-item">
              <FiClock className="detail-icon" />
              <div>
                <span className="detail-label">Est. Duration</span>
                <span className="detail-value">{course.duration ? `${course.duration} weeks` : "N/A"}</span>
              </div>
            </div>
             <div className="detail-item">
               <FiAward className="detail-icon" />
               <div>
                 <span className="detail-label">Study Time</span>
                 <span className="detail-value">{estimatedTime}</span>
               </div>
             </div>
            <div className="detail-item">
              <FiCalendar className="detail-icon" />
              <div>
                <span className="detail-label">Published</span>
                <span className="detail-value">{formatDate(course.createdAt)}</span>
              </div>
            </div>
             <div className="detail-item">
               <FiBookOpen className="detail-icon" />
               <div>
                 <span className="detail-label">Lectures</span>
                 <span className="detail-value">{course.lectures?.length || 0}</span>
               </div>
             </div>
             {/* Add more details like 'Skill Level', 'Language' if available */}
          </div>
        </aside>
      </div>

      {/* Chatbot Component - Positioned after main content */}
      <div className="chatbot-section">
         <CourseChatbot
           courseInfo={course}
           lectureNotes={null} // Pass actual notes if available
         />
      </div>
    </div>
  );
};

export default CourseStudy;
