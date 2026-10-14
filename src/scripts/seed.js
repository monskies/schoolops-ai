const dotenv = require("dotenv");
const { connectDatabase } = require("../services/database");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");

dotenv.config();

async function seed() {
  await connectDatabase();

  await Promise.all([
    Student.deleteMany({}),
    Attendance.deleteMany({}),
    Grade.deleteMany({})
  ]);

  const students = await Student.insertMany([
    {
      firstName: "Maya",
      lastName: "Santos",
      gradeLevel: 10,
      guardianEmail: "maya.guardian@example.com"
    },
    {
      firstName: "Leo",
      lastName: "Tan",
      gradeLevel: 11,
      guardianEmail: "leo.guardian@example.com"
    },
    {
      firstName: "Aisha",
      lastName: "Rahman",
      gradeLevel: 10,
      guardianEmail: "aisha.guardian@example.com"
    }
  ]);

  await Attendance.insertMany([
    { student: students[0]._id, date: new Date("2026-10-09"), status: "present" },
    { student: students[1]._id, date: new Date("2026-10-09"), status: "late", note: "Transport delay" },
    { student: students[2]._id, date: new Date("2026-10-09"), status: "absent", note: "Guardian notified" }
  ]);

  await Grade.insertMany([
    { student: students[0]._id, subject: "Mathematics", score: 91, term: "Q1" },
    { student: students[1]._id, subject: "Science", score: 84, term: "Q1" },
    { student: students[2]._id, subject: "English", score: 88, term: "Q1" }
  ]);

  console.log("Seed data created");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
