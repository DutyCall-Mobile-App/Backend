// Updated controller (added file handling with multer)
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
} from "../services/reportService.js";
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
    };
    const report = await createReport(data);
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
