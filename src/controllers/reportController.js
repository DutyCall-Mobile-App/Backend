// reportController.js
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
  getAllReportsForPolice,
  assignReportToOfficer,
  getReportByIdForPolice,
  updateReportStatusWithHistory,
  updateReportPriorityWithHistory,
} from "../services/reportService.js";

import { notifyNewReport } from "./notificationController.js";
import Report from "../models/reportModel.js"; // Add this import at the top
import User from "../models/User.js";

// Create a new report
export const createReportController = async (req, res) => {
  try {
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
      user: req.user._id, // associate report with logged-in user
    };

    const report = await createReport(data);

    // Trigger notification after report is created
    await notifyNewReport(report);

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

// Get all reports for logged-in user
export const getAllReportsController = async (req, res) => {
  try {
    const reports = await getAllReports({ user: req.user._id }); // user-specific
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

// Get single report by ID (only if it belongs to logged-in user)
export const getReportByIdController = async (req, res) => {
  try {
    const report = await getReportById(req.params.id);

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to view this report",
      });
    }

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

// Update report (only if it belongs to logged-in user)
export const updateReportController = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getReportById(id);

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to update this report",
      });
    }

    const updatedReport = await updateReport(id, req.body);

    res.status(200).json({
      success: true,
      data: updatedReport,
      message: "Report updated successfully",
    });
  } catch (error) {
    const status = error.message === "Report not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete report (only if it belongs to logged-in user)
export const deleteReportController = async (req, res) => {
  try {
    const report = await getReportById(req.params.id);

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this report",
      });
    }

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

// Update report status (optional: could be admin-only)
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
      status: { $ne: "Resolved" },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: priorityReports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAllRecentReportsController = async (req, res) => {
  try {
    const recentReports = await Report.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: recentReports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getReportStatsController = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      pending: 0,
      inProgress: 0,
      resolved: 0,
    };

    stats.forEach((stat) => {
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
      data: formattedStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//report controller for police to get all reports with assigned info
export const getAllReportsForPoliceController = async (req, res) => {
  try {
    // Pass officer ID so service can enrich with assignment status
    const reports = await getAllReportsForPolice(req.user._id);
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//controller to assign report to logged in police officer
export const assignReportToMEController = async (req, res) => {
  try {
    const updated = await assignReportToOfficer(
      req.params.id,
      req.user._id,
      req.user._id
    ); // assignedBy = current officer
    res.json({
      success: true,
      data: updated,
      message: "Report assigned to you successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

//controller to get single report by id for police with assigned info
export const getReportByIdForPoliceController = async (req, res) => {
  try {
    const report = await getReportByIdForPolice(req.params.id);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    const status = error.message === "Report not found" ? 404 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
};

//update report fields like priority or status by police
export const updateReportFieldsForPoliceController = async (req, res) => {
  try {
    const { priority, status, assignedTo } = req.body;
    const updateData = {};
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const updated = await Report.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("assignedTo", "name");

    if (!updated) throw new Error("Report not found");
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Controller: Get report timeline for police
// Controller: Get report timeline for police (safe version)
export const getReportTimelineForPoliceController = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("user", "name")
      .populate("assignedTo", "name")
      .populate("statusHistory.changedBy", "name")
      .populate("priorityHistory.changedBy", "name")
      .populate("assignmentHistory.assignedTo", "name")
      .populate("assignmentHistory.assignedBy", "name");

    if (!report) throw new Error("Report not found");

    const timeline = [];

    // Add creation event
    timeline.push({
      type: "created",
      message: `Report created by ${report.user?.name || "Anonymous"}`,
      timestamp: report.createdAt,
      officer: report.user?.name || "Anonymous",
    });

    // ✅ Safely iterate optional arrays
    (report.statusHistory || []).forEach((entry) => {
      timeline.push({
        type: "status",
        message: `Status changed to "${entry.status}"`,
        timestamp: entry.timestamp,
        officer: entry.changedBy?.name || "Officer",
      });
    });

    (report.priorityHistory || []).forEach((entry) => {
      timeline.push({
        type: "priority",
        message: `Priority set to "${entry.priority}"`,
        timestamp: entry.timestamp,
        officer: entry.changedBy?.name || "Officer",
      });
    });

    (report.assignmentHistory || []).forEach((entry) => {
      timeline.push({
        type: "assigned",
        message: `Assigned to ${entry.assignedTo?.name || "Unassigned"}`,
        timestamp: entry.timestamp,
        officer: entry.assignedBy?.name || "Officer",
      });
    });

    (report.notes || []).forEach((note) => {
      timeline.push({
        type: "note",
        message: `Note added: "${note.title || note.content || ""}"`,
        timestamp: note.timestamp,
        officer: note.officer || "Officer",
      });
    });

    // Sort newest first
    timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    console.error("Timeline fetch error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// New controller: Update status with history (police-only)
export const updateReportStatusForPoliceController = async (req, res) => {
  try {
    const updated = await updateReportStatusWithHistory(
      req.params.id,
      req.body.status,
      req.user._id
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// New controller: Update priority with history (police-only)
export const updateReportPriorityForPoliceController = async (req, res) => {
  try {
    const updated = await updateReportPriorityWithHistory(
      req.params.id,
      req.body.priority,
      req.user._id
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
export const addNoteToReportForPoliceController = async (req, res) => {
  try {
    const { note } = req.body;
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: note } },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
