const express = require("express");
const Grade = require("../models/Grade");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.subject) filter.subject = req.query.subject;

    const grades = await Grade.find(filter)
      .populate("student", "firstName lastName gradeLevel")
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const grade = await Grade.create(req.body);
    const populated = await grade.populate("student", "firstName lastName gradeLevel");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("student", "firstName lastName gradeLevel");

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    res.json(grade);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
