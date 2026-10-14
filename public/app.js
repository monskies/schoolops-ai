let authToken = localStorage.getItem("authToken");
let editingStudentId = null;

const metricElements = {
  activeStudents: document.querySelector("#activeStudents"),
  attendanceRate: document.querySelector("#attendanceRate"),
  averageGrade: document.querySelector("#averageGrade"),
  totalGrades: document.querySelector("#totalGrades")
};

const loginForm = document.querySelector("#loginForm");
const loginPanel = document.querySelector("#loginPanel");
const studentList = document.querySelector("#studentList");
const studentForm = document.querySelector("#studentForm");
const automationOutput = document.querySelector("#automationOutput");
const attendanceForm = document.querySelector("#attendanceForm");
const attendanceStudent = document.querySelector("#attendanceStudent");
const gradeForm = document.querySelector("#gradeForm");
const gradeStudent = document.querySelector("#gradeStudent");
const attendanceList = document.querySelector("#attendanceList");
const gradeList = document.querySelector("#gradeList");
const logoutButton = document.querySelector("#logoutButton");
const currentUser = document.querySelector("#currentUser");
const studentSubmitButton = document.querySelector("#studentSubmitButton");

updateAuthUI();

function updateAuthUI() {
  if (!loginPanel || !logoutButton) return;

  if (authToken) {
    loginPanel.style.display = "none";
    logoutButton.style.display = "inline-flex";
  } else {
    loginPanel.style.display = "block";
    logoutButton.style.display = "none";
  }

  loadCurrentUser();
}

async function loadCurrentUser() {
  if (!authToken || !currentUser) {
    if (currentUser) currentUser.textContent = "";
    return;
  }

  try {
    const user = await api("/api/auth/me");
    currentUser.textContent = `${user.role}: ${user.email}`;
  } catch (error) {
    authToken = null;
    localStorage.removeItem("authToken");
    updateAuthUI();
  }
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body;
}

function showError(error) {
  automationOutput.textContent = `Error: ${error.message}`;
}

async function loadDashboard() {
  const metrics = await api("/api/dashboard");
  metricElements.activeStudents.textContent = metrics.activeStudents;
  metricElements.attendanceRate.textContent = `${metrics.attendanceRate}%`;
  metricElements.averageGrade.textContent = `${metrics.averageGrade}%`;
  metricElements.totalGrades.textContent = metrics.totalGrades;
}

async function loadStudents() {
  const students = await api("/api/students");

  studentList.innerHTML = "";

  if (attendanceStudent) {
    attendanceStudent.innerHTML = '<option value="">Select student</option>';
  }

  if (gradeStudent) {
    gradeStudent.innerHTML = '<option value="">Select student</option>';
  }

  if (!students.length) {
    studentList.innerHTML = "<p>No students yet. Add one to start the demo.</p>";
    return;
  }

  students.forEach((student) => {
    const row = document.createElement("article");
    row.className = "student-row";
    row.innerHTML = `
      <div>
        <strong>${student.firstName} ${student.lastName}</strong>
        <span>Grade ${student.gradeLevel}</span>
      </div>
      <span>${student.guardianEmail || "No guardian email"}</span>
      <div class="row-actions">
        <button class="edit-button" type="button" data-id="${student._id}">Edit</button>
        <button class="delete-button" type="button" data-id="${student._id}">Delete</button>
      </div>
    `;
    studentList.appendChild(row);

    if (attendanceStudent) {
      const option = document.createElement("option");
      option.value = student._id;
      option.textContent = `${student.firstName} ${student.lastName}`;
      attendanceStudent.appendChild(option);
    }

    if (gradeStudent) {
      const option = document.createElement("option");
      option.value = student._id;
      option.textContent = `${student.firstName} ${student.lastName}`;
      gradeStudent.appendChild(option);
    }
  });
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const confirmed = confirm("Delete this student? This cannot be undone.");

      if (!confirmed) return;

      try {
        await api(`/api/students/${button.dataset.id}`, {
          method: "DELETE"
        });

        await refresh();
      } catch (error) {
        showError(error);
      }
    });
  });
  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", () => {
      const student = students.find((item) => item._id === button.dataset.id);

      if (!student) return;

      editingStudentId = student._id;

      studentForm.firstName.value = student.firstName;
      studentForm.lastName.value = student.lastName;
      studentForm.gradeLevel.value = student.gradeLevel;
      studentForm.guardianEmail.value = student.guardianEmail || "";

      studentSubmitButton.textContent = "Save Student";
    });
  });
}

async function loadAttendance() {
  if (!attendanceList) return;

  const records = await api("/api/attendance");
  attendanceList.innerHTML = "";

  if (!records.length) {
    attendanceList.innerHTML = "<p>No attendance records yet.</p>";
    return;
  }

  records.filter((record) => record.student).slice(0, 5).forEach((record) => {
    const row = document.createElement("article");
    row.className = "student-row";

    const date = new Date(record.date).toLocaleDateString();

    row.innerHTML = `
      <div>
        <strong>${record.student.firstName} ${record.student.lastName}</strong>
        <span>${date}</span>
      </div>

      <select class="attendance-status" data-id="${record._id}">
        <option value="present" ${record.status === "present" ? "selected" : ""}>Present</option>
        <option value="absent" ${record.status === "absent" ? "selected" : ""}>Absent</option>
        <option value="late" ${record.status === "late" ? "selected" : ""}>Late</option>
        <option value="excused" ${record.status === "excused" ? "selected" : ""}>Excused</option>
      </select>
    `;

    attendanceList.appendChild(row);
  });

  document.querySelectorAll(".attendance-status").forEach((select) => {
    select.addEventListener("change", async () => {
      try {
        await api(`/api/attendance/${select.dataset.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: select.value
          })
        });

        await refresh();
      } catch (error) {
        showError(error);
      }
    });
  });
}

async function loadGrades() {
  if (!gradeList) return;

  const grades = await api("/api/grades");
  gradeList.innerHTML = "";

  if (!grades.length) {
    gradeList.innerHTML = "<p>No grades yet.</p>";
    return;
  }

  grades.filter((grade) => grade.student).slice(0, 5).forEach((grade) => {
    const row = document.createElement("article");
    row.className = "student-row";

    row.innerHTML = `
      <div>
        <strong>${grade.student.firstName} ${grade.student.lastName}</strong>
        <span>${grade.subject} - ${grade.term}</span>
      </div>
      <span>${grade.score}%</span>
    `;

    gradeList.appendChild(row);
  });
}

async function refresh() {
  try {
    await Promise.all([
      loadDashboard(),
      loadStudents(),
      loadAttendance(),
      loadGrades()
    ]);
  } catch (error) {
    showError(error);
  }
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    authToken = result.token;
    localStorage.setItem("authToken", authToken);
    loginForm.reset();
    updateAuthUI();

    await refresh();
  } catch (error) {
    showError(error);
  }
});

logoutButton?.addEventListener("click", () => {
  authToken = null;
  localStorage.removeItem("authToken");
  loginForm?.reset();
  updateAuthUI();

  studentList.innerHTML = "";
  attendanceStudent.innerHTML = '<option value="">Login required</option>';

  if (typeof attendanceList !== "undefined" && attendanceList) {
    attendanceList.innerHTML = "";
  }

  if (typeof gradeList !== "undefined" && gradeList) {
    gradeList.innerHTML = "";
  }

  if (currentUser) {
    currentUser.textContent = "";
  }

  automationOutput.textContent = "Logged out.";
});

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(studentForm);
  const payload = Object.fromEntries(formData.entries());
  payload.gradeLevel = Number(payload.gradeLevel);

  try {
    const path = editingStudentId
      ? `/api/students/${editingStudentId}`
      : "/api/students";

    const method = editingStudentId ? "PATCH" : "POST";

    await api(path, {
      method,
      body: JSON.stringify(payload)
    });

    editingStudentId = null;
    studentSubmitButton.textContent = "Add Student";
    studentForm.reset();
    await refresh();
  } catch (error) {
    showError(error);
  }
});

attendanceForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(attendanceForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await api("/api/attendance", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    attendanceForm.reset();
    await refresh();
  } catch (error) {
    showError(error);
  }
});

gradeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(gradeForm);
  const payload = Object.fromEntries(formData.entries());

  payload.score = Number(payload.score);

  try {
    await api("/api/grades", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    gradeForm.reset();
    await refresh();
  } catch (error) {
    showError(error);
  }
});


document.querySelector("#refreshButton").addEventListener("click", refresh);

document.querySelector("#reportButton").addEventListener("click", async () => {
  try {
    const report = await api("/api/automations/attendance-report", {
      method: "POST",
      body: JSON.stringify({})
    });

    automationOutput.innerHTML = `
    Generated ${report.recordCount} attendance records.

    <a href="/reports/${report.fileName}" download>Download CSV Report</a>
    `;
  } catch (error) {
    showError(error);
  }
});

document.querySelector("#emailButton").addEventListener("click", async () => {
  try {
    const result = await api("/api/automations/email-summary", {
      method: "POST",
      body: JSON.stringify({})
    });
    automationOutput.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    showError(error);
  }
});

refresh();
