import React, { useState, useEffect } from "react";
import Layout from "../Utils/Layout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import toast from "react-hot-toast";
import moment from "moment";
import { 
  FiArrowLeft, 
  FiDownload, 
  FiEdit, 
  FiFileText, 
  FiCalendar, 
  FiUsers, 
  FiUser, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiClock,
  FiAward,
  FiXCircle,
  FiFilter
} from "react-icons/fi";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip, 
  Grid, 
  Paper, 
  Avatar, 
  Divider, 
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledSubmissionCard = styled(Card)(({ theme, graded }) => ({
  marginBottom: '16px',
  borderRadius: '12px',
  transition: 'transform 0.2s, box-shadow 0.2s',
  borderLeft: graded ? '4px solid #4caf50' : '4px solid #ff9800',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 45,
  height: 45,
  fontSize: '1rem',
  fontWeight: 'bold',
  backgroundColor: '#8a4baf',
  color: 'white',
  boxShadow: '0 3px 5px rgba(138, 75, 175, 0.2)'
}));

const SubmissionsList = ({ user }) => {
  const navigate = useNavigate();
  const params = useParams();
  const assignmentId = params.id;

  // Redirect if not admin
  if (user && user.role !== "admin") return navigate("/");

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [filter, setFilter] = useState("all"); // all, graded, ungraded
  const [searchQuery, setSearchQuery] = useState("");

  // States for grading
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    graded: 0,
    ungraded: 0,
    averageGrade: 0
  });

  // Fetch assignment with submissions
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const { data } = await axios.get(`${server}/api/assignment/${assignmentId}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        setAssignment(data.assignment);
        setFilteredSubmissions(data.assignment.submissions || []);
        
        // Calculate stats
        const submissions = data.assignment.submissions || [];
        const gradedSubmissions = submissions.filter(sub => sub.grade !== null && sub.grade !== undefined);
        const totalGradePoints = gradedSubmissions.reduce((sum, sub) => sum + Number(sub.grade), 0);
        
        setStats({
          total: submissions.length,
          graded: gradedSubmissions.length,
          ungraded: submissions.length - gradedSubmissions.length,
          averageGrade: gradedSubmissions.length ? Math.round(totalGradePoints / gradedSubmissions.length) : 0
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast.error("Failed to fetch assignment details");
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAssignment();
    } else {
      toast.error("No assignment ID provided");
      setLoading(false);
    }
  }, [assignmentId]);

  // Apply filters
  useEffect(() => {
    if (!assignment?.submissions) return;
    
    let filtered = [...assignment.submissions];
    
    // Apply status filter
    if (filter === "graded") {
      filtered = filtered.filter(sub => sub.grade !== null && sub.grade !== undefined);
    } else if (filter === "ungraded") {
      filtered = filtered.filter(sub => sub.grade === null || sub.grade === undefined);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        (sub.user.name && sub.user.name.toLowerCase().includes(query)) || 
        (sub.user.email && sub.user.email.toLowerCase().includes(query))
      );
    }
    
    setFilteredSubmissions(filtered);
  }, [filter, searchQuery, assignment]);

  // Download submission file
  const downloadSubmission = (filePath) => {
    window.open(`${server}/${filePath}`, '_blank');
  };

  // Open grade form
  const openGradeForm = (submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || "");
    setFeedback(submission.feedback || "");
    setShowGradeForm(true);
  };

  // Submit grade
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    
    try {
      await axios.post(
        `${server}/api/assignment/${assignmentId}/grade/${selectedSubmission._id}`,
        { grade, feedback },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      
      toast.success("Submission graded successfully");
      
      // Refresh assignment data
      const { data } = await axios.get(`${server}/api/assignment/${assignmentId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setAssignment(data.assignment);
      
      // Recalculate stats
      const submissions = data.assignment.submissions || [];
      const gradedSubmissions = submissions.filter(sub => sub.grade !== null && sub.grade !== undefined);
      const totalGradePoints = gradedSubmissions.reduce((sum, sub) => sum + Number(sub.grade), 0);
      
      setStats({
        total: submissions.length,
        graded: gradedSubmissions.length,
        ungraded: submissions.length - gradedSubmissions.length,
        averageGrade: gradedSubmissions.length ? Math.round(totalGradePoints / gradedSubmissions.length) : 0
      });
      
      // Close form
      setShowGradeForm(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error(error.response?.data?.message || "Failed to grade submission");
    } finally {
      setBtnLoading(false);
    }
  };

  // Back to assignments
  const goBack = () => {
    navigate("/admin/assignments");
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Layout>
      <Box sx={{ px: 3, py: 4, maxWidth: 1200, mx: 'auto' }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FiArrowLeft />}
            onClick={goBack}
            sx={{ 
              borderRadius: '20px', 
              textTransform: 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
              '&:hover': { transform: 'translateX(-4px)' }
            }}
          >
            Back to Assignments
          </Button>
          
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#333' }}>
            {loading ? "Loading..." : `Submissions for ${assignment?.title}`}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress size={60} sx={{ color: '#8a4baf', mb: 3 }} />
            <Typography variant="h6" color="textSecondary">Loading submissions...</Typography>
          </Box>
        ) : assignment ? (
          <>
            {/* Assignment Details Card */}
            <Card sx={{ mb: 4, borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '5px', 
                background: 'linear-gradient(to right, #8a4baf, #6a1b9a)' 
              }} />
              
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                  <FiFileText style={{ marginRight: '8px' }} /> Assignment Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        Title
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {assignment.title}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {assignment.description}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        <FiCalendar style={{ marginRight: '4px' }} /> Deadline
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {moment(assignment.deadline).format("MMMM Do YYYY, h:mm a")}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        <FiUsers style={{ marginRight: '4px' }} /> Submissions
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {assignment.submissions?.length || 0} student{assignment.submissions?.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: '12px',
                  background: 'linear-gradient(to right, #8a4baf, #6a1b9a)',
                  color: 'white',
                  boxShadow: '0 4px 10px rgba(138, 75, 175, 0.3)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight={500}>Total</Typography>
                      <FiUsers size={24} />
                    </Box>
                    <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>{stats.total}</Typography>
                    <Typography variant="body2">Total submissions</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight={500} color="text.secondary">Graded</Typography>
                      <FiCheckCircle size={24} color="#4caf50" />
                    </Box>
                    <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700, color: '#4caf50' }}>{stats.graded}</Typography>
                    <Typography variant="body2" color="text.secondary">{stats.graded > 0 ? `${Math.round((stats.graded / stats.total) * 100)}% completed` : 'No graded submissions'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight={500} color="text.secondary">Pending</Typography>
                      <FiClock size={24} color="#ff9800" />
                    </Box>
                    <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700, color: '#ff9800' }}>{stats.ungraded}</Typography>
                    <Typography variant="body2" color="text.secondary">{stats.ungraded > 0 ? `${Math.round((stats.ungraded / stats.total) * 100)}% pending` : 'All submissions graded'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight={500} color="text.secondary">Average</Typography>
                      <FiAward size={24} color="#2196f3" />
                    </Box>
                    <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700, color: '#2196f3' }}>{stats.averageGrade}/100</Typography>
                    <Typography variant="body2" color="text.secondary">Average grade score</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Grade Submission Dialog */}
            <Dialog 
              open={showGradeForm} 
              onClose={() => setShowGradeForm(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiEdit size={20} />
                  <Typography variant="h6">Grade Submission</Typography>
                </Box>
              </DialogTitle>
              
              <DialogContent>
                {selectedSubmission && (
                  <>
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <StyledAvatar>{getInitials(selectedSubmission.user.name)}</StyledAvatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{selectedSubmission.user.name || "Student"}</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedSubmission.user.email}</Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FiCalendar size={16} />
                      Submitted on {moment(selectedSubmission.submittedAt).format("MMMM Do YYYY, h:mm a")}
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Grade (0-100)"
                      type="number"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      InputProps={{ inputProps: { min: 0, max: 100 } }}
                      variant="outlined"
                      margin="normal"
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Feedback"
                      multiline
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      placeholder="Provide feedback to the student"
                    />
                  </>
                )}
              </DialogContent>
              
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button 
                  onClick={() => setShowGradeForm(false)} 
                  variant="outlined"
                  startIcon={<FiXCircle />}
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGradeSubmit}
                  variant="contained"
                  startIcon={<FiCheckCircle />}
                  disabled={btnLoading}
                  sx={{ 
                    backgroundImage: 'linear-gradient(to right, #8a4baf, #6a1b9a)',
                    boxShadow: '0 4px 10px rgba(138, 75, 175, 0.3)',
                  }}
                >
                  {btnLoading ? "Saving..." : "Save Grade"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Submissions List Section */}
            <Box sx={{ mt: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  <FiUsers style={{ marginRight: '8px' }} /> 
                  Student Submissions
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    placeholder="Search by name or email"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: '250px' }}
                    InputProps={{
                      startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}><FiUser size={18} /></Box>
                    }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: '150px' }}>
                    <Select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      displayEmpty
                      startAdornment={<Box sx={{ mr: 1, color: 'text.secondary' }}><FiFilter size={18} /></Box>}
                    >
                      <MenuItem value="all">All Submissions</MenuItem>
                      <MenuItem value="graded">Graded</MenuItem>
                      <MenuItem value="ungraded">Not Graded</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* No Submissions State */}
              {assignment.submissions.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 5, borderRadius: '12px' }}>
                  <Box sx={{ mb: 2 }}>
                    <FiFileText size={60} style={{ opacity: 0.3 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>No Submissions Yet</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ maxWidth: '500px', mx: 'auto' }}>
                    No students have submitted this assignment yet. Check back later.
                  </Typography>
                </Card>
              ) : filteredSubmissions.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 5, borderRadius: '12px' }}>
                  <Box sx={{ mb: 2 }}>
                    <FiFilter size={60} style={{ opacity: 0.3 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>No Matching Submissions</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ maxWidth: '500px', mx: 'auto' }}>
                    No submissions match your current filters. Try adjusting your search or filter settings.
                  </Typography>
                </Card>
              ) : (
                filteredSubmissions.map((submission) => (
                  <StyledSubmissionCard 
                    key={submission._id} 
                    elevation={2} 
                    graded={submission.grade !== null && submission.grade !== undefined}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <StyledAvatar>{getInitials(submission.user.name)}</StyledAvatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>{submission.user.name || "Student"}</Typography>
                              <Typography variant="body2" color="textSecondary">{submission.user.email}</Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <FiCalendar size={14} style={{ marginRight: '4px' }} />
                                Submitted {moment(submission.submittedAt).format("MMM Do YYYY, h:mm a")}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                          {submission.grade !== null && submission.grade !== undefined ? (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="textSecondary">Grade:</Typography>
                                <Chip 
                                  label={`${submission.grade}/100`} 
                                  color={submission.grade >= 70 ? "success" : submission.grade >= 40 ? "warning" : "error"}
                                  sx={{ fontWeight: 600 }}
                                />
                              </Box>
                              
                              {submission.feedback && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                    <FiMessageSquare size={14} style={{ marginTop: '3px' }} />
                                    <span style={{ display: 'inline-block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {submission.feedback}
                                    </span>
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Chip 
                              label="Not graded" 
                              color="warning"
                              variant="outlined"
                              size="small"
                              icon={<FiClock size={14} />}
                            />
                          )}
                        </Grid>
                        
                        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, mt: { xs: 2, md: 0 } }}>
                          <Button
                            variant="outlined"
                            color="info"
                            startIcon={<FiDownload />}
                            onClick={() => downloadSubmission(submission.file)}
                            sx={{ borderRadius: '20px' }}
                          >
                            Download
                          </Button>
                          
                          <Button
                            variant="contained"
                            startIcon={<FiEdit />}
                            onClick={() => openGradeForm(submission)}
                            sx={{ 
                              borderRadius: '20px',
                              background: 'linear-gradient(to right, #8a4baf, #6a1b9a)',
                              boxShadow: '0 3px 5px rgba(138, 75, 175, 0.2)'
                            }}
                          >
                            {submission.grade !== null && submission.grade !== undefined ? "Edit Grade" : "Grade"}
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </StyledSubmissionCard>
                ))
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <FiXCircle size={60} style={{ color: '#f44336', marginBottom: '16px' }} />
            <Typography variant="h5" gutterBottom>Assignment Not Found</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Unable to find the assignment you're looking for.
            </Typography>
            <Button 
              variant="contained" 
              onClick={goBack}
              startIcon={<FiArrowLeft />}
              sx={{ borderRadius: '20px' }}
            >
              Back to Assignments
            </Button>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default SubmissionsList; 