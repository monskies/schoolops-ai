export type GradeRecord = {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  term: string;
  feedback: string;
};

export const mockGrades: GradeRecord[] = [
  {
    id: "1",
    studentId: "1",
    subject: "Mathematics",
    score: 91,
    term: "Q1",
    feedback: "Strong problem-solving."
  },
  {
    id: "2",
    studentId: "2",
    subject: "Science",
    score: 84,
    term: "Q1",
    feedback: "Good lab participation."
  },
  {
    id: "3",
    studentId: "3",
    subject: "English",
    score: 88,
    term: "Q1",
    feedback: "Clear improvement in essays."
  }
];