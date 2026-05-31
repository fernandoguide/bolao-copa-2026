import { describe, it, expect, vi, beforeEach } from "vitest";

describe("API Service Security", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("não envia Authorization header quando token é inválido", async () => {
    localStorage.setItem("token", "not-a-valid-jwt");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "test" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { api } = await import("../services/api");
    await api.get("/test");

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it("envia Authorization header quando token é JWT válido", async () => {
    const fakeJwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
    localStorage.setItem("token", fakeJwt);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "test" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { api } = await import("../services/api");
    await api.get("/test");

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe(`Bearer ${fakeJwt}`);
  });

  it("lança erro específico para rate limiting (429)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { api } = await import("../services/api");

    await expect(api.get("/test")).rejects.toThrow(
      "Muitas requisições. Aguarde um momento e tente novamente."
    );
  });

  it("remove token e redireciona no 401", async () => {
    localStorage.setItem("token", "expired.token.here");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: "Unauthorized" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, pathname: "/dashboard", href: "" },
      writable: true,
    });

    const { api } = await import("../services/api");

    await expect(api.get("/test")).rejects.toThrow("Sessão expirada");
    expect(localStorage.getItem("token")).toBeNull();

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("não envia corpo para requisições GET", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { api } = await import("../services/api");
    await api.get("/test");

    const options = mockFetch.mock.calls[0][1];
    expect(options.body).toBeUndefined();
  });

  it("serializa dados com JSON.stringify para POST", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { api } = await import("../services/api");
    const payload = { matchId: 1, homeScore: 2, awayScore: 1 };
    await api.post("/predictions", payload);

    const options = mockFetch.mock.calls[0][1];
    expect(options.body).toBe(JSON.stringify(payload));
    expect(options.headers["Content-Type"]).toBe("application/json");
  });
});
