import React, { useEffect, useState } from "react";
import "./lecture.css";
import "../../components/test.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";
import { 
  FiDownload, FiPaperclip, FiPlay, FiTrash2, FiPlus, FiX, 
  FiVideo, FiFile, FiCheckCircle, FiClock, FiList, 
  FiArrowLeft, FiUpload, FiInfo, FiBookOpen, FiEdit,
  FiAward, FiClipboard
} from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import CourseChatbot from "../../components/chatbot/CourseChatbot";
import TestForm from "../../components/TestForm";
import TestComponent from "../../components/TestComponent";

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showNotesUpload, setShowNotesUpload] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [hasTest, setHasTest] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState("");
  const [notes, setNotes] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [completed, setCompleted] = useState("");
  const [completedLec, setCompletedLec] = useState("");
  const [lectLength, setLectLength] = useState("");
  const [progress, setProgress] = useState([]);
  const [lecturesWithTests, setLecturesWithTests] = useState([]);

  async function fetchLectures() {
    try {
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLectures(data.lectures);
      
      // If admin, fetch which lectures have tests
      if (user && user.role === "admin") {
        checkLecturesWithTests(data.lectures);
      }
      
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLecture(data.lecture);
      checkForTest(id);
      setLecLoading(false);
    } catch (error) {
      console.log(error);
      setLecLoading(false);
    }
  }

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setVideo(file);
    };
  };

  const changeNotesHandler = (e) => {
    const file = e.target.files[0];
    setNotes(file);
  };

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    
    if (!video) {
      toast.error("Please upload a video file");
      setBtnLoading(false);
      return;
    }
    
    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("video", video);
    
    if (notes) {
      myForm.append("notes", notes);
    }

    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        {
          headers: {
            token: localStorage.getItem("token"),
            "Content-Type": "multipart/form-data"
          },
        }
      );

      toast.success(data.message);
      setBtnLoading(false);
      setShow(false);
      fetchLectures();
      setTitle("");
      setDescription("");
      setVideo("");
      setVideoPrev("");
      setNotes("");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "An error occurred while adding lecture");
      setBtnLoading(false);
    }
  };

  const submitNotesHandler = async (e) => {
    e.preventDefault();
    
    if (!notes) {
      return toast.error("Please select a notes file");
    }
    
    setNotesLoading(true);
    const myForm = new FormData();
    myForm.append("notes", notes);

    try {
      const { data } = await axios.post(
        `${server}/api/lecture/notes/${lecture._id}`,
        myForm,
        {
          headers: {
            token: localStorage.getItem("token"),
            "Content-Type": "multipart/form-data"
          },
        }
      );

      toast.success(data.message);
      setNotesLoading(false);
      setShowNotesUpload(false);
      fetchLecture(lecture._id);
      setNotes("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setNotesLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture?")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchLectures();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const downloadNotes = () => {
    if (lecture.notes) {
      window.open(`${server}/${lecture.notes}`, '_blank');
    }
  };

  async function fetchProgress() {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${params.id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setCompleted(data.courseProgressPercentage || 0);
      setCompletedLec(data.completedLectures || 0);
      setLectLength(data.allLectures || 0);
      setProgress(data.progress ? [data.progress] : []);
    } catch (error) {
      console.log(error);
      // Set default values to prevent UI from breaking
      setCompleted(0);
      setCompletedLec(0);
      setLectLength(0);
      setProgress([]);
    }
  }

  const addProgress = async (id) => {
    try {
      const { data } = await axios.post(
        `${server}/api/user/progress?course=${params.id}&lectureId=${id}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      fetchProgress();
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate remaining lectures
  const getRemainingLectures = () => {
    return lectLength - completedLec;
  };

  // Format duration in minutes
  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Check if a test exists for the current lecture
  const checkForTest = async (lectureId) => {
    if (!lectureId) return;
    
    try {
      const { data } = await axios.get(
        `${server}/api/lecture/${lectureId}/test`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      
      setHasTest(true);
    } catch (error) {
      setHasTest(false);
      // Don't log 404 errors as they're expected when no test exists
      if (!(error.response && error.response.status === 404)) {
        console.error("Error checking for test:", error);
      }
    }
  };

  // Add test creation success handler
  const handleTestCreated = () => {
    setHasTest(true);
    toast.success("Test created successfully!");
  };

  // Check which lectures have tests
  const checkLecturesWithTests = async (lectures) => {
    if (!user || user.role !== "admin") return;
    
    try {
      const testPromises = lectures.map(async (lecture) => {
        try {
          await axios.get(`${server}/api/lecture/${lecture._id}/test`, {
            headers: {
              token: localStorage.getItem("token"),
            },
          });
          return lecture._id;
        } catch (error) {
          return null;
        }
      });
      
      const results = await Promise.all(testPromises);
      setLecturesWithTests(results.filter(id => id !== null));
    } catch (error) {
      console.error("Error checking for lectures with tests:", error);
      setLecturesWithTests([]);
    }
  };

  useEffect(() => {
    fetchLectures();
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading your course</h2>
        <p>Please wait while we prepare your learning experience</p>
      </div>
    );
  }

  return (
    <div className="lecture-page">
      <Helmet>
        <title>{lectures[0]?.title || "Course"} | Lecture</title>
      </Helmet>
      <div className="progress-container">
        <div className="progress">
          <div className="progress-left">
            <div className="progress-text">
              <FiCheckCircle /> {completedLec} of {lectLength} lectures completed
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${completed}%` }}></div>
            </div>
          </div>
          <div className="progress-percentage">{completed}% Complete</div>
          {getRemainingLectures() > 0 && (
            <div className="remaining-lectures">
              <FiClock /> {getRemainingLectures()} lectures remaining
            </div>
          )}
        </div>
      </div>
      
      <div className="lecture-container">
        <div className="left">
          {lecLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <h2>Loading lecture</h2>
              <p>Please wait while we load your content</p>
            </div>
          ) : (
            <>
              {lecture.video ? (
                <>
                  <div className="video-container">
                    <video
                      className="lecture-video"
                      src={`${server}/${lecture.video}`}
                      controls
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      disableRemotePlayback
                      autoPlay
                      onEnded={() => addProgress(lecture._id)}
                    ></video>
                  </div>
                  <div className="lecture-info">
                    <h1>{lecture.title}</h1>
                    <h3>{lecture.description}</h3>
                    
                    <div className="content-section">
                      <div className="section-title">
                        <FiBookOpen /> Lecture Resources
                      </div>
                    
                      {lecture.notes && (
                        <div className="notes-section">
                          <h3><FiPaperclip /> Lecture Notes</h3>
                          <p>Download the supplementary materials for this lecture to enhance your learning experience.</p>
                          <button className="notes-btn" onClick={downloadNotes}>
                            <FiDownload /> Download Notes
                          </button>
                        </div>
                      )}

                      {/* Test Section */}
                      {lecture._id && (
                        <div className="test-section">
                          <h3><FiClipboard /> Lecture Test</h3>
                          {hasTest ? (
                            <>
                              <p>Take the test to evaluate your understanding and earn a certificate upon passing.</p>
                              <button 
                                className="common-btn test-btn" 
                                onClick={() => setShowTest(true)}
                              >
                                <FiEdit /> Take Test
                              </button>
                            </>
                          ) : user && user.role === "admin" ? (
                            <>
                              <p>No test available for this lecture yet. As an admin, you can create one.</p>
                              <button 
                                className="common-btn create-test-btn" 
                                onClick={() => setShowTestForm(true)}
                              >
                                <FiPlus /> Create Test
                              </button>
                            </>
                          ) : (
                            <p>No test available for this lecture yet.</p>
                          )}
                        </div>
                      )}

                      {user && user.role === "admin" && (
                        <button 
                          className="common-btn notes-upload-btn" 
                          onClick={() => setShowNotesUpload(!showNotesUpload)}
                        >
                          {showNotesUpload ? <><FiX /> Cancel</> : (lecture.notes ? <><FiFile /> Update Notes</> : <><FiPlus /> Add Notes</>)}
                        </button>
                      )}

                      {showNotesUpload && user && user.role === "admin" && (
                        <div className="notes-upload-form">
                          <h3>{lecture.notes ? "Update Notes" : "Add Notes"}</h3>
                          <form onSubmit={submitNotesHandler}>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                              onChange={changeNotesHandler}
                              required
                            />
                            <button
                              disabled={notesLoading}
                              type="submit"
                              className="common-btn"
                            >
                              {notesLoading ? <><FiClock /> Uploading...</> : <><FiUpload /> Upload Notes</>}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="loading-container">
                  <FiPlay size={40} />
                  <h2>Welcome to Your Course</h2>
                  <p>Select a lecture from the list to start learning.</p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="right">
          {/* Show "Add Lecture" button only for admin */}
          {user && user.role === "admin" && (
            <div className="admin-action-buttons">
              <button className="common-btn" onClick={() => setShow(!show)}>
                {show ? <><FiX /> Close Form</> : <><FiPlus /> Add New Lecture</>}
              </button>
              
              {lecture._id && (
                <button className="common-btn create-test-btn" onClick={() => setShowTestForm(true)}>
                  <FiClipboard /> {hasTest ? "Update Test" : "Create Test"}
                </button>
              )}
            </div>
          )}

          {/* Add Lecture Form (only for admin) */}
          {show && user && user.role === "admin" && (
            <div className="lecture-form">
              <h2>Add New Lecture</h2>
              <form onSubmit={submitHandler}>
                <div>
                  <label htmlFor="title"><FiInfo /> Lecture Title</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter an informative title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description"><FiBookOpen /> Lecture Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of what students will learn"
                    required
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="video"><FiVideo /> Lecture Video</label>
                  <input
                    type="file"
                    id="video"
                    accept="video/*"
                    onChange={changeVideoHandler}
                    required
                  />
                </div>

                {videoPrev && (
                  <div className="video-preview">
                    <video
                      src={videoPrev}
                      width="100%"
                      controls
                    ></video>
                  </div>
                )}

                <div>
                  <label htmlFor="notes"><FiPaperclip /> Additional Notes (Optional)</label>
                  <input
                    type="file"
                    id="notes"
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                    onChange={changeNotesHandler}
                  />
                </div>

                <button
                  disabled={btnLoading}
                  type="submit"
                  className="common-btn"
                >
                  {btnLoading ? <><FiClock /> Processing...</> : <><FiPlus /> Add Lecture</>}
                </button>
              </form>
            </div>
          )}

          {/* Display Lectures */}
          <div className="lecture-list">
            <div className="lecture-list-header">
              <FiList /> Course Content ({lectures.length} Lectures)
            </div>
            <div className="lecture-numbers-container">
              {lectures && lectures.length > 0 ? (
                lectures.map((e, i) => (
                  <div key={i} className="lecture-item">
                    <div
                      onClick={() => fetchLecture(e._id)}
                      className={`lecture-number ${
                        lecture._id === e._id ? "active" : ""
                      }`}
                    >
                      <div className="lecture-title-container">
                        <div className="lecture-index">{i + 1}</div>
                        <div>{e.title}</div>
                      </div>
                      <div className="lecture-status">
                        {e.notes && <FiPaperclip className="notes-icon" title="Notes available" />}
                        {progress && 
                          progress.length > 0 &&
                          progress[0].completedLectures &&
                          progress[0].completedLectures.includes(e._id) && (
                            <div className="completion-icon" title="Lecture completed">
                              <TiTick />
                            </div>
                          )}
                        {/* Admin only: check if test exists */}
                        {user && user.role === "admin" && lecturesWithTests.includes(e._id) && (
                          <div 
                            className="test-indicator" 
                            onClick={(event) => {
                              event.stopPropagation();
                              fetchLecture(e._id);
                              setShowTestForm(true);
                            }}
                            title="Edit test for this lecture"
                          >
                            <FiClipboard />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Show "Delete Lecture" button only for admin */}
                    {user && user.role === "admin" && (
                      <button
                        className="delete-lecture-btn"
                        onClick={() => deleteHandler(e._id)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-lectures">
                  <p>No Lectures Available Yet</p>
                  {user && user.role === "admin" && (
                    <p>Click on "Add New Lecture" to create your first lecture for this course.</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button className="common-btn back-to-course-btn" onClick={() => navigate(`/course/study/${params.id}`)}>
            <FiArrowLeft /> Back to Course
          </button>
        </div>
      </div>
      
      {/* Chatbot Integration */}
      <CourseChatbot 
        courseInfo={{title: lectures[0]?.title, _id: params.id}}
        lectureNotes={lecture?.notes ? `${server}/${lecture.notes}` : null}
        currentLecture={lecture}
      />

      {/* Test Form Modal */}
      {showTestForm && (
        <div className="modal-overlay test-form-overlay">
          <TestForm
            lectureId={lecture?._id}
            lecture={lecture}
            onClose={() => setShowTestForm(false)}
          />
        </div>
      )}
      
      {/* Test Taking Modal */}
      {showTest && (
        <div className="modal-overlay">
          <TestComponent 
            lectureId={lecture._id} 
            onClose={() => setShowTest(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Lecture;