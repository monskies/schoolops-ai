export type ReportRow = {
  date: string;
  gradeLevel: number;
  present: number;
  absent: number;
  late: number;
};

export const mockReportRows: ReportRow[] = [
  { date: "2026-10-07", gradeLevel: 10, present: 28, absent: 1, late: 2 },
  { date: "2026-10-08", gradeLevel: 10, present: 29, absent: 1, late: 1 },
  { date: "2026-10-09", gradeLevel: 10, present: 27, absent: 2, late: 2 },
  { date: "2026-10-10", gradeLevel: 10, present: 30, absent: 0, late: 1 },
  { date: "2026-10-11", gradeLevel: 10, present: 28, absent: 2, late: 1 },
  { date: "2026-10-07", gradeLevel: 11, present: 24, absent: 3, late: 1 },
  { date: "2026-10-08", gradeLevel: 11, present: 26, absent: 1, late: 1 },
  { date: "2026-10-09", gradeLevel: 11, present: 25, absent: 2, late: 1 }
];