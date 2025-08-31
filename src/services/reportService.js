import Report from "../models/reportModel.js"; // Corrected to match model file name

export const createReport = async (reportData) => {
  try {
    // Validate required fields
    const { category, location, description } = reportData;

    if (!category || !location || !description) {
      throw new Error(
        "Please provide all required fields: category, location, description"
      );
    }

    if (!location.latitude || !location.longitude) {
      throw new Error("Please provide both latitude and longitude");
    }

    // Create new report
    const report = new Report(reportData);
    await report.save();

    return report;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAllReports = async () => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    return reports;
  } catch (error) {
    throw new Error("Error fetching reports: " + error.message);
  }
};

export const getReportById = async (id) => {
  try {
    const report = await Report.findById(id);
    if (!report) {
      throw new Error("Report not found");
    }
    return report;
  } catch (error) {
    if (error.message === "Report not found") {
      throw error;
    }
    throw new Error("Error fetching report: " + error.message);
  }
};

export const updateReport = async (id, updateData) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(
      id,   
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedReport) {
      throw new Error("Report not found");
    }
    return updatedReport;
  } catch (error) {
    if (error.message === "Report not found") {
      throw error;
    }
    throw new Error("Error updating report: " + error.message);
  }
};

export const deleteReport = async (id) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(id);
    if (!deletedReport) {
      throw new Error("Report not found");
    }
    return deletedReport;
  } catch (error) {
    if (error.message === "Report not found") {
      throw error;
    }
    throw new Error("Error deleting report: " + error.message);
  }
};

export const updateReportStatus = async (id, status) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      throw new Error("Report not found");
    }

    return updatedReport;
  } catch (error) {
    if (error.message === "Report not found") {
      throw error;
    }
    throw new Error("Error updating status: " + error.message);
  }
};
