import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Utils/Layout";
import axios from "axios";
import { server } from "../../main";
import "./dashboard.css";
import { 
  Box, 
  Typography, 
  Grid, 
  Paper,
  CircularProgress,
  useTheme
} from "@mui/material";
import {
  LibraryBooks,
  People,
  VideoLibrary,
  OndemandVideo
} from "@mui/icons-material";

const AdminDashbord = ({ user }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  //if (user && user.role !== "admin") return navigate("/");

  async function fetchStats() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/api/stats`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Courses",
      value: stats.totalCoures || 0,
      icon: <LibraryBooks sx={{ fontSize: 40, color: "#fff" }} />,
      color: "#8a4baf"
    },
    {
      title: "Lectures",
      value: stats.totalLectures || 0,
      icon: <VideoLibrary sx={{ fontSize: 40, color: "#fff" }} />,
      color: "#7351b5"
    },
    {
      title: "Users",
      value: stats.totalUsers || 0,
      icon: <People sx={{ fontSize: 40, color: "#fff" }} />,
      color: "#5a67d8"
    }
  ];

  return (
    <div>
      <Layout>
        <div className="admin-dashboard">
          <Box className="dashboard-welcome" mb={4}>
            <Typography variant="h4" component="h1" className="welcome-title">
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Welcome back! Here's an overview of your platform.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper 
                  className="stat-card"
                  elevation={2}
                  sx={{
                    background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                    color: 'white',
                    height: '100%'
                  }}
                >
                  <Box className="stat-card-content">
                    <Box className="stat-card-icon">
                      {card.icon}
                    </Box>
                    <Box className="stat-card-info">
                      <Typography variant="h3" component="div" className="stat-value">
                        {loading ? <CircularProgress size={40} color="inherit" /> : card.value}
                      </Typography>
                      <Typography variant="body1" component="div" className="stat-title">
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box mt={6}>
            <Paper className="quick-actions" elevation={2}>
              <Typography variant="h5" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={3} className="action-buttons">
                <Grid item xs={4}>
                  <Paper 
                    className="action-button" 
                    elevation={1}
                    onClick={() => navigate('/admin/course')}
                  >
                    <LibraryBooks sx={{ fontSize: 24, color: "#8a4baf" }} />
                    <Typography variant="body2">Manage Courses</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper 
                    className="action-button" 
                    elevation={1}
                    onClick={() => navigate('/admin/users')}
                  >
                    <People sx={{ fontSize: 24, color: "#7351b5" }} />
                    <Typography variant="body2">Manage Users</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper 
                    className="action-button" 
                    elevation={1}
                    onClick={() => navigate('/admin/lectures')}
                  >
                    <OndemandVideo sx={{ fontSize: 24, color: "#5a67d8" }} />
                    <Typography variant="body2">Manage Lectures</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </div>
      </Layout>
    </div>
  );
};

export default AdminDashbord;
