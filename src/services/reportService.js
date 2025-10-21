import Report from "../models/reportModel.js";

// Create a new report
export const createReport = async (reportData) => {
  const { category, location, description } = reportData;

  if (!category || !location || !description) {
    throw new Error(
      "Please provide all required fields: category, location, description"
    );
  }
  if (!location.latitude || !location.longitude) {
    throw new Error("Please provide both latitude and longitude");
  }

  const report = new Report(reportData);
  await report.save();
  return report;
};

// Get all reports for a specific user
export const getAllReports = async (filter = {}) => {
  try {
    const reports = await Report.find(filter).sort({ createdAt: -1 });
    return reports;
  } catch (error) {
    throw new Error("Error fetching reports: " + error.message);
  }
};

// Get report by ID
export const getReportById = async (id) => {
  const report = await Report.findById(id);
  if (!report) throw new Error("Report not found");
  return report;
};

// Update report
export const updateReport = async (id, updateData) => {
  const updatedReport = await Report.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedReport) throw new Error("Report not found");
  return updatedReport;
};

// Delete report
export const deleteReport = async (id) => {
  const deletedReport = await Report.findByIdAndDelete(id);
  if (!deletedReport) throw new Error("Report not found");
  return deletedReport;
};

// Update report status
export const updateReportStatus = async (id, status) => {
  const updatedReport = await Report.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!updatedReport) throw new Error("Report not found");
  return updatedReport;
};

//feth all reports for police with assigned info
export const getAllReportsForPolice = async (officerId) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("user", "name badgeNumber district") //reporter info
      .populate("assignedTo", "name"); //assigned officer info

    // Enrich reports with officer assignment info
    return reports.map((report) => {
      const isAssigned =
        report.assignedTo &&
        report.assignedTo._id.toString() === officerId.toString();
      return {
        ...report.toObject(),
        assignedOfficer: report.assignedTo ? report.assignedTo._id : null,
        assignedOfficerName: report.assignedTo ? report.assignedTo.name : null,
        assignedOfficerIda: report.assignedTo ? report.assignedTo._id : null,
        assignedToMe: isAssigned, //frontend can use this
      };
    });
  } catch (error) {
    throw new Error(
      "Error fetching reports for police from service: " + error.message
    );
  }
};

// Assign report to the logged-in police officer
export const assignReportToOfficer = async (reportId, officerId) => {
  return await Report.findByIdAndUpdate(
    reportId,
    { assignedTo: officerId, assignedAt: Date.now() },
    { new: true }
  );
};

// get report by id for police ( with populated assignedTo and user info)
export const getReportByIdForPolice = async (id) => {
  const report = await Report.findById(id)
    .populate("user", "name badgeNumber district") //reporter info
    .populate("assignedTo", "name"); //assigned officer info
  if (!report) throw new Error("Report not found");
  return report;
};

// Backend/src/services/reportService.js

// Update status with history
export const updateReportStatusWithHistory = async (
  id,
  newStatus,
  officerId
) => {
  const report = await Report.findById(id);
  if (!report) throw new Error("Report not found");

  // Push to status history
  report.statusHistory.push({
    status: newStatus,
    changedBy: officerId,
    timestamp: new Date(),
  });

  report.status = newStatus;
  await report.save();
  return report;
};

// Update priority with history
export const updateReportPriorityWithHistory = async (
  id,
  newPriority,
  officerId
) => {
  const report = await Report.findById(id);
  if (!report) throw new Error("Report not found");

  report.priorityHistory.push({
    priority: newPriority,
    changedBy: officerId,
    timestamp: new Date(),
  });

  report.priority = newPriority;
  await report.save();
  return report;
};

// Assign officer with history
export const assignReportToOfficerWithHistory = async (
  reportId,
  officerId,
  assignedBy
) => {
  const report = await Report.findByIdAndUpdate(
    reportId,
    {
      assignedTo: officerId,
      assignedAt: new Date(),
      $push: {
        assignmentHistory: {
          assignedTo: officerId,
          assignedBy: assignedBy,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  ).populate("assignedTo", "name");

  if (!report) throw new Error("Report not found");
  return report;
};

export default {
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
  assignReportToOfficerWithHistory,
};
