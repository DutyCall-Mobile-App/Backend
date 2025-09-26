//route
// Updated routes (added multer for file uploads)
import express from "express";
import multer from "multer";
import path from "path";
import {
  createReportController,
  getAllReportsController,
  getReportByIdController,
  updateReportController,
  deleteReportController,
  updateReportStatusController,
} from "../controllers/reportController.js";
const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"), false);
    }
  },
});
// Create report route
router.post("/create", upload.array("evidence", 10), createReportController);
// Get all reports
router.get("/", getAllReportsController);
// Get single report by ID
router.get("/:id", getReportByIdController);


// Update report by ID
router.put("/:id", updateReportController);

// Delete report by ID
router.delete("/:id", deleteReportController);

router.put("/:id/status", updateReportStatusController);

router.put("/:id/status", updateReportStatusController);


export default router;
