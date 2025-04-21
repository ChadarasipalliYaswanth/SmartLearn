import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Home,
  AccountCircle,
  Login,
  Logout,
  School,
  Info,
  Assignment,
  Chat,
  Menu as MenuIcon,
  Close as CloseIcon,
  Videocam,
  EmojiEvents,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";

const Header = ({ isAuth, logoutHandler, user }) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Check if the current route matches the link
  const isActive = (path) => location.pathname === path;

  // Toggle mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Fetch unread message count
  useEffect(() => {
    if (isAuth) {
      const fetchUnreadMessages = async () => {
        try {
          const { data } = await axios.get(`${server}/api/chat/unread/count`, {
            headers: {
              token: localStorage.getItem("token"),
            },
          });
          setUnreadCount(data.count || 0);
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      };

      fetchUnreadMessages();
      // Set an interval to check for new messages
      const interval = setInterval(fetchUnreadMessages, 30000); // every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuth]);

  // Navigation links for desktop and mobile
  const navLinks = [
    {
      name: "Courses",
      icon: <School />,
      path: "/courses",
      authRequired: false,
    },
    {
      name: "About",
      icon: <Info />,
      path: "/about",
      authRequired: false,
    },
    {
      name: "Assignments",
      icon: <Assignment />,
      path: user?.role === "admin" ? "/admin/assignments" : "/my-assignments",
      authRequired: true,
    },
    {
      name: "Chat",
      icon: 
        <Badge color="error" variant="dot" invisible={unreadCount === 0}>
          <Chat />
        </Badge>,
      path: "/chat",
      authRequired: true,
    },
    {
      name: "Meetings",
      icon: <Videocam />,
      path: "/meetings",
      authRequired: true,
    },
    {
      name: "Certificates",
      icon: <EmojiEvents />,
      path: "/certificates",
      authRequired: true,
    },
    {
      name: "Account",
      icon: <AccountCircle />,
      path: "/account",
      authRequired: true,
    },
  ];

  // Drawer content for mobile view
  const drawer = (
    <Box sx={{ width: 250, height: '100%', bgcolor: 'background.paper' }} role="presentation">
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: 'primary.main', 
        color: 'white'
      }}>
        <Typography variant="h6" component={Link} to="/" 
          sx={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          MVSR LEARN
        </Typography>
        <IconButton color="inherit" onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navLinks.map((link) => 
          (!link.authRequired || (link.authRequired && isAuth)) ? (
            <ListItem 
              component={Link} 
              to={link.path} 
              key={link.name}
              onClick={handleDrawerToggle}
              sx={{ 
                color: isActive(link.path) ? 'primary.main' : 'text.primary',
                bgcolor: isActive(link.path) ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive(link.path) ? 'primary.main' : 'inherit' }}>
                {link.icon}
              </ListItemIcon>
              <ListItemText primary={link.name} />
            </ListItem>
          ) : null
        )}
        {isAuth ? (
          <ListItem component="div" onClick={logoutHandler}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        ) : (
          <>
            <ListItem 
              component={Link} 
              to="/login"
              onClick={handleDrawerToggle}
              sx={{ 
                color: isActive('/login') ? 'primary.main' : 'text.primary',
                bgcolor: isActive('/login') ? 'action.selected' : 'transparent',
              }}
            >
              <ListItemIcon sx={{ color: isActive('/login') ? 'primary.main' : 'inherit' }}>
                <Login />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem 
              component={Link} 
              to="/register"
              onClick={handleDrawerToggle}
              sx={{ 
                color: isActive('/register') ? 'primary.main' : 'text.primary',
                bgcolor: isActive('/register') ? 'action.selected' : 'transparent',
              }}
            >
              <ListItemIcon sx={{ color: isActive('/register') ? 'primary.main' : 'inherit' }}>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={2}>
      <Container maxWidth="xl">
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
          {/* Logo Section */}
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              color: "white", 
              textDecoration: "none",
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <Home fontSize="medium" />
            <Box 
              component="span" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                transition: "color 0.3s ease",
                "&:hover": {
                  color: theme.palette.secondary.light,
                },
              }}
            >
              MVSR LEARN
            </Box>
          </Typography>

          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {navLinks.map((link) => 
                (!link.authRequired || (link.authRequired && isAuth)) ? (
                  <Tooltip key={link.name} title={link.name} arrow>
                    <IconButton
                      color="inherit"
                      component={Link}
                      to={link.path}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        transition: 'all 0.3s ease',
                        opacity: isActive(link.path) ? 1 : 0.8,
                        '&:hover': {
                          opacity: 1,
                          transform: 'translateY(-2px)',
                          color: theme.palette.secondary.light,
                        },
                      }}
                    >
                      {link.icon}
                      <Typography variant="caption" sx={{ fontSize: "11px", mt: 0.5 }}>
                        {link.name}
                      </Typography>
                    </IconButton>
                  </Tooltip>
                ) : null
              )}
              
              {isAuth ? (
                <Tooltip title="Logout" arrow>
                  <IconButton
                    color="inherit"
                    onClick={logoutHandler}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: 'all 0.3s ease',
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1,
                        transform: 'translateY(-2px)',
                        color: theme.palette.secondary.light,
                      },
                    }}
                  >
                    <Logout />
                    <Typography variant="caption" sx={{ fontSize: "11px", mt: 0.5 }}>
                      Logout
                    </Typography>
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Tooltip title="Login" arrow>
                    <IconButton
                      color="inherit"
                      component={Link}
                      to="/login"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        opacity: isActive('/login') ? 1 : 0.8,
                        '&:hover': {
                          opacity: 1,
                          transform: 'translateY(-2px)',
                          color: theme.palette.secondary.light,
                        },
                      }}
                    >
                      <Login />
                      <Typography variant="caption" sx={{ fontSize: "11px", mt: 0.5 }}>
                        Login
                      </Typography>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Register" arrow>
                    <IconButton
                      color="inherit"
                      component={Link}
                      to="/register"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        opacity: isActive('/register') ? 1 : 0.8,
                        '&:hover': {
                          opacity: 1,
                          transform: 'translateY(-2px)',
                          color: theme.palette.secondary.light,
                        },
                      }}
                    >
                      <AccountCircle />
                      <Typography variant="caption" sx={{ fontSize: "11px", mt: 0.5 }}>
                        Register
                      </Typography>
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;