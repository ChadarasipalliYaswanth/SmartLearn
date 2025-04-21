import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  LaptopMac, 
  School, 
  Assignment, 
  GroupWork, 
  Chat, 
  LiveTv,
  EmojiEvents,
  CloudDownload
} from "@mui/icons-material";
import Testimonials from "../../components/testimonials/Testimonials";

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <School fontSize="large" color="primary" />,
      title: "Comprehensive Courses",
      description: "Access a wide range of courses from different departments and specializations."
    },
    {
      icon: <Assignment fontSize="large" color="primary" />,
      title: "Interactive Assignments",
      description: "Engage with practical assignments that reinforce learning and build skills."
    },
    {
      icon: <Chat fontSize="large" color="primary" />,
      title: "Direct Communication",
      description: "Connect directly with professors and peers through our integrated chat system."
    },
    {
      icon: <LiveTv fontSize="large" color="primary" />,
      title: "Video Lectures",
      description: "Watch high-quality video lectures from top professors at your own pace."
    },
    {
      icon: <CloudDownload fontSize="large" color="primary" />,
      title: "Downloadable Resources",
      description: "Access and download study materials, presentations, and additional resources."
    },
    {
      icon: <GroupWork fontSize="large" color="primary" />,
      title: "Collaborative Learning",
      description: "Work together with classmates on group projects and discussions."
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: "white",
          position: "relative",
          overflow: "hidden",
          pt: { xs: 10, md: 16 },
          pb: { xs: 12, md: 20 },
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  marginBottom: 3
                }}
              >
                Elevate Your Education with MVSR Learn
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 400,
                  opacity: 0.9,
                  maxWidth: '600px'
                }}
              >
                The premier e-learning platform designed exclusively for MVSR Engineering College students and faculty. Access lectures, notes, assignments and connect with teachers - all in one place.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate("/courses")}
                  sx={{ 
                    py: 1.5,
                    px: 3,
                    fontWeight: 600,
                    borderRadius: '50px'
                  }}
                >
                  Explore Courses
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/about")}
                  sx={{ 
                    py: 1.5,
                    px: 3,
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderColor: 'white',
                    borderRadius: '50px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderColor: 'white',
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            {!isMobile && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    height: '400px',
                  }}
                >
                  <Box
                    component="img"
                    src="https://img.freepik.com/free-vector/online-learning-isometric-concept_1284-17947.jpg"
                    alt="E-learning illustration"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '10px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
        
        {/* Wave Separator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            left: 0,
            width: '100%',
            overflow: 'hidden',
            lineHeight: 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{
              position: 'relative',
              display: 'block',
              width: 'calc(100% + 1.3px)',
              height: '60px',
            }}
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              fill="#FFFFFF"
            />
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              fill="#FFFFFF"
            />
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="#FFFFFF"
            />
          </svg>
        </Box>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Everything You Need to Succeed
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            MVSR Learn provides a comprehensive suite of tools designed to enhance your learning experience
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <Box sx={{ mb: 2, display: 'inline-block', p: 1.5, borderRadius: '50%', bgcolor: `${theme.palette.primary.main}10` }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Statistics Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {[
              { count: '50+', label: 'Courses', icon: <School color="primary" sx={{ fontSize: 40 }} /> },
              { count: '1000+', label: 'Students', icon: <GroupWork color="primary" sx={{ fontSize: 40 }} /> },
              { count: '30+', label: 'Expert Instructors', icon: <LaptopMac color="primary" sx={{ fontSize: 40 }} /> },
              { count: '95%', label: 'Success Rate', icon: <EmojiEvents color="primary" sx={{ fontSize: 40 }} /> }
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {stat.icon}
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700, my: 1 }}>
                    {stat.count}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8 }}>
        <Testimonials />
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 10, 
          background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Transform Your Learning Experience?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: '700px', mx: 'auto', opacity: 0.9 }}>
            Join MVSR Learn today and get access to all courses, resources, and tools designed to help you excel in your academic journey.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate("/register")}
            sx={{ 
              py: 1.5,
              px: 4,
              fontWeight: 600,
              backgroundColor: 'white',
              color: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              },
              borderRadius: '50px'
            }}
          >
            Join Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;