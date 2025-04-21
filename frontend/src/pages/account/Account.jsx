import React, { useState, useEffect } from "react";
import { 
  Container, Box, Typography, Avatar, 
  Button, Divider, Card, CardContent, Grid,
  useTheme, useMediaQuery, Tab, Tabs, Paper,
  Chip, LinearProgress, Badge, IconButton
} from "@mui/material";
import { 
  Dashboard as DashboardIcon, 
  Logout as LogoutIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  DateRange as DateIcon,
  CheckCircle as CheckCircleIcon,
  BookmarkBorder as BookmarkIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Star as StarIcon
} from "@mui/icons-material";
import "./account.css";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();
  const { mycourse } = CourseData();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [completionRate, setCompletionRate] = useState(75); // Mock data
  const [activityStats, setActivityStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    wishlistedCourses: 4,
    lastActive: "Today"
  });

  useEffect(() => {
    // Update the stats based on user data
    if (mycourse) {
      setActivityStats(prev => ({
        ...prev,
        coursesEnrolled: mycourse.length || 0,
        coursesCompleted: 2 // Mock data
      }));
    }
  }, [mycourse]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged Out");
    navigate("/login");
  };

  if (!user) return null;

  // Generate avatar color based on user name
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Calculate days since join date (mock data)
  const daysSinceJoin = () => {
    return "120 days";
  };

  const renderProfileTab = () => (
    <Box>
      <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#424242' }}>
            Account Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Full Name</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{user.name}</Typography>
              
              <Typography variant="body2" color="text.secondary">Email Address</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{user.email}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Account Type</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2, textTransform: 'capitalize' }}>{user.role}</Typography>
              
              <Typography variant="body2" color="text.secondary">Member Since</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{daysSinceJoin()}</Typography>
            </Grid>
          </Grid>
          
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>
      
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#424242' }}>
            Learning Progress
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Overall Completion</Typography>
              <Typography variant="body2" fontWeight="bold">{completionRate}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={completionRate} 
              sx={{ 
                height: 8, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#1e88e5',
                }
              }} 
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f9ff', borderRadius: 2 }}>
                <SchoolIcon sx={{ color: '#1e88e5', fontSize: 36, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{activityStats.coursesEnrolled}</Typography>
                <Typography variant="body2" color="text.secondary">Enrolled</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#f5fff5', borderRadius: 2 }}>
                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 36, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{activityStats.coursesCompleted}</Typography>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff9f5', borderRadius: 2 }}>
                <BookmarkIcon sx={{ color: '#ff9800', fontSize: 36, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{activityStats.wishlistedCourses}</Typography>
                <Typography variant="body2" color="text.secondary">Wishlisted</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5ff', borderRadius: 2 }}>
                <DateIcon sx={{ color: '#9c27b0', fontSize: 36, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{activityStats.lastActive}</Typography>
                <Typography variant="body2" color="text.secondary">Last Active</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderCoursesTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>My Courses</Typography>
      
      {mycourse && mycourse.length > 0 ? (
        <Grid container spacing={3}>
          {mycourse.map((course, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: '#f5f5f5' }}>
                  {course.image && (
                    <Box
                      component="img"
                      src={`${course.image.startsWith('http') ? '' : 'http://localhost:4000/'}${course.image}`}
                      alt={course.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <Chip 
                    label="In Progress" 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      bgcolor: '#ff9800',
                      color: 'white',
                      fontWeight: 500
                    }} 
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}>
                    {course.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StarIcon sx={{ color: '#ffb400', fontSize: '0.9rem', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.rating || "4.5"} • {course.lectures ? course.lectures.length : 0} lectures
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={45} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      mb: 1,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#1e88e5',
                      }
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                    45% complete
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ 
                      borderRadius: 2,
                      backgroundColor: '#1e88e5', 
                      '&:hover': { backgroundColor: '#1565c0' } 
                    }}
                    onClick={() => navigate(`/course/study/${course._id}`)}
                  >
                    Continue Learning
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <SchoolIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">You haven't enrolled in any courses yet</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2, borderRadius: 2 }}
            onClick={() => navigate('/courses')}
          >
            Browse Courses
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderSettingsTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Account Settings</Typography>
      
      <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Notification Preferences
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {/* Mock notification preferences */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="body1">Course updates</Typography>
                  <Typography variant="body2" color="text.secondary">Get notified about new content in your courses</Typography>
                </Box>
                <Button variant="outlined" size="small">
                  Enabled
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="body1">Promotions and offers</Typography>
                  <Typography variant="body2" color="text.secondary">Receive special offers and discounts</Typography>
                </Box>
                <Button variant="outlined" color="error" size="small">
                  Disabled
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'error.main' }}>
            Danger Zone
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logoutHandler}
            sx={{ borderRadius: 2 }}
          >
            Logout from all devices
          </Button>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="container">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 4,
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        <Box sx={{ mb: isMobile ? 2 : 0 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: "bold",
              position: "relative",
              display: 'inline-block',
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -5,
                left: 0,
                width: "40%",
                height: "4px",
                bgcolor: "#1e88e5",
                borderRadius: "2px"
              }
            }}
          >
            My Account
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your profile and preferences
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" sx={{ bgcolor: '#f5f5f5' }}>
            <SettingsIcon />
          </IconButton>
          <Badge badgeContent={3} color="error">
            <IconButton size="small" sx={{ bgcolor: '#f5f5f5' }}>
              <NotificationIcon />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4} lg={3}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 3,
              overflow: "hidden",
              mb: 3,
              position: 'sticky',
              top: 100
            }}
          >
            <Box 
              sx={{ 
                bgcolor: "primary.main", 
                py: 4, 
                px: 3, 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center",
                position: 'relative'
              }}
            >
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: stringToColor(user.name),
                  fontSize: "2rem",
                  fontWeight: "bold",
                  border: "4px solid white",
                  mb: 2
                }}
              >
                {getInitials(user.name)}
              </Avatar>
              
              <Typography variant="h5" sx={{ fontWeight: "bold", color: 'white', textAlign: 'center' }}>
                {user.name}
              </Typography>
              
              <Chip 
                label={user.role} 
                sx={{ 
                  mt: 1, 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  textTransform: 'capitalize'
                }} 
              />
            </Box>

            <Box sx={{ p: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mb: 1,
                  color: 'text.secondary'
                }}
              >
                <EmailIcon sx={{ mr: 1, fontSize: "1rem" }} />
                {user.email}
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  color: 'text.secondary'
                }}
              >
                <DateIcon sx={{ mr: 1, fontSize: "1rem" }} />
                Member for {daysSinceJoin()}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<DashboardIcon />}
                onClick={() => navigate(`/${user._id}/dashboard`)}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  mb: 1.5,
                  boxShadow: 2
                }}
              >
                My Dashboard
              </Button>
              
              {user.role === "admin" && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate(`/admin/dashboard`)}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    mb: 1.5
                  }}
                >
                  Admin Dashboard
                </Button>
              )}
              
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="large"
                startIcon={<LogoutIcon />}
                onClick={logoutHandler}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                }}
              >
                Logout
              </Button>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8} lg={9}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="Profile tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: 100
                },
                '& .Mui-selected': {
                  color: 'primary.main'
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 1.5
                }
              }}
            >
              <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
              <Tab icon={<SchoolIcon />} iconPosition="start" label="My Courses" />
              <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
            </Tabs>
          </Box>
          
          {tabValue === 0 && renderProfileTab()}
          {tabValue === 1 && renderCoursesTab()}
          {tabValue === 2 && renderSettingsTab()}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Account;
