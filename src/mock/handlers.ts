// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:8080";

// Simple mock "JWT" generator (base64 of payload)
function createMockToken(username: string) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: username,
      name: username,
      exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1h
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signature = btoa("mock-signature");
  return `${header}.${payload}.${signature}`;
}

function decodeMockJwt(token?: string): any | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function getCompanyIdFromRequest(req: Request): string | undefined {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    const jwt = auth.substring("Bearer ".length).trim();
    const decoded = decodeMockJwt(jwt);
    if (decoded?.company_id) return decoded.company_id as string;
  }
  // fallback header for convenience
  const hdr = req.headers.get("x-company-id") || undefined;
  return hdr;
}

// ---- Mock DB ----
type MockSite = {
  site_id: string;
  name: string;
  country: string;
  timezone: string;
  created_at: string; // ISO for sorting desc
};

const SITES: MockSite[] = [
  {
    site_id: "6b7d8f1a-51e0-4a8c-9b08-6b2a9f0f0a10",
    name: "DC-SG3",
    country: "SG",
    timezone: "Asia/Singapore",
    created_at: "2025-10-21T10:15:00Z",
  },
  {
    site_id: "e2b2c9c1-0a5a-4db1-9f9c-6aa2db2a0c22",
    name: "DC-SG8",
    country: "SG",
    timezone: "Asia/Singapore",
    created_at: "2025-09-03T09:00:00Z",
  },
  {
    site_id: "74f3b0e4-7c25-4c42-95df-9a2b5b2e40a1",
    name: "DC-SG36",
    country: "AU",
    timezone: "Australia/Sydney",
    created_at: "2025-08-01T08:00:00Z",
  },
];

// Reusable sorter (DESC by created_at like your SQL)
function sortSitesDesc(a: MockSite, b: MockSite) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export const handlers = [
  // Health check
  http.get("/healthz", () => HttpResponse.json({ ok: true })),

  // Login endpoint
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { username = "Dev User" } = body as any;

    const token = createMockToken(username);

    return HttpResponse.json({
      token,
      user: { id: "1", name: username, role: "admin" },
      expiresIn: 3600,
    });
  }),

  // 🔹 Register endpoint (new)
  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { company_name, email, password } = body as any;

    if (!company_name || !email || !password) {
      return HttpResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock token + fake user
    const token = createMockToken(email);
    const user = {
      id: "reg-" + Math.floor(Math.random() * 1000),
      company_name,
      email,
      role: "user",
    };

    return HttpResponse.json(
      {
        message: "User registered successfully",
        token,
        user,
      },
      { status: 201 }
    );
  }),

  http.get(`${API_BASE}/sites`, async ({ request }) => {
    const allSites = SITES.slice().sort(sortSitesDesc);

    // Optional query param filtering: ?country=SG
    const url = new URL(request.url);
    const countryFilter = url.searchParams.get("country");
    const filtered = countryFilter
      ? allSites.filter((s) => s.country === countryFilter)
      : allSites;

    // Shape the response like your Python code (exclude created_at)
    const sites = filtered.map(({ created_at, ...rest }) => rest);

    return HttpResponse.json(sites);
  }),
];
