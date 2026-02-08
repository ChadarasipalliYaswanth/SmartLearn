import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import toast from "react-hot-toast";
import moment from "moment";
import "./assignments.css";
import { 
  FiArrowLeft, FiUpload, FiClock, FiCheckCircle, 
  FiAlertTriangle, FiFileText, FiX, FiInfo, FiClipboard, 
  FiCalendar, FiSlash, FiDownload, FiAward, FiSearch,
  FiFilter, FiChevronDown, FiStar
} from "react-icons/fi";

const MyAssignments = ({ user }) => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch all assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await axios.get(`${server}/api/assignments`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        
        setAssignments(data.assignments || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setError("Failed to load assignments. Please try again later.");
        toast.error("Failed to load assignments");
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Get submission status
  const getSubmissionStatus = (assignment) => {
    const deadlinePassed = isDeadlinePassed(assignment.deadline);
    const submitted = hasSubmitted(assignment);
    
    if (submitted) {
      return { status: "submitted", label: "Submitted", icon: <FiCheckCircle /> };
    } else if (deadlinePassed) {
      return { status: "missed", label: "Deadline Passed", icon: <FiSlash /> };
    } else {
      return { status: "pending", label: "Pending", icon: <FiClock /> };
    }
  };

  // Check if deadline is passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  // Get time until/since deadline
  const getTimeToDeadline = (deadline) => {
    const now = moment();
    const deadlineTime = moment(deadline);
    const isPast = now.isAfter(deadlineTime);
    
    if (isPast) {
      const duration = moment.duration(now.diff(deadlineTime));
      if (duration.asHours() < 24) {
        return `Due date passed ${Math.round(duration.asHours())} hours ago`;
      } else if (duration.asDays() < 30) {
        return `Due date passed ${Math.round(duration.asDays())} days ago`;
      } else {
        return `Due date passed on ${deadlineTime.format("MMM D, YYYY")}`;
      }
    } else {
      const duration = moment.duration(deadlineTime.diff(now));
      if (duration.asHours() < 24) {
        return `Due in ${Math.round(duration.asHours())} hours`;
      } else if (duration.asDays() < 30) {
        return `Due in ${Math.round(duration.asDays())} days`;
      } else {
        return `Due on ${deadlineTime.format("MMM D, YYYY")}`;
      }
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAssignmentFile(file);
      setFileName(file.name);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAssignmentFile(file);
      setFileName(file.name);
    }
  };

  // Open submission form
  const openSubmitForm = (assignment) => {
    // Check if user has already submitted this assignment
    if (hasSubmitted(assignment)) {
      toast.error("You have already submitted this assignment. View your submission using the 'View Submission' button.");
      return;
    }
    
    setSelectedAssignment(assignment);
    setShowSubmitForm(true);
    setAssignmentFile(null);
    setFileName("");
  };

  // Submit assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!assignmentFile) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setBtnLoading(true);
    
    const formData = new FormData();
    formData.append("submission", assignmentFile);
    
    try {
      const response = await axios.post(
        `${server}/api/assignment/${selectedAssignment._id}/submit`,
        formData,
        {
          headers: {
            token: localStorage.getItem("token"),
            "Content-Type": "multipart/form-data"
          },
        }
      );
      
      toast.success("Assignment submitted successfully");
      
      // Refresh assignments
      const { data } = await axios.get(`${server}/api/assignments`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setAssignments(data.assignments || []);
      
      // Close form
      setShowSubmitForm(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error(error.response?.data?.message || "Failed to submit assignment");
    } finally {
      setBtnLoading(false);
    }
  };

  // Check if user has submitted this assignment
  const hasSubmitted = (assignment) => {
    if (!assignment.submissions || !assignment.submissions.length) return false;
    
    // Check if any submission belongs to the current user
    return assignment.submissions.some(submission => {
      // If submission.user is already an ID string
      if (typeof submission.user === 'string') {
        return submission.user === user._id;
      }
      
      // If submission.user is an object with _id
      if (submission.user && submission.user._id) {
        return submission.user._id === user._id;
      }
      
      return false;
    });
  };

  // Get the user's submission for an assignment
  const getUserSubmission = (assignment) => {
    if (!assignment.submissions || !assignment.submissions.length) return null;
    
    return assignment.submissions.find(submission => {
      // If submission.user is already an ID string
      if (typeof submission.user === 'string') {
        return submission.user === user._id;
      }
      
      // If submission.user is an object with _id
      if (submission.user && submission.user._id) {
        return submission.user._id === user._id;
      }
      
      return false;
    });
  };

  // Open submission details
  const viewSubmission = (assignment) => {
    const submission = getUserSubmission(assignment);
    if (submission) {
      setCurrentSubmission(submission);
      setSelectedAssignment(assignment);
      setShowSubmissionDetails(true);
    }
  };

  // Download submission file
  const downloadSubmission = (filePath) => {
    window.open(`${server}/${filePath}`, '_blank');
  };

  // Close submission details modal
  const closeSubmissionDetails = () => {
    setShowSubmissionDetails(false);
    setCurrentSubmission(null);
    setSelectedAssignment(null);
  };
  
  // Filter assignments
  const getFilteredAssignments = () => {
    let filtered = [...assignments];
    
    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(assignment => {
        const status = getSubmissionStatus(assignment).status;
        return status === filterStatus;
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(query) || 
        assignment.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Set filter
  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  return (
    <div className="assignments-page my-assignments-container">
      <div className="assignments-header">
        <h1>My Assignments</h1>
        <div className="header-actions">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <FiArrowLeft /> Back to Profile
          </button>
        </div>
      </div>
      
      {!loading && !error && assignments.length > 0 && (
        <div className="assignments-filters">
          <div className="search-container">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search assignments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-options">
            <div className="filter-label">
              <FiFilter /> Filter by:
            </div>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => handleFilterChange('pending')}
              >
                Pending
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'submitted' ? 'active' : ''}`}
                onClick={() => handleFilterChange('submitted')}
              >
                Submitted
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'missed' ? 'active' : ''}`}
                onClick={() => handleFilterChange('missed')}
              >
                Missed
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading Assignments</h2>
          <p>Please wait while we fetch your assignments...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <FiAlertTriangle size={50} />
          <h2>Error Loading Assignments</h2>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {showSubmitForm && selectedAssignment && (
            <>
              <div className="modal-overlay" onClick={() => setShowSubmitForm(false)}></div>
              <div className="submit-form">
                <div className="submit-form-header">
                  <h2>Submit Assignment</h2>
                  <button 
                    className="close-btn" 
                    onClick={() => setShowSubmitForm(false)}
                  >
                    <FiX />
                  </button>
                </div>
                
                <div className="assignment-info">
                  <h3>{selectedAssignment.title}</h3>
                  <p className="assignment-description">
                    <FiInfo /> <strong>Description:</strong> {selectedAssignment.description}
                  </p>
                  <p className="assignment-deadline">
                    <FiCalendar /> <strong>Deadline:</strong> {moment(selectedAssignment.deadline).format("MMMM Do YYYY, h:mm a")}
                    {isDeadlinePassed(selectedAssignment.deadline) && 
                      <span className="deadline-badge">Deadline passed</span>
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="assignment-file">
                      <FiUpload /> Upload Your Assignment
                    </label>
                    
                    <div 
                      className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${fileName ? 'has-file' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        id="assignment-file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.zip,.rar,.txt"
                        required
                        disabled={isDeadlinePassed(selectedAssignment.deadline)}
                        className="file-input"
                      />
                      
                      {fileName ? (
                        <div className="file-selected">
                          <FiFileText size={24} />
                          <span className="file-name">{fileName}</span>
                          <button 
                            type="button" 
                            className="remove-file-btn"
                            onClick={() => {
                              setAssignmentFile(null);
                              setFileName("");
                            }}
                          >
                            <FiX />
                          </button>
                        </div>
                      ) : (
                        <div className="file-upload-content">
                          <FiUpload size={36} />
                          <p>Drag & drop your file here or click to browse</p>
                          <p className="file-info">Allowed file types: PDF, DOC, DOCX, ZIP, RAR, TXT</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-buttons">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowSubmitForm(false)}
                    >
                      <FiX /> Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="common-btn"
                      disabled={btnLoading || isDeadlinePassed(selectedAssignment.deadline) || !assignmentFile}
                    >
                      {btnLoading ? (
                        <>
                          <div className="button-spinner"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiUpload /> Submit Assignment
                        </>
                      )}
                    </button>
                  </div>
                  
                  {isDeadlinePassed(selectedAssignment.deadline) && (
                    <div className="error-message">
                      <FiAlertTriangle /> You cannot submit as the deadline has passed.
                    </div>
                  )}
                </form>
              </div>
            </>
          )}

          {/* Submission Details Modal */}
          {showSubmissionDetails && currentSubmission && selectedAssignment && (
            <>
              <div className="modal-overlay" onClick={closeSubmissionDetails}></div>
              <div className="submission-details-modal">
                <div className="modal-header">
                  <h2>Assignment Submission</h2>
                  <button 
                    className="close-btn" 
                    onClick={closeSubmissionDetails}
                  >
                    <FiX />
                  </button>
                </div>
                
                <div className="submission-details-content">
                  <h3>{selectedAssignment.title}</h3>
                  
                  <div className="submission-info">
                    <div className="info-row">
                      <FiCalendar /> 
                      <span><strong>Submitted on:</strong> {moment(currentSubmission.submittedAt).format("MMMM Do YYYY, h:mm a")}</span>
                    </div>
                    
                    <div className="info-row">
                      <FiFileText /> 
                      <span><strong>Your File:</strong></span>
                      <button 
                        className="download-btn" 
                        onClick={() => downloadSubmission(currentSubmission.file)}
                      >
                        <FiDownload /> Download
                      </button>
                    </div>
                    
                    {currentSubmission.grade !== null && (
                      <div className="grade-info">
                        <div className="info-row">
                          <FiAward /> 
                          <span><strong>Grade:</strong> {currentSubmission.grade}/100</span>
                        </div>
                        
                        {currentSubmission.feedback && (
                          <div className="feedback-box">
                            <strong>Instructor Feedback:</strong>
                            <p>{currentSubmission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="submission-note">
                    <FiInfo /> 
                    <span>
                      <strong>Submission Policy:</strong> Each student is allowed only one submission per assignment. You have submitted this assignment successfully.
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {assignments.length > 0 ? (
            <>
              {getFilteredAssignments().length > 0 ? (
                <div className="assignments-grid">
                  {getFilteredAssignments().map((assignment) => {
                    const submissionStatus = getSubmissionStatus(assignment);
                    const submission = getUserSubmission(assignment);
                    return (
                      <div 
                        key={assignment._id} 
                        className={`assignment-card ${submissionStatus.status}`}
                      >
                        <div className="card-header">
                          <h3>{assignment.title}</h3>
                          <div className={`status-badge ${submissionStatus.status}`}>
                            {submissionStatus.icon} {submissionStatus.label}
                          </div>
                        </div>
                        
                        <p className="assignment-description">
                          <FiClipboard /> {assignment.description}
                        </p>
                        
                        <div className="assignment-meta">
                          <p className="assignment-deadline">
                            <FiCalendar /> <strong>Due Date:</strong> {moment(assignment.deadline).format("MMM Do, YYYY")}
                          </p>
                          <p className="time-remaining">
                            <FiClock /> {getTimeToDeadline(assignment.deadline)}
                          </p>
                          {submission && submission.grade !== null && (
                            <p className="assignment-grade">
                              <FiStar /> <strong>Grade:</strong> {submission.grade}/100
                            </p>
                          )}
                        </div>
                        
                        <div className="assignment-actions">
                          {(submissionStatus.status === "pending") && (
                            <button 
                              className="submit-btn" 
                              onClick={() => openSubmitForm(assignment)}
                            >
                              <FiUpload /> Submit
                            </button>
                          )}
                          
                          {(submissionStatus.status === "submitted") && (
                            <>
                              <div className="submitted-message">
                                <FiCheckCircle /> Submitted
                              </div>
                              <button 
                                className="view-submission-btn" 
                                onClick={() => viewSubmission(assignment)}
                              >
                                <FiFileText /> View Submission
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-assignments">
                  <FiSearch size={60} />
                  <h2>No Matching Assignments</h2>
                  <p>No assignments match your current search criteria or filters.</p>
                  <button 
                    className="common-btn" 
                    style={{ margin: "20px auto", display: "flex" }}
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                    }}
                  >
                    <FiX /> Clear Filters
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-assignments">
              <FiFileText size={60} />
              <h2>No Assignments Available</h2>
              <p>There are no assignments available at the moment.</p>
              <p>Assignments will appear here once they're created by your instructors.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyAssignments; 