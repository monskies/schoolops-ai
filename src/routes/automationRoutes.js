const express = require("express");
const { generateAttendanceReport } = require("../services/reportService");
const { sendAttendanceSummary } = require("../services/emailService");
const { generateSchoolSummary } = require("../services/aiSummaryService");

const router = express.Router();

router.post("/attendance-report", async (req, res, next) => {
  try {
    const report = await generateAttendanceReport(req.body);
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

router.post("/email-summary", async (req, res, next) => {
  try {
    const result = await sendAttendanceSummary(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/ai-summary", async (req, res, next) => {
  try {
    const result = await generateSchoolSummary();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
