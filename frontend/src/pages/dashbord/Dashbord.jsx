import React from "react";
import "./dashbord.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import { Container, Typography, Grid, Box, Paper, Button, Fade, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SchoolIcon from '@mui/icons-material/School';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from "react-router-dom";

const Dashbord = () => {
  const { mycourse, loading: coursesLoading } = CourseData();
  const theme = useTheme();
  const navigate = useNavigate();

  if (coursesLoading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Loading Your Courses...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }} className="student-dashboard">
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
          color: theme.palette.secondary.contrastText,
          textAlign: 'center', 
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 4 },
          mb: { xs: 4, md: 6 },
          borderRadius: theme.shape.borderRadius * 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={true} timeout={500}>
            <Typography 
              variant="h3"
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mb: 2,
              }}
            >
              My Learning Dashboard
            </Typography>
          </Fade>
          <Fade in={true} timeout={700}>
            <Typography 
              variant="h6"
              component="p" 
              sx={{ 
                maxWidth: "700px", 
                mx: "auto", 
                mb: 4, 
                opacity: 0.9
              }}
            >
              Track your progress and continue learning where you left off
            </Typography>
          </Fade>
          <Fade in={true} timeout={900}>
            <Button
              variant="contained"
              sx={{ 
                bgcolor: 'white',
                color: theme.palette.secondary.main,
                fontSize: { xs: '0.9rem', md: '1rem' }, 
                fontWeight: 600,
                mt: 2, 
                px: { xs: 3, md: 4 }, 
                py: { xs: 1, md: 1.5 }, 
                borderRadius: '50px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
                "&:hover": {
                  bgcolor: 'white',
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                },
              }}
              startIcon={<SchoolIcon />}
              onClick={() => navigate("/courses")}
            >
              Browse More Courses
            </Button>
          </Fade>
        </Box>
      </Paper>

      {/* Enrolled Courses Section */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            textAlign: 'center',
            mb: 3,
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <BookmarkIcon color="secondary" />
          My Enrolled Courses
        </Typography>

        {mycourse && mycourse.length > 0 ? (
          <Grid container spacing={3}>
            {mycourse.map((course, index) => (
              <Grid item key={course._id} xs={12} sm={6} md={4}>
                <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                  <div>
                    <CourseCard course={course} />
                  </div>
                </Fade>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper 
            variant="outlined"
            sx={{ 
              p: { xs: 3, md: 4 }, 
              textAlign: 'center', 
              mt: 4, 
              borderColor: theme.palette.divider,
              bgcolor: 'background.default',
              borderRadius: theme.shape.borderRadius * 1.5,
            }}
          >
            <SchoolIcon sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.6, mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              No Courses Enrolled Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You haven't enrolled in any courses. Start learning by exploring our course catalog!
            </Typography>
            <Button 
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => navigate("/courses")}
              sx={{ borderRadius: 6, py: 1, px: 3 }}
            >
              Explore Courses
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Dashbord;
