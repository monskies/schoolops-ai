type AttendanceApiRecord = {
  _id: string;
  student: Student | null;
  date: string;
  status: AttendanceStatus | "excused";
  note?: string;
};

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiClock, FiSave, FiX } from "react-icons/fi";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { AttendanceStatus } from "../data/mockAttendance";
import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";
import type { Student } from "../data/mockStudents";

const statusOptions: Array<{
  label: string;
  value: AttendanceStatus;
  icon: React.ComponentType;
}> = [
  { label: "Present", value: "present", icon: FiCheck },
  { label: "Absent", value: "absent", icon: FiX },
  { label: "Late", value: "late", icon: FiClock }
];

export function AttendancePage() {
  const [gradeFilter, setGradeFilter] = useState("all");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceApiRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAttendanceData() {
    try {
      setIsLoading(true);
      setError("");

      const [studentData, attendanceData] = await Promise.all([
        apiRequest<Student[]>(endpoints.students),
        apiRequest<AttendanceApiRecord[]>(endpoints.attendance)
      ]);

      setStudents(studentData);
      setRecords(attendanceData);

      const nextDrafts: Record<string, { status: AttendanceStatus; note: string }> = {};

      studentData.forEach((student) => {
        const existing = attendanceData.find((record) => {
          const recordDate = record.date.slice(0, 10);
          return record.student?._id === student._id && recordDate === date;
        });

        nextDrafts[student._id] = {
          status: (existing?.status as AttendanceStatus) || "present",
          note: existing?.note || ""
        };
      });

      setDrafts(nextDrafts);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load attendance.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAttendanceData();
  }, [date]);

  const visibleStudents = useMemo(() => {
    return students.filter((student) => {
      return gradeFilter === "all" || String(student.gradeLevel) === gradeFilter;
    });
  }, [students, gradeFilter]);

  const attendanceRate = useMemo(() => {
    if (!visibleStudents.length) return 0;

    const presentCount = visibleStudents.filter((student) => {
      return drafts[student._id]?.status === "present";
    }).length;

    return Math.round((presentCount / visibleStudents.length) * 100);
  }, [drafts, visibleStudents]);

  function updateStatus(studentId: string, status: AttendanceStatus) {
    setSavedMessage("");

    setDrafts((current) => ({
      ...current,
      [studentId]: {
        status,
        note: current[studentId]?.note || ""
      }
    }));
  }

  function updateNote(studentId: string, note: string) {
    setSavedMessage("");

    setDrafts((current) => ({
      ...current,
      [studentId]: {
        status: current[studentId]?.status || "present",
        note
      }
    }));
  }

  async function handleSave() {
    try {
      setError("");
      setSavedMessage("");

      await Promise.all(
        visibleStudents.map((student) => {
          const draft = drafts[student._id] || { status: "present", note: "" };

          const existing = records.find((record) => {
            const recordDate = record.date.slice(0, 10);
            return record.student?._id === student._id && recordDate === date;
          });

          const payload = {
            student: student._id,
            date,
            status: draft.status,
            note: draft.note
          };

          if (existing) {
            return apiRequest(`${endpoints.attendance}/${existing._id}`, {
              method: "PATCH",
              body: JSON.stringify(payload)
            });
          }

          return apiRequest(endpoints.attendance, {
            method: "POST",
            body: JSON.stringify(payload)
          });
        })
      );

      setSavedMessage(`Attendance saved for ${gradeFilter === "all" ? "all grades" : `Grade ${gradeFilter}`} on ${date}.`);
      await loadAttendanceData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save attendance.");
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
          <p className="text-sm font-semibold text-[var(--accent)]">Daily Tracking</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Attendance
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Pick a class and date, then quickly mark attendance for each student.
          </p>
        </div>

        <Card className="p-4">
          <p className="text-sm font-medium text-[var(--muted)]">Attendance Rate</p>
          <p className="mt-1 text-3xl font-bold text-[var(--accent)]">
            {attendanceRate}%
          </p>
        </Card>
      </section>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[180px_220px_1fr]">
          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)]"
            value={gradeFilter}
            onChange={(event) => {
              setGradeFilter(event.target.value);
              setSavedMessage("");
            }}
          >
            <option value="all">All grades</option>
            <option value="4">Grade 4</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>

          <Input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setSavedMessage("");
            }}
          />

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <span className="inline-flex items-center gap-2">
                <FiSave />
                Save Attendance
              </span>
            </Button>
          </div>
        </div>

        {savedMessage ? (
          <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {savedMessage}
          </p>
        ) : null}
      </Card>

      <Card className="p-5">
        {error ? (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-[var(--surface)]" />
            <div className="h-20 animate-pulse rounded-2xl bg-[var(--surface)]" />
            <div className="h-20 animate-pulse rounded-2xl bg-[var(--surface)]" />
          </div>
        ) : visibleStudents.length ? (
          <div className="space-y-3">
            {visibleStudents.map((student) => {
              const draft = drafts[student._id] || { status: "present", note: "" };
              const status = draft.status;

              return (
                <div
                  key={student.id}
                  className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:grid-cols-[1fr_auto_240px]"
                >
                  <div>
                    <p className="font-semibold">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      Grade {student.gradeLevel}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      const active = status === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateStatus(student._id, option.value)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                            active
                              ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                          }`}
                        >
                          <Icon />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <Input
                    placeholder="Optional note"
                    value={draft.note}
                    onChange={(event) => updateNote(student._id, event.target.value)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            No active students found for this grade.
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
        <Badge tone="success">Present</Badge>
        <Badge tone="warning">Late</Badge>
        <Badge>Absent</Badge>
      </div>
    </motion.div>
  );
}