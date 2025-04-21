import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography, Box, Chip, CardActions, Button, Rating, Avatar, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LevelIcon from '@mui/icons-material/SignalCellularAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import axios from "axios";
import { CourseData } from "../../context/CourseContext";

// StyledCard with hover animation
const StyledCard = styled(Card)(({ theme, admin }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  borderRadius: theme.shape.borderRadius * (admin ? 1 : 2),
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
  },
}));

// CourseCard component
const CourseCard = ({ course, admin }) => {
  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const { fetchCourses } = CourseData();

  // Delete course handler
  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const { data } = await axios.delete(`${server}/api/course/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchCourses();
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting course");
      }
    }
  };
  
  // Access course properties safely with optional chaining and default values
  const { _id, title, description, duration, level, rating, image, createdBy } = course || {};
  
  // Format price to display 'Free' if 0 or undefined
  const formattedPrice = course?.price ? `$${course.price}` : "Free";
  
  // Get difficulty level color
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <StyledCard admin={admin}>
      {/* Course Image */}
      <Box sx={{ position: 'relative', paddingTop: admin ? '40%' : '56.25%' /* Admin: lower height, normal: 16:9 aspect ratio */ }}>
        <CardMedia
          component="img"
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          image={image ? `${server}/${image}` : "https://via.placeholder.com/300x200?text=No+Image"}
          alt={title || "Course thumbnail"}
        />
        
        {/* Price badge */}
        <Chip
          label={formattedPrice}
          color="primary"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontWeight: 'bold',
            fontSize: '0.875rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: admin ? 2 : 3 }}>
        {/* Course title */}
        <Typography 
          variant={admin ? "subtitle1" : "h6"}
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: admin ? '2.5rem' : '3.5rem',
          }}
        >
          {title || "Untitled Course"}
        </Typography>
        
        {/* Course meta info */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: admin ? 1 : 2 }}>
          {duration && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
              {duration} weeks
            </Box>
          )}
          
          {level && !admin && (
            <Chip
              size="small"
              icon={<LevelIcon />}
              label={level}
              color={getLevelColor(level)}
              variant="outlined"
              sx={{ height: 24 }}
            />
          )}
        </Stack>
        
        {/* Course description - hide or show less in admin view */}
        {!admin && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              mb: 2,
              minHeight: '4.5rem',
            }}
          >
            {description || "No description available"}
          </Typography>
        )}
        
        {/* Instructor info */}
        {createdBy && !admin && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              sx={{ width: 28, height: 28, mr: 1, bgcolor: 'primary.main' }}
            >
              <PersonIcon fontSize="small" />
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              by {createdBy || "Unknown Instructor"}
            </Typography>
          </Box>
        )}
        
        {/* Rating */}
        {rating !== undefined && !admin && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating 
              value={rating} 
              precision={0.5} 
              size="small" 
              readOnly 
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {rating.toFixed(1)} • {course.students?.length || 0} students
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ p: admin ? 1 : 2, pt: 0 }}>
        {admin ? (
          <Stack direction="row" spacing={1} width="100%">
            <Button 
              onClick={() => navigate(`/course/study/${_id}`)}
              variant="outlined" 
              size="small"
              sx={{ flex: 1 }}
            >
              View
            </Button>
            <Button
              onClick={() => deleteHandler(_id)}
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              sx={{ flex: 1 }}
            >
              Delete
            </Button>
          </Stack>
        ) : (
          <>
            <Button 
              onClick={() => navigate(`/course/study/${_id}`)}
              variant="contained" 
              fullWidth
              sx={{ 
                borderRadius: 6,
                py: 1,
                fontWeight: 'bold',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.03)',
                }
              }}
            >
              Get Started
            </Button>
            
            {user && user.role === "admin" && (
              <Button
                onClick={() => deleteHandler(_id)}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                fullWidth
                sx={{ 
                  mt: 1, 
                  borderRadius: 6, 
                  py: 1, 
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#d32f2f',
                    transform: 'scale(1.03)',
                  }
                }}
              >
                Delete
              </Button>
            )}
          </>
        )}
      </CardActions>
    </StyledCard>
  );
};

export default CourseCard;