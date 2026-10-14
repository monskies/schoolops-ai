
export const endpoints = {
  auth: {
    login: "/api/auth/login",
    me: "/api/auth/me"
  },
  dashboard: "/api/dashboard",
  students: "/api/students",
  attendance: "/api/attendance",
  grades: "/api/grades",
  reports: {
    attendance: "/api/automations/attendance-report",
    emailSummary: "/api/automations/email-summary"
  },
  automations: {
    aiSummary: "/api/automations/ai-summary"
  }
};