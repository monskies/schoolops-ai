const OpenAI = require("openai");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");


async function generateSchoolSummary() {
  const [attendance, grades] = await Promise.all([
    Attendance.find().populate("student", "firstName lastName gradeLevel").lean(),
    Grade.find().populate("student", "firstName lastName gradeLevel").lean()
  ]);

  const cleanAttendance = attendance
    .filter((record) => record.student)
    .slice(-50)
    .map((record) => ({
      student: `${record.student.firstName} ${record.student.lastName}`,
      gradeLevel: record.student.gradeLevel,
      status: record.status,
      date: record.date
    }));

  const cleanGrades = grades
    .filter((grade) => grade.student)
    .slice(-50)
    .map((grade) => ({
      student: `${grade.student.firstName} ${grade.student.lastName}`,
      gradeLevel: grade.student.gradeLevel,
      subject: grade.subject,
      score: grade.score,
      term: grade.term
    }));

    if (!process.env.OPENAI_API_KEY) {
    return {
        summary: "AI summary is not configured yet. Add OPENAI_API_KEY to enable this feature."
    };
    }

    const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You summarize school attendance and grade data for staff. Be concise, practical, and avoid making unsupported claims."
      },
      {
        role: "user",
        content: JSON.stringify({
          attendance: cleanAttendance,
          grades: cleanGrades
        })
      }
    ]
  });

  return {
    summary: response.output_text
  };
}

module.exports = { generateSchoolSummary };