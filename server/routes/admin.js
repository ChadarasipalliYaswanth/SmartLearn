import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  addLectures,
  addLectureNotes,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllStats,
  getAllUser,
  updateRole,
} from "../controllers/admin.js";
import { uploadFiles, uploadImage, uploadNotes, uploadVideo } from "../middlewares/multer.js";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure directories exist
const uploadDirs = ["uploads/videos", "uploads/notes", "uploads/images"];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for lecture files
const lectureStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, 'uploads/videos');
    } else if (file.fieldname === 'notes') {
      cb(null, 'uploads/notes');
    } else {
      cb(new Error('Invalid fieldname'));
    }
  },
  filename: function(req, file, cb) {
    const id = uuid();
    const extName = path.extname(file.originalname);
    const fileName = `${id}${extName}`;
    cb(null, fileName);
  }
});

// Configure file filter
const lectureFileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowedTypes = ['.mp4', '.mov', '.avi', '.wmv', '.mkv', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  } else if (file.fieldname === 'notes') {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files are allowed for notes!'), false);
    }
  }
};

// Configure storage for course images
const courseImageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/images');
  },
  filename: function(req, file, cb) {
    const id = uuid();
    const extName = path.extname(file.originalname);
    const fileName = `${id}${extName}`;
    cb(null, fileName);
  }
});

const courseImageFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadCourseImage = multer({
  storage: courseImageStorage,
  fileFilter: courseImageFilter
}).single("file"); // Use "file" to match the frontend form field name

// Create lecture upload multer middleware
const uploadLectureFiles = multer({
  storage: lectureStorage,
  fileFilter: lectureFileFilter,
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'notes', maxCount: 1 }
]);

// Routes
router.post("/course/new", isAuth, isAdmin, uploadCourseImage, createCourse);
router.post("/course/:id", isAuth, isAdmin, uploadLectureFiles, addLectures);
router.post("/lecture/notes/:lectureId", isAuth, isAdmin, uploadNotes, addLectureNotes);
router.delete("/course/:id", isAuth, isAdmin, deleteCourse);
router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture);
router.get("/stats", isAuth, isAdmin, getAllStats);
router.get("/users", isAuth, isAdmin, getAllUser);
router.patch("/user/:id", isAuth, isAdmin, updateRole);

export default router;