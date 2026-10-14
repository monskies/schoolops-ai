const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.auth !== false && token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("demoAuth");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}