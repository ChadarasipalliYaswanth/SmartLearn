import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  grade: {
    type: Number,
    default: null,
  },
  feedback: {
    type: String,
    default: "",
  },
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: false, // Make course optional
  },
  submissions: [submissionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Assignment = mongoose.model("Assignment", assignmentSchema); 