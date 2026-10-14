const express = require("express");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [studentCount, attendanceRecords, gradeStats] = await Promise.all([
      Student.countDocuments({ status: "active" }),
      Attendance.find().lean(),
      Grade.aggregate([
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$score" },
            totalGrades: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((record) => record.status === "present").length;
    const attendanceRate = totalAttendance ? Math.round((presentCount / totalAttendance) * 100) : 0;

    res.json({
      activeStudents: studentCount,
      attendanceRate,
      totalAttendanceRecords: totalAttendance,
      averageGrade: Math.round(gradeStats[0]?.averageScore || 0),
      totalGrades: gradeStats[0]?.totalGrades || 0
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
