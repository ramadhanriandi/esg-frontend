// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

// Simple mock "JWT" generator (base64 of payload)
function createMockToken(username: string) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: username,
      name: username,
      exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1h
      iat: Math.floor(Date.now() / 1000),
    }),
  );
  const signature = btoa("mock-signature");
  return `${header}.${payload}.${signature}`;
}

export const handlers = [
  // Health check
  http.get("/api/healthz", () => HttpResponse.json({ ok: true })),

  // Users list
  http.get("/api/users", () =>
    HttpResponse.json([
      { id: "1", name: "Alice", role: "admin" },
      { id: "2", name: "Bob", role: "reader" },
    ]),
  ),

  // Login endpoint
  http.post("/api/login", async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { username = "Dev User" } = body as any;

    const token = createMockToken(username);

    return HttpResponse.json({
      token,
      user: { id: "1", name: username, role: "admin" },
      expiresIn: 3600,
    });
  }),

  // Optional: token validation endpoint
  http.get("/api/me", ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new HttpResponse("Unauthorized", { status: 401 });
    }

    const token = auth.replace("Bearer ", "");
    try {
      const [, payload] = token.split(".");
      const data = JSON.parse(atob(payload));
      if (data.exp * 1000 < Date.now()) {
        return new HttpResponse("Token expired", { status: 401 });
      }
      return HttpResponse.json({ id: "1", name: data.name, role: "admin" });
    } catch {
      return new HttpResponse("Invalid token", { status: 401 });
    }
  }),
];
