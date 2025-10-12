// Updated controller (added file handling with multer)
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
} from "../services/reportService.js";

import { notifyNewReport  } from "./notificationController.js";
import Report from "../models/reportModel.js";  // Add this import at the top

export const createReportController = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    console.log("Received files:", req.files);
    const {
      latitude,
      longitude,
      address,
      description,
      full_name,
      nic,
      contact_number,
      category,
      priority,
    } = req.body;
    const location = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address || "",
    };
    const evidence = req.files
      ? req.files.map((file) => ({
          fileUrl: `/uploads/${file.filename}`,
          fileType: file.mimetype.startsWith("image/") ? "image" : "video",
        }))
      : [];
    const data = {
      category,
      location,
      description,
      evidence,
      full_name: full_name || "",
      nic: nic || "",
      contact_number: contact_number ? Number(contact_number) : undefined,
      priority: priority || "Medium",
    };
    const report = await createReport(data);

    await notifyNewReport(report); //Trigger notifiction after report is created

    res.status(201).json({
      success: true,
      data: report,
      message: "Report created successfully",
    });

  } catch (error) {
    console.error("Error in createReportController:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAllReportsController = async (req, res) => {
  try {
    const reports = await getAllReports();
    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
export const getReportByIdController = async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    const status = error.message === "Report not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateReportController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Call your service / model function
    const updatedReport = await updateReport(id, updateData);

    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedReport,
      message: "Report updated successfully",
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the report",
      error: error.message,
    });
  }
};

export const deleteReportController = async (req, res) => {
  try {
    await deleteReport(req.params.id);
    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    const status = error.message === "Report not found" ? 404 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
};

export const updateReportStatusController = async (req, res) => {
  try {
    const updatedReport = await updateReportStatus(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      success: true,
      data: updatedReport,
      message: "Report status updated successfully",
    });
  } catch (error) {
    const status = error.message === "Report not found" ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
};

export const getAllPriorityReportsController = async (req, res) => {
  try {
    const priorityReports = await Report.find({ 
      priority: "HIGH",
      status: { $ne: "Resolved" } 
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      data: priorityReports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getAllRecentReportsController = async (req, res) => {
  try {
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: recentReports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getReportStatsController = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      inProgress: 0,
      resolved: 0
    };

    stats.forEach(stat => {
      if (stat._id === "Submitted" || stat._id === "Under Review") {
        formattedStats.pending += stat.count;
      } else if (stat._id === "In Progress" || stat._id === "Action Taken") {
        formattedStats.inProgress += stat.count;
      } else if (stat._id === "Resolved") {
        formattedStats.resolved = stat.count;
      }
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
