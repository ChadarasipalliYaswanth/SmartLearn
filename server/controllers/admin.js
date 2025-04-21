import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";

export const createCourse = TryCatch(async (req, res) => {
  try {
    console.log("Request received for creating course");
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);
    
    const { title, description, category, createdBy, duration } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image for the course",
      });
    }

    const image = req.file;
    console.log("Image file:", image);

    const course = await Courses.create({
      title,
      description,
      category,
      createdBy,
      image: image.path,
      duration,
    });

    console.log("Course created successfully:", course);
    res.status(201).json({
      message: "Course Created Successfully",
      course,
    });
  } catch (error) {
    console.error("Course creation error:", error);
    res.status(500).json({
      message: "Failed to create course: " + error.message
    });
  }
});

export const addLectures = TryCatch(async (req, res) => {
  try {
    console.log("Request received for adding lecture");
    console.log("Request files:", req.files);
    console.log("Request body:", req.body);
    
    const course = await Courses.findById(req.params.id);

    if (!course)
      return res.status(404).json({
        message: "No Course with this id",
      });

    const { title, description } = req.body;

    // Check if req.files is available
    if (!req.files || !req.files.video) {
      console.log("No video file found in request");
      return res.status(400).json({
        message: "Please upload a video file",
      });
    }

    const videoFile = req.files.video[0];
    console.log("Video file:", videoFile);
    
    const notesFile = req.files.notes ? req.files.notes[0] : null;
    if (notesFile) {
      console.log("Notes file:", notesFile);
    }

    try {
      const lecture = await Lecture.create({
        title,
        description,
        video: videoFile.path,
        notes: notesFile ? notesFile.path : "",
        course: course._id,
      });

      console.log("Lecture created successfully:", lecture);
      res.status(201).json({
        message: "Lecture Added",
        lecture,
      });
    } catch (error) {
      console.error("Lecture creation error:", error);
      res.status(500).json({
        message: "Failed to create lecture: " + error.message
      });
    }
  } catch (error) {
    console.error("Unexpected error in addLectures:", error);
    res.status(500).json({
      message: "Server error: " + error.message
    });
  }
});

export const deleteLecture = TryCatch(async (req, res) => {
  const { id } = req.params;
  
  const lecture = await Lecture.findById(id);
  
  if (!lecture)
    return res.status(404).json({
      message: "Lecture not found",
    });

  if (lecture.video) {
    try {
      await unlinkAsync(lecture.video);
      console.log("video deleted");
    } catch (error) {
      console.log("Error deleting video:", error);
    }
  }
  
  if (lecture.notes) {
    try {
      await unlinkAsync(lecture.notes);
      console.log("notes deleted");
    } catch (error) {
      console.log("Error deleting notes:", error);
    }
  }

  await lecture.deleteOne();

  res.status(200).json({
    message: "Lecture deleted successfully",
  });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      if (lecture.video) {
        try {
          await unlinkAsync(lecture.video);
          console.log("video deleted");
        } catch (error) {
          console.log("Error deleting video:", error);
        }
      }
      
      if (lecture.notes) {
        try {
          await unlinkAsync(lecture.notes);
          console.log("notes deleted");
        } catch (error) {
          console.log("Error deleting notes:", error);
        }
      }
    })
  );

  if (course.image) {
    try {
      await unlinkAsync(course.image);
      console.log("image deleted");
    } catch (error) {
      console.log("Error deleting image:", error);
    }
  }

  await Lecture.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCoures = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCoures,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  if (req.user.mainrole !== "superadmin")
    return res.status(403).json({
      message: "This endpoint is assign to superadmin",
    });
  const user = await User.findById(req.params.id);

  if (user.role === "user") {
    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (user.role === "admin") {
    user.role = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated",
    });
  }
});

export const addLectureNotes = TryCatch(async (req, res) => {
  const { lectureId } = req.params;
  
  const lecture = await Lecture.findById(lectureId);
  
  if (!lecture)
    return res.status(404).json({
      message: "No Lecture with this id",
    });

  const notesFile = req.file;
  
  if (!notesFile) {
    return res.status(400).json({
      message: "Please upload a notes file",
    });
  }

  try {
    // If there are existing notes, delete them
    if (lecture.notes) {
      try {
        await unlinkAsync(lecture.notes);
      } catch (error) {
        console.log("Error deleting previous notes:", error);
      }
    }

    // Update lecture with new notes
    lecture.notes = notesFile.path;
    await lecture.save();

    res.status(200).json({
      message: "Notes Added Successfully",
      lecture,
    });
  } catch (error) {
    console.error("Notes update error:", error);
    res.status(500).json({
      message: "Failed to update notes: " + error.message
    });
  }
});
