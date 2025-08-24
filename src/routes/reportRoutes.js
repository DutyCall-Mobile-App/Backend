import express from "express";
import {
  createReportController,
  getAllReportsController,
  getReportByIdController,
} from "../controllers/reportController.js";

const router = express.Router();

// Create report route
router.post("/create", createReportController); // Reverted to /create

// Get all reports
router.get("/", getAllReportsController);

// Get single report by ID
router.get("/:id", getReportByIdController);

export default router;
