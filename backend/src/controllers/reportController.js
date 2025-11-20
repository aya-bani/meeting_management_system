// backend/src/controllers/reportController.js
import Report from "../models/Report.js";

// @desc Get reports (optionally by status)
export const getReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const reports = await Report.find(filter)
      .populate("component")
      .populate("room")
      .populate("reportedBy", "name email");
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create report (HR only)
export const createReport = async (req, res) => {
  try {
    const reportData = { ...req.body, reportedBy: req.user._id };
    const report = await Report.create(reportData);
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc Update report status (Admin)
export const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
