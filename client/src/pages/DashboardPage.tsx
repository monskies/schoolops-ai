type DashboardMetrics = {
  activeStudents: number;
  attendanceRate: number;
  averageGrade: number;
  totalGrades: number;
  totalAttendanceRecords: number;
};

import { motion } from "framer-motion";
import { AttendanceTrendChart } from "../components/dashboard/AttendanceTrendChart";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { StatCard } from "../components/dashboard/StatCard";
import { useEffect, useState } from "react"; 
import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function DashboardPage() {

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  async function handleGenerateSummary() {
    try {
      setIsSummaryLoading(true);
      setAiSummary("");

      const result = await apiRequest<{ summary: string }>("/api/automations/ai-summary", {
        method: "POST"
      });

      setAiSummary(result.summary);
    } catch (error) {
      setAiSummary(error instanceof Error ? error.message : "Failed to generate summary.");
    } finally {
      setIsSummaryLoading(false);
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const data = await apiRequest<DashboardMetrics>(endpoints.dashboard);
        setMetrics(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <section>
        <p className="text-sm font-semibold text-[var(--accent)]">
          School Operations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Dashboard Overview
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Monitor students, attendance trends, grade performance, and workflow activity in one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-[var(--surface)]"
            />
          ))
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 md:col-span-2 xl:col-span-4">
            {error}
          </div>
        ) : (
          [
            {
              label: "Total Students",
              value: String(metrics?.activeStudents ?? 0),
              helper: "Active student records"
            },
            {
              label: "Attendance Rate",
              value: `${metrics?.attendanceRate ?? 0}%`,
              helper: `${metrics?.totalAttendanceRecords ?? 0} attendance records`
            },
            {
              label: "Average Grade",
              value: `${metrics?.averageGrade ?? 0}%`,
              helper: `${metrics?.totalGrades ?? 0} grade records`
            },
            {
              label: "Absences This Week",
              value: "--",
              helper: "Coming from report data next"
            }
          ].map((stat) => <StatCard key={stat.label} {...stat} />)
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <AttendanceTrendChart />
        <RecentActivity />
      </section>

      <Card className="p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">AI-Powered Summary</h2>
            <p className="text-sm text-[var(--muted)]">
              Generate a concise attendance and grade insight for school staff.
            </p>
          </div>

          <Button onClick={handleGenerateSummary} disabled={isSummaryLoading}>
            {isSummaryLoading ? "Generating..." : "Generate AI Insight"}
          </Button>
        </div>

        {aiSummary ? (
          <p className="mt-4 whitespace-pre-line rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6">
            {aiSummary}
          </p>
        ) : null}
      </Card>

    </motion.div>
  );
}