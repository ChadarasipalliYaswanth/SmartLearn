import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import { 
  createAssignment, 
  deleteAssignment, 
  getAssignment, 
  getCourseAssignments, 
  gradeSubmission, 
  submitAssignment, 
  updateAssignment,
  getUserSubmissions,
  getAllAssignments
} from "../controllers/assignment.js";
import { uploadAssignment } from "../middlewares/multer.js";

const router = express.Router();

// Admin routes
router.post("/assignment/new", isAuth, isAdmin, createAssignment);
router.put("/assignment/:assignmentId", isAuth, isAdmin, updateAssignment);
router.delete("/assignment/:assignmentId", isAuth, isAdmin, deleteAssignment);
router.post("/assignment/:assignmentId/grade/:submissionId", isAuth, isAdmin, gradeSubmission);

// Student/common routes
router.get("/assignments", isAuth, getAllAssignments); // Get all assignments
router.get("/course/:courseId/assignments", isAuth, getCourseAssignments);
router.get("/assignment/:assignmentId", isAuth, getAssignment);
router.post("/assignment/:assignmentId/submit", isAuth, uploadAssignment, submitAssignment);
router.get("/course/:courseId/my-submissions", isAuth, getUserSubmissions);

export default router; 