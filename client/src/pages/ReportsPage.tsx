
import { motion } from "framer-motion";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { endpoints } from "../api/endpoints";
import { apiRequest } from "../api/client";
import { useEffect, useMemo, useState } from "react";

type AttendanceApiRecord = {
  _id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    gradeLevel: number;
  } | null;
};

type ReportRow = {
  date: string;
  gradeLevel: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
};

export function ReportsPage() {
  const [gradeFilter, setGradeFilter] = useState("all");
  const today = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceApiRecord[]>([]);

  const filteredRows = useMemo(() => {
    const grouped = new Map<string, ReportRow>();

    attendanceRecords.forEach((record) => {
      if (!record.student) return;

      const recordDate = record.date.slice(0, 10);

      const matchesGrade =
        gradeFilter === "all" || String(record.student.gradeLevel) === gradeFilter;

      const matchesStart = !startDate || recordDate >= startDate;
      const matchesEnd = !endDate || recordDate <= endDate;

      if (!matchesGrade || !matchesStart || !matchesEnd) return;

      const key = `${recordDate}-${record.student.gradeLevel}`;

      const current =
        grouped.get(key) || {
          date: recordDate,
          gradeLevel: record.student.gradeLevel,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };

      current[record.status] += 1;
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [attendanceRecords, gradeFilter, startDate, endDate]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (summary, row) => ({
        present: summary.present + row.present,
        absent: summary.absent + row.absent,
        late: summary.late + row.late,
        excused: summary.excused + row.excused
      }),
      { present: 0, absent: 0, late: 0, excused: 0 }
    );
  }, [filteredRows]);

  async function loadReportsData() {
    try {
      setIsLoading(true);
      setError("");

      const data = await apiRequest<AttendanceApiRecord[]>(endpoints.attendance);
      setAttendanceRecords(data.filter((record) => record.student));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load report data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReportsData();
  }, []);

  async function handleRefresh() {
    await loadReportsData();
  }
  async function handleExport() {
    try {
      setError("");
      setIsLoading(true);

      const report = await apiRequest<{
        fileName: string;
        downloadUrl: string;
        recordCount: number;
      }>(endpoints.reports.attendance, {
        method: "POST",
        body: JSON.stringify({
          startDate,
          endDate,
          gradeLevel: gradeFilter
        })
      });

      if (!report.recordCount) {
        setError("No attendance records found for the selected filters.");
        return;
      }

      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      window.open(`${apiBaseUrl}${report.downloadUrl}`, "_blank");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to export CSV.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Reports</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Attendance Reports
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Filter attendance by date range and class, review trends, and export a CSV report.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleRefresh}>
            <span className="inline-flex items-center gap-2">
              <FiRefreshCw />
              Refresh
            </span>
          </Button>

          <Button onClick={handleExport}>
            <span className="inline-flex items-center gap-2">
              <FiDownload />
              Export CSV
            </span>
          </Button>
        </div>
      </section>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)]"
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value)}
          >
            <option value="all">All grades</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>

          <Input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />

          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />

          <Button variant="secondary" onClick={handleRefresh}>
            Apply Filters
          </Button>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Present</p>
          <p className="mt-2 text-3xl font-bold text-[var(--accent)]">
            {totals.present}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Absent</p>
          <p className="mt-2 text-3xl font-bold text-[var(--accent)]">
            {totals.absent}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Late</p>
          <p className="mt-2 text-3xl font-bold text-[var(--accent)]">
            {totals.late}
          </p>
        </Card>
      </section>

      <Card className="p-5">
        <div className="mb-5">
          <h2 className="text-lg font-bold">Attendance Breakdown</h2>
          <p className="text-sm text-[var(--muted)]">Present, absent, and late counts by day</p>
        </div>

        {isLoading ? (
          <div className="h-80 animate-pulse rounded-2xl bg-[var(--surface)]" />
        ) : filteredRows.length ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredRows}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#71717a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" fill="#a1a1aa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            No report data found for the selected filters.
          </div>
        )}
      </Card>
    </motion.div>
  );
}