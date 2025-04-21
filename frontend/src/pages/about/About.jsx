import React from "react";
import { 
  Container, Typography, Box, Paper, Button, Grid, 
  Card, CardContent, Divider, Chip, Accordion, AccordionSummary, AccordionDetails,
  useTheme, useMediaQuery, Stack
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ComputerIcon from '@mui/icons-material/Computer';
import VerifiedIcon from '@mui/icons-material/Verified';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PsychologyIcon from '@mui/icons-material/Psychology';
import "./about.css";

// Styled components
const ValueCard = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  "&:hover": {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  "&:hover": {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
  }
}));

const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: '4px',
  width: '80px',
  borderRadius: '2px',
  margin: '16px auto 40px'
}));

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Core values data
  const coreValues = [
    {
      title: "Innovation",
      description: "We continuously strive to innovate our teaching methods and platform technology to provide the best learning experience.",
      icon: <LightbulbIcon className="value-icon" sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
    },
    {
      title: "Accessibility",
      description: "We believe education should be accessible to everyone, regardless of their background or circumstances.",
      icon: <AccessibilityNewIcon className="value-icon" sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
    },
    {
      title: "Community",
      description: "We build strong learning communities where students can connect, collaborate, and inspire each other.",
      icon: <PeopleIcon className="value-icon" sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
    },
    {
      title: "Excellence",
      description: "We are committed to excellence in all aspects of our educational content and student support.",
      icon: <StarIcon className="value-icon" sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
    }
  ];

  // Timeline milestones
  const milestones = [
    {
      year: "2018",
      title: "Foundation",
      description: "MVSR Learn was founded with the mission to make quality education accessible to all."
    },
    {
      year: "2019",
      title: "Platform Launch",
      description: "Launched our first version of the learning platform with 10 courses and 500 students."
    },
    {
      year: "2020",
      title: "Growth & Expansion",
      description: "Expanded to 50+ courses across different domains and reached 10,000 active students."
    },
    {
      year: "2022",
      title: "New Technology",
      description: "Implemented advanced AI-driven personalized learning paths and interactive features."
    },
    {
      year: "2023",
      title: "Global Reach",
      description: "Now serving students across 75+ countries with multilingual support and localized content."
    }
  ];

  // Learning features 
  const features = [
    {
      title: "Interactive Learning",
      description: "Engage with interactive lessons, quizzes, and practical assignments designed to reinforce your understanding.",
      icon: <ComputerIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    },
    {
      title: "Expert Instructors",
      description: "Learn from industry professionals and academics with years of experience in their respective fields.",
      icon: <VerifiedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    },
    {
      title: "Comprehensive Library",
      description: "Access a vast library of courses spanning programming, design, business, personal development, and more.",
      icon: <LocalLibraryIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    },
    {
      title: "Personalized Learning",
      description: "Adaptive learning paths adjust to your progress, ensuring you focus on what you need to learn.",
      icon: <PsychologyIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    }
  ];

  // FAQs
  const faqs = [
    {
      question: "How do MVSR Learn courses work?",
      answer: "Our courses combine video lectures, reading materials, interactive exercises, quizzes, and practical assignments. You can learn at your own pace, with lifetime access to course materials after enrollment."
    },
    {
      question: "Are there certificates upon completion?",
      answer: "Yes, all courses offer a certificate of completion that you can add to your portfolio, resume, or share on professional networks like LinkedIn."
    },
    {
      question: "What makes MVSR Learn different from other platforms?",
      answer: "We focus on practical, project-based learning with real-world applications. Our platform also includes community features, mentorship opportunities, and career resources to ensure your success beyond course completion."
    },
    {
      question: "How can I get help if I'm stuck?",
      answer: "Each course includes Q&A sections, discussion forums, and direct messaging with instructors. We also offer dedicated support for technical issues and enrollment questions."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Paper
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          textAlign: "center",
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 5 },
          mb: 8,
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
        }}
        elevation={6}
        className="about-animation"
      >
        <Box sx={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          opacity: 0.1,
          background: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80') center/cover no-repeat"
        }} />
        
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 900,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)" 
            }}
            className="about-title-animation about-hero-text"
          >
            Transform Your Future With <span style={{ color: theme.palette.secondary.light }}>MVSR Learn</span>
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            gutterBottom 
            sx={{ 
              maxWidth: "800px", 
              mx: "auto", 
              mb: 4,
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              opacity: 0.9
            }}
            className="about-subtitle"
          >
            Empowering learners worldwide with cutting-edge education and skills for the digital era
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            startIcon={<SchoolIcon />}
            sx={{ 
              borderRadius: 6,
              px: 4, 
              py: 1.5,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
              }
            }}
            className="pulse-button"
          >
            Explore Our Courses
          </Button>
        </Box>
      </Paper>

      {/* About Us Section */}
      <Box sx={{ textAlign: 'center', mb: 10 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          sx={{ fontWeight: 800, mb: 2 }}
          className="about-animation"
        >
          About Us
        </Typography>
        <GradientDivider />
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6} className="about-left-animation">
            <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Pioneering Online Education Since 2018
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem", lineHeight: 1.7, textAlign: 'left' }}>
              MVSR Learn started with a simple but powerful vision: to make high-quality education accessible to everyone, regardless of their location or background.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem", lineHeight: 1.7, textAlign: 'left' }}>
              Today, we're proud to be one of the fastest-growing online learning platforms, with a community of over 15,000 students from 75+ countries learning new skills, advancing their careers, and exploring their passions.
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "1.1rem", lineHeight: 1.7, textAlign: 'left' }}>
              Our comprehensive curriculum spans technology, business, creative arts, and personal development, all taught by industry experts who bring real-world experience to every lesson.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} className="about-right-animation">
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80"
              alt="Students collaborating"
              sx={{ 
                width: "100%", 
                borderRadius: 4,
                boxShadow: "0 16px 32px rgba(0, 0, 0, 0.15)"
              }}
              className="about-float-animation"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 10 }} className="about-animation" style={{ animationDelay: '0.2s' }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          sx={{ fontWeight: 800, mb: 2 }}
        >
          What Sets Us Apart
        </Typography>
        <GradientDivider />
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <FeatureCard elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2 }}>
                    {feature.icon}
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body1">
                    {feature.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Core Values Section */}
      <Box sx={{ mb: 10 }} className="about-animation" style={{ animationDelay: '0.3s' }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          sx={{ fontWeight: 800, mb: 2 }}
        >
          Our Core Values
        </Typography>
        <GradientDivider />
        <Grid container spacing={3}>
          {coreValues.map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ValueCard elevation={2} className="value-card">
                {value.icon}
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  {value.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {value.description}
                </Typography>
              </ValueCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Our Journey Timeline */}
      <Box sx={{ mb: 10 }} className="about-animation" style={{ animationDelay: '0.4s' }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          sx={{ fontWeight: 800, mb: 2 }}
        >
          Our Journey
        </Typography>
        <GradientDivider />
        
        <Box className="timeline-container" sx={{ py: 4 }}>
          {milestones.map((milestone, index) => (
            <Grid 
              container 
              key={index} 
              className="timeline-item" 
              sx={{ 
                mb: 6,
                flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                ...(isMobile && { flexDirection: 'row' })
              }}
            >
              <Grid item xs={12} sm={5}>
                <Box 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    boxShadow: 3,
                    ml: index % 2 === 0 ? 0 : { xs: 5, sm: 0 },
                    mr: index % 2 === 1 ? 0 : { xs: 5, sm: 0 },
                    ...(isMobile && { ml: 5, mr: 0 })
                  }}
                  className={index % 2 === 0 ? "about-left-animation" : "about-right-animation"}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <Chip 
                    label={milestone.year} 
                    color="primary" 
                    sx={{ mb: 2, fontWeight: 'bold' }}
                  />
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                    {milestone.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {milestone.description}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={0} sm={2} sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Grid item xs={0} sm={5} sx={{ display: { xs: 'none', sm: 'block' } }} />
            </Grid>
          ))}
        </Box>
      </Box>

      {/* Stats Section */}
      <Paper
        sx={{
          p: { xs: 4, md: 6 },
          mb: 10,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: "white",
          textAlign: "center",
        }}
        elevation={4}
        className="about-animation"
        style={{ animationDelay: '0.5s' }}
      >
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom 
          sx={{ fontWeight: 800, mb: 4 }}
        >
          Our Impact
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Typography 
              variant="h2" 
              component="p" 
              sx={{ 
                fontWeight: "bold",
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
              className="about-float-animation"
            >
              15K+
            </Typography>
            <Typography variant="h6">Students</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography 
              variant="h2" 
              component="p" 
              sx={{ 
                fontWeight: "bold",
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
              className="about-float-animation"
              style={{ animationDelay: '0.5s' }}
            >
              100+
            </Typography>
            <Typography variant="h6">Courses</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography 
              variant="h2" 
              component="p" 
              sx={{ 
                fontWeight: "bold",
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
              className="about-float-animation"
              style={{ animationDelay: '1s' }}
            >
              75+
            </Typography>
            <Typography variant="h6">Countries</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography 
              variant="h2" 
              component="p" 
              sx={{ 
                fontWeight: "bold",
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
              className="about-float-animation"
              style={{ animationDelay: '1.5s' }}
            >
              98%
            </Typography>
            <Typography variant="h6">Satisfaction</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* FAQ Section */}
      <Box sx={{ mb: 10 }} className="about-animation" style={{ animationDelay: '0.6s' }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          sx={{ fontWeight: 800, mb: 2 }}
        >
          Frequently Asked Questions
        </Typography>
        <GradientDivider />
        
        <Box sx={{ mt: 4 }}>
          {faqs.map((faq, index) => (
            <Accordion 
              key={index} 
              sx={{ 
                mb: 2, 
                overflow: 'hidden',
                borderRadius: '8px', 
                '&:before': { display: 'none' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ background: theme.palette.background.paper }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      {/* Call to Action Section */}
      <Box 
        sx={{ 
          textAlign: "center", 
          mb: 6, 
          p: { xs: 4, md: 8 }, 
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
          boxShadow: 4
        }}
        className="about-animation"
        style={{ animationDelay: '0.7s' }}
      >
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom 
          sx={{ fontWeight: 800 }}
        >
          Ready to Start Your Learning Journey?
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ mb: 4, maxWidth: 800, mx: 'auto', opacity: 0.9 }}
        >
          Join thousands of learners who have transformed their careers and lives with MVSR Learn courses.
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3} 
          justifyContent="center"
        >
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<SchoolIcon />}
            sx={{ 
              borderRadius: 8,
              px: 4, 
              py: 1.5,
              bgcolor: 'white',
              color: theme.palette.secondary.main,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'white',
                transform: 'translateY(-5px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
              }
            }}
            className="pulse-button"
          >
            Explore Our Courses
          </Button>
          <Button 
            variant="outlined" 
            color="inherit"
            size="large"
            startIcon={<ContactSupportIcon />}
            sx={{ 
              borderRadius: 8,
              px: 4, 
              py: 1.5,
              borderColor: 'white',
              borderWidth: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'white',
                borderWidth: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-5px)',
              }
            }}
          >
            Contact Us
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default About;``