import { FiBarChart2, FiBookOpen, FiCalendar, FiFileText, FiUsers } from "react-icons/fi";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/", icon: FiBarChart2 },
  { label: "Students", path: "/students", icon: FiUsers },
  { label: "Attendance", path: "/attendance", icon: FiCalendar },
  { label: "Grades", path: "/grades", icon: FiBookOpen },
  { label: "Reports", path: "/reports", icon: FiFileText }
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-xl lg:block">
      <div className="mb-8 rounded-2xl border border-[var(--border)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          SchoolOps AI
        </p>
        <h2 className="mt-2 text-xl font-bold">Operations Hub</h2>
      </div>

      <nav className="space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                    isActive
                        ? "bg-[var(--accent)] text-black"
                        : "text-[var(--muted)] hover:bg-white/10 hover:text-[var(--text)]"
                    }`
                }
                >
                <Icon aria-hidden="true" />
                {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}