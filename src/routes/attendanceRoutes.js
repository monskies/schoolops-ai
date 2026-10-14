const express = require("express");
const Attendance = require("../models/Attendance");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.status) filter.status = req.query.status;

    const records = await Attendance.find(filter)
      .populate("student", "firstName lastName gradeLevel guardianEmail")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const record = await Attendance.create(req.body);
    const populated = await record.populate("student", "firstName lastName gradeLevel");
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Attendance already exists for this student and date" });
    }
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("student", "firstName lastName gradeLevel");

    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
