import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Progress } from "../models/Progress.js";

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({ courses });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  res.json({ course });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });
  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const courses = await Courses.find({ _id: { $in: user.subscription } });
  res.json({ courses });
});

export const enrollCourse = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (!user.subscription.includes(course._id)) {
    user.subscription.push(course._id);
    await Progress.create({
      course: course._id,
      completedLectures: [],
      user: req.user._id,
    });
    await user.save();
  }

  res.status(200).json({
    message: "Course enrolled successfully",
  });
});

export const addProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  const { lectureId } = req.query;
  if (!progress.completedLectures.includes(lectureId)) {
    progress.completedLectures.push(lectureId);
    await progress.save();
  }

  res.status(201).json({ message: "Progress updated" });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  if (!progress) return res.status(404).json({ message: "No progress found" });

  const allLectures = await Lecture.countDocuments({ course: req.query.course });
  const completedLectures = progress.completedLectures.length;
  const courseProgressPercentage = (completedLectures * 100) / allLectures;

  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress,
  });
});