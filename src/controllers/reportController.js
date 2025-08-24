import {
  createReport,
  getAllReports,
  getReportById,
} from "../services/reportService.js";

export const createReportController = async (req, res) => {
  try {
    const report = await createReport(req.body);
    res.status(201).json({
      success: true,
      data: report,
      message: "Report created successfully",
    });
  } catch (error) {
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
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedReport,
      message: "Report updated successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteReportController = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};