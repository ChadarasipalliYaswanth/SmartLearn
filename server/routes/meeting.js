import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  createMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
} from "../controllers/meeting.js";

const router = express.Router();

// Create a new meeting (admin only)
router.post("/", isAuth, isAdmin, createMeeting);

// Get all meetings
router.get("/", isAuth, getAllMeetings);

// Get a specific meeting by ID
router.get("/:id", isAuth, getMeetingById);

// Update meeting details (admin only)
router.put("/:id", isAuth, isAdmin, updateMeeting);

// Delete a meeting (admin only)
router.delete("/:id", isAuth, isAdmin, deleteMeeting);

// Join a meeting
router.post("/:id/join", isAuth, joinMeeting);

export default router; 