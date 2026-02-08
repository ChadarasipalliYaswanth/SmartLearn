import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Tooltip,
} from "@mui/material";
import {
  Videocam,
  Delete,
  Add,
  Event,
  AccessTime,
  Person,
  HelpOutline,
  OpenInNew,
} from "@mui/icons-material";
import { useMeetingContext } from "../../context/MeetingContext";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import "./meetings.css";
import { toast } from "react-hot-toast";

const Meetings = ({ user }) => {
  const {
    meetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    deleteMeeting,
    joinMeeting,
  } = useMeetingContext();

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState(new Date());
  const [duration, setDuration] = useState(60);
  const [meetLink, setMeetLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [openHelpDialog, setOpenHelpDialog] = useState(false);

  const isAdmin = user && user.role === "admin";

  const handleCreateMeeting = async () => {
    if (!title || !description || !scheduledAt || !meetLink) {
      toast.error("Please fill in all required fields including Google Meet link");
      return;
    }

    if (!meetLink.includes("meet.google.com")) {
      toast.error("Please provide a valid Google Meet link (should contain meet.google.com)");
      return;
    }

    setCreating(true);
    const result = await createMeeting({
      title,
      description,
      scheduledAt,
      duration,
      meetLink,
    });

    if (result.success) {
      setOpenCreateDialog(false);
      resetForm();
    }
    setCreating(false);
  };

  const handleJoinMeeting = async (meetingId, meetLink) => {
    try {
      // Call the joinMeeting API to record that the user joined
      const result = await joinMeeting(meetingId);
      
      if (result.success) {
        // Display a success toast
        toast.success(
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Joining Google Meet session
            </div>
            <div style={{ marginBottom: '8px' }}>
              The meeting will open in a new tab. You may need to sign in with your Google account.
            </div>
          </div>,
          { duration: 5000 }
        );
        
        // Open the Google Meet link directly in a new tab
        window.open(meetLink, "_blank");
      } else {
        toast.error("Failed to join meeting");
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast.error("Failed to join meeting. Please try again.");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      await deleteMeeting(meetingId);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setScheduledAt(new Date());
    setDuration(60);
    setMeetLink("");
  };

  // Format meeting date and time
  const formatDateTime = (dateTime) => {
    return format(new Date(dateTime), "MMM dd, yyyy 'at' h:mm a");
  };

  // Function to open Google Meet in a new tab
  const openGoogleMeet = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  return (
    <Container maxWidth="lg" className="meetings-container">
      <Helmet>
        <title>Meetings - MVSR LEARN</title>
      </Helmet>

      <Box sx={{ pt: 4, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            <Videocam sx={{ mr: 1, verticalAlign: "middle" }} />
            Online Meetings
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Schedule New Meeting
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !meetings.length ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : meetings.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h6" gutterBottom>
              No meetings scheduled yet
            </Typography>
            {isAdmin ? (
              <Typography variant="body1" color="textSecondary">
                Click the button above to schedule your first meeting.
              </Typography>
            ) : (
              <Typography variant="body1" color="textSecondary">
                No meetings are currently scheduled. Please check back later.
              </Typography>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {meetings.map((meeting) => (
              <Grid item xs={12} md={6} key={meeting._id}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    borderRadius: 2,
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  {!meeting.isActive && (
                    <Chip
                      label="Inactive"
                      color="error"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 1,
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {meeting.title}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        color: "text.secondary",
                      }}
                    >
                      <Event fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDateTime(meeting.scheduledAt)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        color: "text.secondary",
                      }}
                    >
                      <AccessTime fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {meeting.duration} minutes
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        color: "text.secondary",
                      }}
                    >
                      <Person fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Created by: {meeting.createdBy?.name || "Admin"}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {meeting.description}
                    </Typography>
                    
                    <Box mt={2}>
                      <Chip 
                        icon={<Videocam />} 
                        label="Google Meet" 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Videocam />}
                      fullWidth
                      onClick={() => handleJoinMeeting(meeting._id, meeting.meetLink)}
                      disabled={!meeting.isActive}
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        }
                      }}
                    >
                      Join Google Meet
                    </Button>
                    {isAdmin && (
                      <IconButton
                        color="error"
                        aria-label="delete meeting"
                        onClick={() => handleDeleteMeeting(meeting._id)}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Create Meeting Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule New Meeting</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please create a Google Meet link and paste it below. Users will join your meeting directly through this link.
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button 
                  size="small" 
                  startIcon={<HelpOutline />} 
                  onClick={() => setOpenHelpDialog(true)}
                >
                  How to create a link
                </Button>
                <Button 
                  size="small" 
                  startIcon={<OpenInNew />} 
                  onClick={openGoogleMeet}
                >
                  Go to Google Meet
                </Button>
              </Box>
            </Alert>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Meeting Title"
              name="title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Meeting Description"
              name="description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="meetLink"
              label="Google Meet Link"
              name="meetLink"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              helperText="Create a meeting at meet.google.com and paste the link here"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Open Google Meet">
                    <IconButton edge="end" onClick={openGoogleMeet} size="small">
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Scheduled Time"
                value={scheduledAt}
                onChange={(newValue) => setScheduledAt(newValue)}
                sx={{ mt: 2, width: "100%" }}
              />
            </LocalizationProvider>
            <FormControl fullWidth margin="normal">
              <InputLabel id="duration-label">Duration (minutes)</InputLabel>
              <Select
                labelId="duration-label"
                id="duration"
                value={duration}
                label="Duration (minutes)"
                onChange={(e) => setDuration(e.target.value)}
              >
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={90}>1.5 hours</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateMeeting}
            variant="contained"
            disabled={creating || !title || !description || !scheduledAt || !meetLink}
          >
            {creating ? <CircularProgress size={24} /> : "Create Meeting"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Google Meet Help Dialog */}
      <Dialog
        open={openHelpDialog}
        onClose={() => setOpenHelpDialog(false)}
        maxWidth="md"
      >
        <DialogTitle>How to Create a Google Meet Link</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Follow these steps to create a Google Meet link:
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body1" paragraph>
                Go to <Link href="https://meet.google.com" target="_blank" rel="noopener">meet.google.com</Link> and sign in with your Google account
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Click on "New meeting" dropdown and select "Create a meeting for later"
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Copy the generated meeting link (it will look like https://meet.google.com/xxx-xxxx-xxx)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Paste the link into the "Google Meet Link" field in the form
              </Typography>
            </li>
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Make sure you're using your own Google account that has permission to create meetings. The meeting link will remain valid for users to join at the scheduled time.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHelpDialog(false)}>Close</Button>
          <Button
            onClick={openGoogleMeet}
            variant="contained"
            startIcon={<OpenInNew />}
          >
            Open Google Meet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Meetings; 