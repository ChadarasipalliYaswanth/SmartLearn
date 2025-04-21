import React from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Link, 
  Divider, 
  IconButton,
  useTheme,
  useMediaQuery 
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  YouTube,
  School,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const footerLinks = [
    {
      title: "About",
      links: [
        { name: "About Us", url: "/about" },
        { name: "Our Team", url: "/about#team" },
        { name: "Campus", url: "/about#campus" },
      ],
    },
    {
      title: "Academics",
      links: [
        { name: "Courses", url: "/courses" },
        { name: "Assignments", url: "/my-assignments" },
        { name: "Resources", url: "/resources" },
      ],
    },
    {
      title: "Help",
      links: [
        { name: "FAQs", url: "/faqs" },
        { name: "Contact Us", url: "/contact" },
        { name: "Support", url: "/support" },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.dark",
        color: "white",
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and College Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School fontSize="large" />
              <Typography
                variant="h5"
                component={RouterLink}
                to="/"
                sx={{
                  ml: 1,
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "bold",
                  letterSpacing: 1,
                }}
              >
                MVSR LEARN
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8, maxWidth: '80%' }}>
              MVSR Engineering College's premier e-learning platform for collaborative education and skill development.
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  MVSR Engineering College, Nadergul, Hyderabad
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  <Link href="mailto:info@mvsrlearn.edu" color="inherit" underline="hover">
                    info@mvsrlearn.edu
                  </Link>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  <Link href="tel:+910401234567" color="inherit" underline="hover">
                    +91 040-1234567
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          {!isMobile && footerLinks.map((section) => (
            <Grid item xs={6} sm={4} md={2} key={section.title}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {section.links.map((link) => (
                  <Link
                    key={link.name}
                    component={RouterLink}
                    to={link.url}
                    sx={{
                      color: "white",
                      opacity: 0.7,
                      textDecoration: "none",
                      mb: 1,
                      transition: "all 0.2s",
                      "&:hover": {
                        opacity: 1,
                        pl: 0.5,
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Connect with Us */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Connect With Us
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <IconButton
                aria-label="facebook"
                sx={{
                  color: "white",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-3px)", color: "#4267B2" },
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                aria-label="twitter"
                sx={{
                  color: "white",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-3px)", color: "#1DA1F2" },
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                aria-label="linkedin"
                sx={{
                  color: "white",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-3px)", color: "#0e76a8" },
                }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                aria-label="instagram"
                sx={{
                  color: "white",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-3px)", color: "#E1306C" },
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                aria-label="youtube"
                sx={{
                  color: "white",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-3px)", color: "#FF0000" },
                }}
              >
                <YouTube />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
              Subscribe to our newsletter for the latest updates
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 3 }} />

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "center", sm: "flex-start" } }}>
          <Typography variant="body2" sx={{ opacity: 0.7, textAlign: { xs: "center", sm: "left" } }}>
            &copy; {new Date().getFullYear()} MVSR Learn. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: { xs: 2, sm: 0 } }}>
            <Link
              href="/privacy"
              sx={{
                color: "white",
                opacity: 0.7,
                textDecoration: "none",
                "&:hover": { opacity: 1 },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              sx={{
                color: "white",
                opacity: 0.7,
                textDecoration: "none",
                "&:hover": { opacity: 1 },
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;