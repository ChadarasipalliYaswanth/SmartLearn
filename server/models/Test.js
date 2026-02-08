import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: Number, // Index of the correct option
    required: true,
  },
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
  },
  questions: [questionSchema],
  passingMarks: {
    type: Number,
    default: 3, // 3 out of 4 to pass (more than 2 correct)
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Test = mongoose.model("Test", testSchema); 