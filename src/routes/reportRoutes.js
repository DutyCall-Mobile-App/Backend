import express from "express";
import {
  createReportController,
  getAllReportsController,
  getReportByIdController,
  updateReportController,
  deleteReportController,
  updateReportStatusController,
} from "../controllers/reportController.js";

const router = express.Router();

// Create report route
router.post("/create", createReportController); // Reverted to /create

// Get all reports
router.get("/", getAllReportsController);

// Get single report by ID
router.get("/:id", getReportByIdController);

// Update report by ID
router.put("/:id", updateReportController);

// Delete report by ID
router.delete("/:id", deleteReportController);

router.put("/:id/status", updateReportStatusController);

export default router;
