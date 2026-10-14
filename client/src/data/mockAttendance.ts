export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type AttendanceRecord = {
  studentId: string;
  status: AttendanceStatus;
  note: string;
};

type MockAttendanceStudent = {
  _id: string;
};

export function createAttendanceRecords(
  students: MockAttendanceStudent[]
): AttendanceRecord[] {
  return students.map((student, index) => ({
    studentId: student._id,
    status: index === 2 ? "late" : "present",
    note: ""
  }));
}