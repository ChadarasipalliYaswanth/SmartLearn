import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
});

export const Certificate = mongoose.model("Certificate", certificateSchema); 