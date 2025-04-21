import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  createTest,
  getTest,
  updateTest,
  deleteTest,
  submitTest,
  getUserCertificates,
  getCertificate,
} from "../controllers/testController.js";

const router = express.Router();

// Test routes
router.get("/test-route-check", (req, res) => {
  res.status(200).json({ message: "Test routes working properly" });
});

router.post("/lecture/:lectureId/test", isAuth, isAdmin, createTest);
router.get("/lecture/:lectureId/test", isAuth, getTest);
router.put("/lecture/:lectureId/test", isAuth, isAdmin, updateTest);
router.delete("/test/:testId", isAuth, isAdmin, deleteTest);
router.post("/test/:testId/submit", isAuth, submitTest);

// Certificate routes
router.get("/certificates", isAuth, getUserCertificates);
router.get("/certificate/:certificateId", getCertificate);

export default router; 