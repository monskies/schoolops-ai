const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDatabase } = require("./services/database");
const dashboardRoutes = require("./routes/dashboardRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const automationRoutes = require("./routes/automationRoutes");
const authRoutes = require("./routes/authRoutes");
const { requireAuth } = require("./middleware/auth");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/reports", express.static(path.join(process.cwd(), "reports")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "school-management-dashboard" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/students", requireAuth, studentRoutes);
app.use("/api/attendance", requireAuth, attendanceRoutes);
app.use("/api/grades", requireAuth, gradeRoutes);
app.use("/api/automations", requireAuth, automationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong"
  });
});

if (require.main === module) {
  connectDatabase().then(() => {
    app.listen(port, () => {
      console.log(`Dashboard running at http://localhost:${port}`);
    });
  });
}

module.exports = app;
