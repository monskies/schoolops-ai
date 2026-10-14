import { useState } from "react";
import { motion } from "framer-motion";
import { FiLock } from "react-icons/fi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";

export function LoginPage() {
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const result = await apiRequest<{ token: string }>(endpoints.auth.login, {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem("authToken", result.token);
      localStorage.setItem("demoAuth", "true");
      form.reset();
      window.location.href = "/";
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 text-[var(--text)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <FiLock className="text-[var(--accent)]" />
          </div>

          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Access the school operations workspace.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>
              <Input name="email" type="email" placeholder="admin@example.com" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Password</label>
              <Input name="password" type="password" placeholder="••••••••" />
            </div>

            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            ) : null}

            <Button className="w-full" type="submit">
              Login
            </Button>
          </form>
        </Card>
      </motion.div>
    </main>
  );
}