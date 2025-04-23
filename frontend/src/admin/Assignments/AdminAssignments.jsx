import React, { useState, useEffect } from "react";
import Layout from "../Utils/Layout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import toast from "react-hot-toast";
import "./Adminassignments.css";
import moment from "moment";
import { 
  FiPlus, FiEdit2, FiTrash2, FiEye, FiCalendar, 
  FiFileText, FiClock, FiCheck, FiUsers, FiAward, FiLayers
} from "react-icons/fi";

const AdminAssignments = ({ user }) => {
  const navigate = useNavigate();
  const params = useParams();

  // Redirect if not admin
  if (user && user.role !== "admin") return navigate("/");

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    submissions: 0
  });

  // Calculate min date for deadline input (current date and time in YYYY-MM-DDTHH:MM format)
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await axios.get(`${server}/api/assignments`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        setAssignments(data.assignments || []);
        
        // Calculate stats
        const now = new Date();
        const totalAssignments = data.assignments.length;
        const activeAssignments = data.assignments.filter(a => new Date(a.deadline) > now).length;
        const completedAssignments = totalAssignments - activeAssignments;
        const totalSubmissions = data.assignments.reduce((acc, curr) => acc + (curr.submissions?.length || 0), 0);
        
        setStats({
          total: totalAssignments,
          active: activeAssignments,
          completed: completedAssignments,
          submissions: totalSubmissions
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast.error("Failed to fetch assignments");
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Form reset
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setSelectedAssignment(null);
  };

  // Open form for editing
  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description);
    // Format the date for the date input (YYYY-MM-DDTHH:MM)
    setDeadline(moment(assignment.deadline).format("YYYY-MM-DDTHH:mm"));
    setShowForm(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that deadline is not in the past
    const selectedDate = new Date(deadline);
    const now = new Date();
    
    if (selectedDate <= now) {
      toast.error("Deadline must be in the future");
      return;
    }
    
    setBtnLoading(true);

    try {
      const formData = {
        title,
        description,
        deadline
      };

      let response;
      if (selectedAssignment) {
        // Update existing assignment
        response = await axios.put(
          `${server}/api/assignment/${selectedAssignment._id}`,
          formData,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        toast.success("Assignment updated successfully");
      } else {
        // Create new assignment
        response = await axios.post(
          `${server}/api/assignment/new`,
          formData,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        toast.success("Assignment created successfully");
      }

      // Refresh assignments
      const { data } = await axios.get(`${server}/api/assignments`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setAssignments(data.assignments || []);

      // Recalculate stats
      const now = new Date();
      const totalAssignments = data.assignments.length;
      const activeAssignments = data.assignments.filter(a => new Date(a.deadline) > now).length;
      const completedAssignments = totalAssignments - activeAssignments;
      const totalSubmissions = data.assignments.reduce((acc, curr) => acc + (curr.submissions?.length || 0), 0);
      
      setStats({
        total: totalAssignments,
        active: activeAssignments,
        completed: completedAssignments,
        submissions: totalSubmissions
      });

      // Reset form
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast.error(error.response?.data?.message || "Failed to save assignment");
    } finally {
      setBtnLoading(false);
    }
  };

  // Delete assignment
  const handleDelete = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      await axios.delete(`${server}/api/assignment/${assignmentId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      
      toast.success("Assignment deleted successfully");
      
      // Update assignments list
      const filteredAssignments = assignments.filter(assignment => assignment._id !== assignmentId);
      setAssignments(filteredAssignments);
      
      // Recalculate stats
      const now = new Date();
      const totalAssignments = filteredAssignments.length;
      const activeAssignments = filteredAssignments.filter(a => new Date(a.deadline) > now).length;
      const completedAssignments = totalAssignments - activeAssignments;
      const totalSubmissions = filteredAssignments.reduce((acc, curr) => acc + (curr.submissions?.length || 0), 0);
      
      setStats({
        total: totalAssignments,
        active: activeAssignments,
        completed: completedAssignments,
        submissions: totalSubmissions
      });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error(error.response?.data?.message || "Failed to delete assignment");
    }
  };

  // View submissions for an assignment
  const viewSubmissions = (assignmentId) => {
    navigate(`/admin/assignments/${assignmentId}/submissions`);
  };

  // Check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  // Filter assignments based on search query
  const filteredAssignments = assignments.filter(
    assignment => assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="admin-assignments">
        <div className="assignments-header">
          <h1>Manage Assignments</h1>
          <button className="common-btn" onClick={() => { setShowForm(!showForm); resetForm(); }}>
            {showForm ? <><FiClock /> Cancel</> : <><FiPlus /> Create Assignment</>}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="assignments-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Assignments</div>
            <FiLayers className="stats-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Assignments</div>
            <FiClock className="stats-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
            <FiCheck className="stats-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.submissions}</div>
            <div className="stat-label">Total Submissions</div>
            <FiFileText className="stats-icon" />
          </div>
        </div>

        {showForm && (
          <div className="assignment-form">
            <h2>{selectedAssignment ? <><FiEdit2 /> Edit Assignment</> : <><FiPlus /> Create Assignment</>}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Assignment Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed instructions for the assignment"
                  required
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Submission Deadline</label>
                <input
                  type="datetime-local"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  min={getMinDateTime()}
                />
                <small className="form-text">Deadline must be in the future</small>
              </div>

              <button type="submit" disabled={btnLoading} className="common-btn">
                {btnLoading ? "Saving..." : (selectedAssignment ? "Update Assignment" : "Create Assignment")}
              </button>
            </form>
          </div>
        )}

        <div className="assignments-list">
          <h2>All Assignments</h2>
          
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search assignments..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading assignments...</p>
            </div>
          ) : filteredAssignments.length > 0 ? (
            <table className="assignments-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Submissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>{assignment.title}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar />
                        {moment(assignment.deadline).format("MMM Do YYYY, h:mm a")}
                      </div>
                    </td>
                    <td>
                      <span className={`deadlines-badge ${isDeadlinePassed(assignment.deadline) ? 'deadline-passed' : 'deadline-active'}`}>
                        {isDeadlinePassed(assignment.deadline) ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiUsers />
                        {assignment.submissions?.length || 0}
                      </div>
                    </td>
                    <td>
                      <div className="assignment-actions">
                        <button 
                          className="action-btn view-btn" 
                          onClick={() => viewSubmissions(assignment._id)}
                        >
                          <FiEye /> View Submissions
                        </button>
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => handleEdit(assignment)}
                        >
                          <FiEdit2 /> Edit
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDelete(assignment._id)}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-assignments">
              <FiFileText size={60} style={{ color: '#ddd', marginBottom: '20px' }} />
              <h3>No Assignments Found</h3>
              <p>
                {searchQuery ? 
                  `No assignments matching "${searchQuery}". Try a different search term or clear the search.` : 
                  `Get started by creating your first assignment using the "Create Assignment" button above.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminAssignments; 