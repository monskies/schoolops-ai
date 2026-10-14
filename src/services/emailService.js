const nodemailer = require("nodemailer");
const Attendance = require("../models/Attendance");

async function sendAttendanceSummary({ date = new Date().toISOString().slice(0, 10), to } = {}) {
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);

  const records = await Attendance.find({
    date: { $gte: start, $lt: end }
  })
    .populate("student", "firstName lastName gradeLevel")
    .lean();

  const counts = records.reduce(
    (summary, record) => {
      summary[record.status] += 1;
      return summary;
    },
    { present: 0, absent: 0, late: 0, excused: 0 }
  );

  const text = [
    `Attendance summary for ${date}`,
    `Present: ${counts.present}`,
    `Absent: ${counts.absent}`,
    `Late: ${counts.late}`,
    `Excused: ${counts.excused}`
  ].join("\n");

  if (!process.env.SMTP_HOST) {
    return {
      sent: false,
      previewOnly: true,
      message: "SMTP settings are not configured. Returning preview text instead.",
      text
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: to || process.env.REPORT_TO,
    subject: `Attendance summary for ${date}`,
    text
  });

  return {
    sent: true,
    messageId: info.messageId
  };
}

module.exports = { sendAttendanceSummary };
