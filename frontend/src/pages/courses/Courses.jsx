import React, { useState, useEffect } from "react";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import { 
  Container, Typography, Grid, Box, Paper, Button, TextField, 
  InputAdornment, Chip, Card, CircularProgress, useMediaQuery, Fade, Divider 
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import SortIcon from '@mui/icons-material/Sort';

import SchoolIcon from '@mui/icons-material/School';
import FilterListIcon from '@mui/icons-material/FilterList';
import "./courses.css";

const Courses = () => {
  const { courses, loading: coursesLoading } = CourseData();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [isProcessing, setIsProcessing] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (courses && courses.length > 0) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        let result = [...courses];

        if (searchTerm) {
          const lowerSearchTerm = searchTerm.toLowerCase();
          result = result.filter(course => 
            course.title?.toLowerCase().includes(lowerSearchTerm) ||
            course.description?.toLowerCase().includes(lowerSearchTerm) ||
            course.category?.toLowerCase().includes(lowerSearchTerm) ||
            course.createdBy?.toLowerCase().includes(lowerSearchTerm)
          );
        }

        if (category !== "all") {
          const lowerCategory = category.toLowerCase();
          result = result.filter(course => 
            course.category?.toLowerCase() === lowerCategory
          );
        }

        switch (sortBy) {
          case "popular":
            result.sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0));
            break;
          case "newest":
            result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
          case "price-low":
            result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
            break;
          case "price-high":
            result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
            break;
          default:
             result.sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0));
        }

        setFilteredCourses(result);
        setIsProcessing(false);
      }, 300);

      return () => clearTimeout(timer);
    } else if (!coursesLoading) {
      setFilteredCourses([]);
      setIsProcessing(false);
    }
  }, [courses, searchTerm, category, sortBy, coursesLoading]);

  const categories = courses 
    ? ["all", ...new Set(courses
        .map(course => typeof course.category === 'string' ? course.category.trim() : null)
        .filter(cat => cat && cat.length > 0))]
    : ["all"];

  if (coursesLoading) {
      return (
          <Container sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Loading Courses...</Typography>
          </Container>
      );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }} className="course-container">
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: theme.palette.primary.contrastText,
          textAlign: 'center', 
          py: { xs: 5, md: 8 },
          px: { xs: 2, md: 4 },
          mb: { xs: 4, md: 6 },
          borderRadius: theme.shape.borderRadius * 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
         <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05, backgroundImage: 'url("/path/to/subtle/pattern.svg")', backgroundSize: 'cover' }} />
         <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={true} timeout={500}>
            <Typography 
              variant="h2"
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' }, 
                mb: 2,
              }}
            >
              Find Your Next Course
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
              color: theme.palette.primary.contrastText, 
              opacity: 0.9, 
              fontSize: { xs: '1rem', md: '1.15rem' },
            }}
          >
            Explore diverse topics taught by industry experts. Enhance your skills and achieve your learning goals.
          </Typography>
          </Fade>
          <Fade in={true} timeout={900}>
          <Button
            variant="contained"
            sx={{ 
              bgcolor: 'white',
              color: theme.palette.primary.main,
              fontSize: { xs: '0.9rem', md: '1rem' }, 
              fontWeight: 600,
              mt: 2, 
              px: { xs: 3, md: 5 }, 
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
          >
            Browse All Courses
          </Button>
          </Fade>
        </Box>
      </Paper>

      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: { xs: 4, md: 6 }, 
          borderRadius: theme.shape.borderRadius * 2,
          bgcolor: 'background.default',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5} lg={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by title, skill, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ 
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: '50px',
                  bgcolor: 'background.paper',
                  fontSize: '0.95rem',
                  '& input::placeholder': {
                      opacity: 0.7
                  }
                 }
              }}
              sx={{ 
                 '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={7} lg={8}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                 <Chip 
                    icon={<CategoryIcon />} 
                    label="Category:" 
                    variant="outlined" 
                    size="small"
                    sx={{ mr: 1, borderColor: 'transparent', color: 'text.secondary' }} 
                 />
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    clickable
                    onClick={() => setCategory(cat)}
                    color={category === cat ? "primary" : "default"}
                    variant={category === cat ? "filled" : "outlined"}
                    size="small"
                    sx={{ 
                      borderRadius: '16px',
                      transition: 'all 0.2s ease',
                      boxShadow: category === cat ? '0 2px 5px rgba(74, 105, 189, 0.3)' : 'none',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        bgcolor: category !== cat ? theme.palette.action.hover : undefined,
                      }
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                    icon={<SortIcon />} 
                    label="Sort by:" 
                    variant="outlined" 
                    size="small"
                    sx={{ mr: 1, borderColor: 'transparent', color: 'text.secondary' }} 
                />
                {["popular", "newest", "price-low", "price-high"].map((sort) => (
                  <Chip
                    key={sort}
                    label={sort.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    clickable
                    onClick={() => setSortBy(sort)}
                    color={sortBy === sort ? "primary" : "default"} 
                    variant={sortBy === sort ? "filled" : "outlined"}
                    size="small"
                    sx={{ 
                      borderRadius: '16px',
                      transition: 'all 0.2s ease',
                      boxShadow: sortBy === sort ? '0 2px 5px rgba(74, 105, 189, 0.3)' : 'none',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        bgcolor: sortBy !== sort ? theme.palette.action.hover : undefined,
                      }
                     }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            textAlign: 'center',
            mb: 4,
            color: theme.palette.text.primary
          }}
        >
          {searchTerm || category !== 'all' ? 'Search Results' : 'Featured Courses'}
        </Typography>
        
        {isProcessing ? (
          <Grid container spacing={3}>
             {[...Array(6)].map((_, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                   <Box className="shimmer" sx={{ height: 280, borderRadius: theme.shape.borderRadius * 1.5 }}></Box>
                </Grid>
             ))}
          </Grid>
        ) : filteredCourses && filteredCourses.length > 0 ? (
          <Grid container spacing={isMobile ? 2 : 3} >
            {filteredCourses.map((course, index) => (
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
           <Card 
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
              No Courses Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || category !== 'all' 
                ? 'We couldn\'t find courses matching your criteria. Try adjusting your search or filters.' 
                : 'There are currently no courses available in this category. Check back soon!'}
            </Typography>
             <Button variant="outlined" onClick={() => { setSearchTerm(''); setCategory('all'); }}>
                Clear Filters
             </Button>
          </Card>
        )}
      </Box>
      
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'background.paper', borderRadius: theme.shape.borderRadius * 2, p: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Why Learn With Us?
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {[
            { value: '50+', label: 'Expert Instructors' },
            { value: '100+', label: 'Quality Courses' },
            { value: '5K+', label: 'Happy Students' }
          ].map((stat, index) => (
            <Grid item key={index} xs={12} sm={4} md={3}>
              <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 150}ms` }}>
                <Box 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    borderRadius: theme.shape.borderRadius * 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.default',
                    "&:hover": {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 15px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        borderColor: theme.palette.primary.light
                    }
                  }}
                >
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>{stat.value}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">{stat.label}</Typography>
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Courses;