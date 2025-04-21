import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = ["uploads", "uploads/videos", "uploads/notes", "uploads/images", "uploads/assignments"];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

createUploadDirs();

// Storage configuration for videos
const videoStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/videos");
  },
  filename(req, file, cb) {
    const id = uuid();
    const extName = path.extname(file.originalname);
    const fileName = `${id}${extName}`;
    cb(null, fileName);
  },
});

// Storage configuration for notes (PDFs, DOCs, etc.)
const notesStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/notes");
  },
  filename(req, file, cb) {
    const id = uuid();
    const extName = path.extname(file.originalname);
    const fileName = `${id}${extName}`;
    cb(null, fileName);
  },
});

// Storage configuration for course images
const imageStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/images");
  },
  filename(req, file, cb) {
    const id = uuid();
    const extName = path.extname(file.originalname);
    const fileName = `${id}${extName}`;
    cb(null, fileName);
  },
});

// Storage configuration for assignment submissions
const assignmentStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/assignments");
  },
  filename(req, file, cb) {
    const id = uuid();
    const extName = path.extname(file.originalname);
    const fileName = `${id}${extName}`;
    cb(null, fileName);
  },
});

// File filter functions
const videoFilter = (req, file, cb) => {
  const allowedTypes = ['.mp4', '.mov', '.avi', '.wmv', '.mkv', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const notesFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only document files are allowed for notes!'), false);
  }
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const assignmentFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only document, image, or zip files are allowed for submissions!'), false);
  }
};

// Legacy upload middleware for backward compatibility
export const uploadFiles = multer({ 
  storage: videoStorage,
  fileFilter: videoFilter
}).single("file");

// New specific upload middlewares
export const uploadVideo = multer({ 
  storage: videoStorage,
  fileFilter: videoFilter
}).single("video");

export const uploadNotes = multer({ 
  storage: notesStorage,
  fileFilter: notesFilter
}).single("notes");

export const uploadImage = multer({ 
  storage: imageStorage,
  fileFilter: imageFilter
}).single("file");

// New upload middleware for assignment submissions
export const uploadAssignment = multer({ 
  storage: assignmentStorage,
  fileFilter: assignmentFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
}).single("submission");
