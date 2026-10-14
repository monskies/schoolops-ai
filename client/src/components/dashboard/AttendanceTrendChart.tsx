import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card } from "../ui/Card";
import { attendanceTrend } from "../../data/mockDashboard";

export function AttendanceTrendChart() {
  return (
    <Card className="p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold">Attendance Trend</h2>
        <p className="text-sm text-[var(--muted)]">Weekly attendance rate</p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={attendanceTrend}>
            <defs>
              <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" domain={[80, 100]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="attendance"
              stroke="var(--accent)"
              fill="url(#attendanceGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}