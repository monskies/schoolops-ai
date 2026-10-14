export type Student = {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  gradeLevel: number;
  guardianEmail: string;
  status: "active" | "inactive";
};

export const mockStudents: Student[] = [
  {
    _id: "1",
    firstName: "Maya",
    lastName: "Santos",
    gradeLevel: 10,
    guardianEmail: "maya.guardian@example.com",
    status: "active"
  },
  {
    _id: "2",
    firstName: "Leo",
    lastName: "Tan",
    gradeLevel: 11,
    guardianEmail: "leo.guardian@example.com",
    status: "active"
  },
  {
    _id: "3",
    firstName: "Aisha",
    lastName: "Rahman",
    gradeLevel: 10,
    guardianEmail: "aisha.guardian@example.com",
    status: "active"
  },
  {
    _id: "4",
    firstName: "Noah",
    lastName: "Cruz",
    gradeLevel: 9,
    guardianEmail: "noah.guardian@example.com",
    status: "inactive"
  }
];