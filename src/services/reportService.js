const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");
const Attendance = require("../models/Attendance");

async function generateAttendanceReport({ startDate, endDate, gradeLevel } = {}) {
  const filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const records = await Attendance.find(filter)
    .populate("student", "firstName lastName gradeLevel guardianEmail")
    .sort({ date: 1 })
    .lean();

  
  const filteredRecords = records.filter((record) => {
    if (!record.student) return false;
    if (!gradeLevel || gradeLevel === "all") return true;

    return String(record.student.gradeLevel) === String(gradeLevel);
  });

  const reportDir = path.join(process.cwd(), "reports");
  fs.mkdirSync(reportDir, { recursive: true });

  const fileName = `attendance-${Date.now()}.csv`;
  const filePath = path.join(reportDir, fileName);

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "date", title: "Date" },
      { id: "student", title: "Student" },
      { id: "gradeLevel", title: "Grade Level" },
      { id: "status", title: "Status" },
      { id: "note", title: "Note" }
    ]
  });

  await csvWriter.writeRecords(
    filteredRecords.map((record) => ({
        date: record.date.toISOString().slice(0, 10),
        student: `${record.student.firstName} ${record.student.lastName}`,
        gradeLevel: record.student.gradeLevel,
        status: record.status,
        note: record.note || ""
      }))
  );

  return {
    fileName,
    filePath,
    downloadUrl: `/reports/${fileName}`,
    recordCount: filteredRecords.length
  };
}

module.exports = { generateAttendanceReport };
