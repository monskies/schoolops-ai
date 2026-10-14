import { Card } from "../ui/Card";
import { recentActivity } from "../../data/mockDashboard";

export function RecentActivity() {
  return (
    <Card className="p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold">Recent Activity</h2>
        <p className="text-sm text-[var(--muted)]">Latest system actions</p>
      </div>

      <ul className="space-y-3">
        {recentActivity.map((activity) => (
          <li
            key={activity}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm"
          >
            {activity}
          </li>
        ))}
      </ul>
    </Card>
  );
}