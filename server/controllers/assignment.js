import TryCatch from "../middlewares/TryCatch.js";
import { Assignment } from "../models/Assignment.js";
import { Courses } from "../models/Courses.js";
import { promisify } from "util";
import fs from "fs";

const unlinkAsync = promisify(fs.unlink);

// Admin: Create a new assignment
export const createAssignment = TryCatch(async (req, res) => {
  try {
    const { title, description, deadline, courseId } = req.body;

    // If courseId is provided, validate that the course exists
    if (courseId) {
      const course = await Courses.findById(courseId);
      if (!course) {
        return res.status(404).json({
          message: "Course not found"
        });
      }
    }

    // Create assignment
    const assignment = await Assignment.create({
      title,
      description,
      deadline,
      course: courseId || null // Make course optional
    });

    res.status(201).json({
      message: "Assignment created successfully",
      assignment
    });
  } catch (error) {
    console.error("Assignment creation error:", error);
    res.status(500).json({
      message: "Failed to create assignment: " + error.message
    });
  }
});

// Get all assignments (for the general assignments section)
export const getAllAssignments = TryCatch(async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate({
        path: 'submissions.user',
        select: 'name email'
      });
    
    res.status(200).json({
      assignments
    });
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    res.status(500).json({
      message: "Failed to fetch assignments: " + error.message
    });
  }
});

// Submit an assignment (student)
export const submitAssignment = TryCatch(async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file"
      });
    }
    
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found"
      });
    }
    
    // Check if deadline has passed
    if (new Date(assignment.deadline) < new Date()) {
      return res.status(400).json({
        message: "Deadline for this assignment has passed"
      });
    }
    
    // Check if student has already submitted
    const existingSubmissionIndex = assignment.submissions.findIndex(
      submission => submission.user.toString() === userId.toString()
    );
    
    if (existingSubmissionIndex !== -1) {
      // User has already submitted, return error
      return res.status(400).json({
        message: "You have already submitted this assignment. Only one submission is allowed."
      });
    }
    
    // Add new submission
    assignment.submissions.push({
      user: userId,
      file: req.file.path
    });
    
    await assignment.save();
    
    res.status(200).json({
      message: "Assignment submitted successfully"
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({
      message: "Failed to submit assignment: " + error.message
    });
  }
});

// Update an assignment (admin)
export const updateAssignment = TryCatch(async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { title, description, deadline, courseId } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found"
      });
    }

    // If courseId is provided, validate that the course exists
    if (courseId) {
      const course = await Courses.findById(courseId);
      if (!course) {
        return res.status(404).json({
          message: "Course not found"
        });
      }
      assignment.course = courseId;
    } else if (courseId === null) {
      assignment.course = null;
    }

    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (deadline) assignment.deadline = deadline;

    await assignment.save();

    res.status(200).json({
      message: "Assignment updated successfully",
      assignment
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({
      message: "Failed to update assignment: " + error.message
    });
  }
});

// Delete an assignment (admin)
export const deleteAssignment = TryCatch(async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found"
      });
    }
    
    // Delete all submission files
    for (const submission of assignment.submissions) {
      if (submission.file) {
        try {
          await unlinkAsync(submission.file);
          console.log(`Deleted submission file: ${submission.file}`);
        } catch (error) {
          console.error(`Error deleting submission file: ${submission.file}`, error);
        }
      }
    }
    
    await Assignment.findByIdAndDelete(assignmentId);
    
    res.status(200).json({
      message: "Assignment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({
      message: "Failed to delete assignment: " + error.message
    });
  }
});

// Grade a submission (admin)
export const gradeSubmission = TryCatch(async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { grade, feedback } = req.body;
    
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found"
      });
    }
    
    const submission = assignment.submissions.id(submissionId);
    
    if (!submission) {
      return res.status(404).json({
        message: "Submission not found"
      });
    }
    
    submission.grade = grade;
    submission.feedback = feedback || "";
    
    await assignment.save();
    
    res.status(200).json({
      message: "Submission graded successfully"
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    res.status(500).json({
      message: "Failed to grade submission: " + error.message
    });
  }
});

// Get assignments for a specific course
export const getCourseAssignments = TryCatch(async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Courses.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }
    
    const assignments = await Assignment.find({ course: courseId })
      .populate({
        path: 'submissions.user',
        select: 'name email'
      });
    
    res.status(200).json({
      assignments
    });
  } catch (error) {
    console.error("Error fetching course assignments:", error);
    res.status(500).json({
      message: "Failed to fetch assignments: " + error.message
    });
  }
});

// Get a specific assignment
export const getAssignment = TryCatch(async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId)
      .populate({
        path: 'submissions.user',
        select: 'name email'
      });
    
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found"
      });
    }
    
    res.status(200).json({
      assignment
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({
      message: "Failed to fetch assignment: " + error.message
    });
  }
});

// Get user submissions for a course
export const getUserSubmissions = TryCatch(async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    
    const assignments = await Assignment.find({ course: courseId });
    
    const submissions = assignments.map(assignment => {
      const userSubmission = assignment.submissions.find(
        submission => submission.user.toString() === userId.toString()
      );
      
      return {
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          deadline: assignment.deadline
        },
        submission: userSubmission || null
      };
    });
    
    res.status(200).json({
      submissions
    });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({
      message: "Failed to fetch submissions: " + error.message
    });
  }
}); 