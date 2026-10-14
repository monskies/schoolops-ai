import { useEffect, useState } from "react";
import { FiMenu, FiMoon, FiSearch, FiSun, FiUser } from "react-icons/fi";
import { applyTheme, getInitialTheme, type Theme } from "../../lib/theme";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function TopBar() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <Button className="lg:hidden" variant="secondary" aria-label="Open navigation">
          <FiMenu />
        </Button>

        <div className="relative min-w-0 flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <Input className="pl-10" placeholder="Search students, reports, or records..." />
        </div>

        <Button variant="secondary" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </Button>

        <Button variant="secondary" aria-label="User menu">
          <FiUser />
        </Button>
      </div>
    </header>
  );
}