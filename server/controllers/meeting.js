import { Meeting } from "../models/Meeting.js";
import { User } from "../models/User.js";
import TryCatch from "../middlewares/TryCatch.js";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";

// Initialize Google API client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials using refresh token
const setGoogleCredentials = () => {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
};

// Create a new Google Meet meeting
export const createMeeting = TryCatch(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can create meetings",
    });
  }

  const { title, description, scheduledAt, duration, meetLink } = req.body;

  if (!title || !description || !scheduledAt || !meetLink) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: title, description, scheduledAt, and meetLink",
    });
  }

  // Validate that the meetLink is a Google Meet URL
  if (!meetLink.includes("meet.google.com")) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid Google Meet link (should contain meet.google.com)",
    });
  }

  try {
    // Create a new meeting in the database using the provided Google Meet link
    const meeting = await Meeting.create({
      title,
      description,
      meetLink,
      scheduledAt,
      duration: duration || 60,
      createdBy: req.user._id,
      isActive: true,
    });
    
    return res.status(201).json({
      success: true,
      message: "Meeting created successfully with your Google Meet link.",
      meeting,
    });
  } catch (error) {
    console.error("Meeting creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create meeting",
      error: error.message,
    });
  }
});

// Get all meetings
export const getAllMeetings = TryCatch(async (req, res) => {
  const meetings = await Meeting.find()
    .populate("createdBy", "name email")
    .sort({ scheduledAt: -1 });
  
  return res.status(200).json({
    success: true,
    meetings,
  });
});

// Get a specific meeting by ID
export const getMeetingById = TryCatch(async (req, res) => {
  const { id } = req.params;
  
  const meeting = await Meeting.findById(id)
    .populate("createdBy", "name email")
    .populate("participants.userId", "name email");
  
  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: "Meeting not found",
    });
  }
  
  return res.status(200).json({
    success: true,
    meeting,
  });
});

// Update meeting details
export const updateMeeting = TryCatch(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can update meetings",
    });
  }
  
  const { id } = req.params;
  const { title, description, scheduledAt, isActive, duration } = req.body;
  
  const meeting = await Meeting.findById(id);
  
  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: "Meeting not found",
    });
  }
  
  if (title) meeting.title = title;
  if (description) meeting.description = description;
  if (scheduledAt) meeting.scheduledAt = scheduledAt;
  if (isActive !== undefined) meeting.isActive = isActive;
  if (duration) meeting.duration = duration;
  
  await meeting.save();
  
  return res.status(200).json({
    success: true,
    message: "Meeting updated successfully",
    meeting,
  });
});

// Delete a meeting
export const deleteMeeting = TryCatch(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can delete meetings",
    });
  }
  
  const { id } = req.params;
  
  const meeting = await Meeting.findById(id);
  
  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: "Meeting not found",
    });
  }
  
  await Meeting.findByIdAndDelete(id);
  
  return res.status(200).json({
    success: true,
    message: "Meeting deleted successfully",
  });
});

// Join a meeting
export const joinMeeting = TryCatch(async (req, res) => {
  const { id } = req.params;
  
  const meeting = await Meeting.findById(id);
  
  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: "Meeting not found",
    });
  }
  
  // Check if meeting is active
  if (!meeting.isActive) {
    return res.status(400).json({
      success: false,
      message: "This meeting is not active",
    });
  }
  
  // Check if user is already in participants
  const participantIndex = meeting.participants.findIndex(
    (p) => p.userId.toString() === req.user._id.toString()
  );
  
  if (participantIndex !== -1) {
    // Update existing participant
    meeting.participants[participantIndex].joined = true;
    meeting.participants[participantIndex].joinedAt = new Date();
  } else {
    // Add new participant
    meeting.participants.push({
      userId: req.user._id,
      joined: true,
      joinedAt: new Date(),
    });
  }
  
  await meeting.save();
  
  // Enhanced response with more information for debugging
  return res.status(200).json({
    success: true,
    message: "Meeting joined successfully",
    meetLink: meeting.meetLink,
    meetingInfo: {
      title: meeting.title,
      scheduledAt: meeting.scheduledAt
    }
  });
}); 