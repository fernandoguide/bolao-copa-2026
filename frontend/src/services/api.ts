const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");

  // Valida que o token parece ser um JWT válido (3 partes base64)
  const isValidToken =
    token && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(isValidToken ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 429) {
    throw new Error(
      "Muitas requisições. Aguarde um momento e tente novamente."
    );
  }

  if (res.status === 401) {
    // Token inválido ou expirado
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Erro ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
