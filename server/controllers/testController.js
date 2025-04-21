import TryCatch from "../middlewares/TryCatch.js";
import { Test } from "../models/Test.js";
import { Lecture } from "../models/Lecture.js";
import { Certificate } from "../models/Certificate.js";
import { v4 as uuidv4 } from "uuid";
import { Courses } from "../models/Courses.js";

// Create a new test for a lecture
export const createTest = TryCatch(async (req, res) => {
  const { lectureId } = req.params;
  const { title, description, questions, passingMarks } = req.body;
  console.log("Creating test for lecture:", lectureId);
  console.log("Received data:", { title, description, questions: questions.length, passingMarks });

  // Validate input
  if (!title || !description || !questions || questions.length !== 4) {
    console.log("Validation failed:", { title: !!title, description: !!description, questions: !!questions, questionsLength: questions?.length });
    return res.status(400).json({
      message: "Please provide title, description, and exactly 4 questions",
    });
  }

  // Check if lecture exists
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    console.log("Lecture not found with ID:", lectureId);
    return res.status(404).json({
      message: "Lecture not found",
    });
  }
  console.log("Lecture found:", lecture.title);

  // Check if test already exists for this lecture
  const existingTest = await Test.findOne({ lecture: lectureId });
  if (existingTest) {
    console.log("Updating existing test for lecture:", lectureId);
    // Update the existing test instead of creating a new one
    existingTest.title = title;
    existingTest.description = description;
    existingTest.questions = questions;
    existingTest.passingMarks = passingMarks || 3;
    
    await existingTest.save();
    console.log("Test updated successfully");
    
    return res.status(200).json({
      message: "Test updated successfully",
      test: existingTest,
    });
  }

  // Create the test
  console.log("Creating new test");
  const test = await Test.create({
    title,
    description,
    lecture: lectureId,
    questions,
    passingMarks: passingMarks || 3,
  });
  console.log("Test created successfully:", test._id);

  res.status(201).json({
    message: "Test created successfully",
    test,
  });
});

// Get a test for a lecture
export const getTest = TryCatch(async (req, res) => {
  const { lectureId } = req.params;

  const test = await Test.findOne({ lecture: lectureId });
  
  if (!test) {
    return res.status(404).json({
      message: "No test found for this lecture",
    });
  }

  // For student view, don't send correct answers
  if (req.user.role !== "admin") {
    const testWithoutAnswers = {
      _id: test._id,
      title: test.title,
      description: test.description,
      lecture: test.lecture,
      questions: test.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
      })),
      passingMarks: test.passingMarks,
      createdAt: test.createdAt,
    };
    
    return res.status(200).json({
      test: testWithoutAnswers,
    });
  }

  res.status(200).json({
    test,
  });
});

// Update a test
export const updateTest = TryCatch(async (req, res) => {
  const { lectureId } = req.params;
  const { title, description, questions, passingMarks } = req.body;

  const test = await Test.findOne({ lecture: lectureId });
  
  if (!test) {
    return res.status(404).json({
      message: "Test not found",
    });
  }

  if (title) test.title = title;
  if (description) test.description = description;
  if (questions && questions.length === 4) test.questions = questions;
  if (passingMarks) test.passingMarks = passingMarks;

  await test.save();

  res.status(200).json({
    message: "Test updated successfully",
    test,
  });
});

// Delete a test
export const deleteTest = TryCatch(async (req, res) => {
  const { testId } = req.params;

  const test = await Test.findById(testId);
  
  if (!test) {
    return res.status(404).json({
      message: "Test not found",
    });
  }

  await test.deleteOne();

  res.status(200).json({
    message: "Test deleted successfully",
  });
});

// Submit test and check for certificate eligibility
export const submitTest = TryCatch(async (req, res) => {
  const { testId } = req.params;
  const { answers } = req.body;

  // Find the test
  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({
      message: "Test not found",
    });
  }

  // Get the lecture
  const lecture = await Lecture.findById(test.lecture);
  if (!lecture) {
    return res.status(404).json({
      message: "Lecture not found",
    });
  }

  // Get the course
  const course = await Courses.findById(lecture.course);
  if (!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  // Check if answers are provided for all questions
  if (!answers || answers.length !== test.questions.length) {
    return res.status(400).json({
      message: "Please answer all questions",
    });
  }

  // Calculate score
  let score = 0;
  for (let i = 0; i < test.questions.length; i++) {
    if (answers[i] === test.questions[i].correctAnswer) {
      score++;
    }
  }

  // Check if user passed the test
  const passed = score >= test.passingMarks;

  // If passed, generate certificate
  let certificate = null;
  if (passed) {
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: req.user._id,
      test: test._id,
    });

    if (existingCertificate) {
      certificate = existingCertificate;
    } else {
      // Create a new certificate
      certificate = await Certificate.create({
        user: req.user._id,
        lecture: lecture._id,
        course: course._id,
        test: test._id,
        score,
        certificateId: uuidv4(),
      });
    }
  }

  res.status(200).json({
    score,
    totalQuestions: test.questions.length,
    passingMarks: test.passingMarks,
    passed,
    certificate: passed ? certificate : null,
  });
});

// Get all certificates for a user
export const getUserCertificates = TryCatch(async (req, res) => {
  const certificates = await Certificate.find({ user: req.user._id })
    .populate("course", "title")
    .populate("lecture", "title");

  res.status(200).json({
    certificates,
  });
});

// Get a specific certificate by ID
export const getCertificate = TryCatch(async (req, res) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({ certificateId })
    .populate("user", "name email")
    .populate("course", "title")
    .populate("lecture", "title")
    .populate("test", "questions");

  if (!certificate) {
    return res.status(404).json({
      message: "Certificate not found",
    });
  }

  res.status(200).json({
    certificate,
  });
}); 