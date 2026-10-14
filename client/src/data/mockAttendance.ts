import type { Student } from "./mockStudents";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type AttendanceRecord = {
  studentId: string;
  status: AttendanceStatus;
  note: string;
};

export function createAttendanceRecords(students: Student[]): AttendanceRecord[] {
  return students.map((student, index) => ({
    studentId: student.id,
    status: index === 2 ? "late" : "present",
    note: ""
  }));
}