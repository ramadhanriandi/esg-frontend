// import { http, HttpResponse } from "msw";

// const API_BASE = "http://localhost:8080";

// function createMockToken(username: string) {
//   const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
//   const payload = btoa(
//     JSON.stringify({
//       sub: username,
//       name: username,
//       company_id: "mock-company-1",
//       user_id: "mock-user-1",
//       exp: Math.floor(Date.now() / 1000) + 3600,
//       iat: Math.floor(Date.now() / 1000),
//     })
//   );
//   const signature = btoa("mock-signature");
//   return `${header}.${payload}.${signature}`;
// }

// function decodeMockJwt(token?: string): any | null {
//   if (!token) return null;
//   try {
//     const [, payload] = token.split(".");
//     return JSON.parse(atob(payload));
//   } catch {
//     return null;
//   }
// }

// type ReportIndicatorSummary = {
//   samples: number;
//   ok: number;
//   warn: number;
//   crit: number;
//   ok_pct: number;
//   warn_pct: number;
//   crit_pct: number;
//   avg: number;
//   min: number;
//   max: number;
// };

// type ReportSummary = {
//   site_id: string;
//   framework_code: string;
//   period: {
//     from: string;
//     to: string;
//   };
//   indicators: Record<Indicator, ReportIndicatorSummary>;
// };

// function makeReportIndicatorSummary(
//   samples: number,
//   avg: number,
//   okPct: number,
//   warnPct: number,
//   critPct: number
// ): ReportIndicatorSummary {
//   const ok = Math.round((samples * okPct) / 100);
//   const warn = Math.round((samples * warnPct) / 100);
//   const crit = samples - ok - warn;
//   const min = avg * 0.95;
//   const max = avg * 1.05;
//   return {
//     samples,
//     ok,
//     warn,
//     crit,
//     ok_pct: Number(okPct.toFixed(2)),
//     warn_pct: Number(warnPct.toFixed(2)),
//     crit_pct: Number(critPct.toFixed(2)),
//     avg: Number(avg.toFixed(6)),
//     min: Number(min.toFixed(6)),
//     max: Number(max.toFixed(6)),
//   };
// }

// function buildMockReportSummary(
//   siteId: string,
//   frameworkCode: string,
//   fromIso: string,
//   toIso: string
// ): ReportSummary {
//   const site = SITES.find((s) => s.site_id === siteId);
//   let basePue = 1.7;
//   if (site?.name === "DC-SG3") basePue = 1.65;
//   if (site?.name === "DC-SG8") basePue = 1.82;
//   if (site?.name === "DC-SG36") basePue = 2.05;

//   const baseWue = 1.0;
//   const baseCue = 0.75;
//   const samples = 96;

//   let pueSummary: ReportIndicatorSummary;
//   if (basePue >= 2.0) {
//     pueSummary = makeReportIndicatorSummary(samples, basePue, 55, 30, 15);
//   } else if (basePue >= 1.8) {
//     pueSummary = makeReportIndicatorSummary(samples, basePue, 70, 20, 10);
//   } else {
//     pueSummary = makeReportIndicatorSummary(samples, basePue, 85, 10, 5);
//   }

//   const wueSummary = makeReportIndicatorSummary(samples, baseWue, 80, 15, 5);
//   const cueSummary = makeReportIndicatorSummary(samples, baseCue, 82, 13, 5);

//   return {
//     site_id: siteId,
//     framework_code: frameworkCode,
//     period: {
//       from: fromIso,
//       to: toIso,
//     },
//     indicators: {
//       PUE: pueSummary,
//       WUE: wueSummary,
//       CUE: cueSummary,
//     },
//   };
// }

// function getCompanyIdFromRequest(req: Request): string {
//   const auth =
//     req.headers.get("authorization") || req.headers.get("Authorization");
//   if (auth?.startsWith("Bearer ")) {
//     const jwt = auth.substring("Bearer ".length).trim();
//     const decoded = decodeMockJwt(jwt);
//     if (decoded?.company_id) return decoded.company_id as string;
//   }
//   const hdr = req.headers.get("x-company-id");
//   return hdr || "mock-company-1";
// }

// function getClaimsFromRequest(req: Request): {
//   company_id: string;
//   user_id: string;
//   sub?: string;
//   name?: string;
// } {
//   const auth =
//     req.headers.get("authorization") || req.headers.get("Authorization");
//   if (auth?.startsWith("Bearer ")) {
//     const jwt = auth.substring("Bearer ".length).trim();
//     const decoded = decodeMockJwt(jwt) || {};
//     return {
//       company_id: decoded.company_id ?? "mock-company-1",
//       user_id: decoded.user_id ?? "mock-user-1",
//       sub: decoded.sub,
//       name: decoded.name,
//     };
//   }
//   return {
//     company_id: "mock-company-1",
//     user_id: "mock-user-1",
//   };
// }

// function randomId(prefix: string) {
//   if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
//     return `${prefix}-${crypto.randomUUID()}`;
//   }
//   return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
// }

// function randomTokenString(): string {
//   return (
//     Math.random().toString(36).slice(2) +
//     Math.random().toString(36).slice(2) +
//     Math.random().toString(36).slice(2)
//   );
// }

// type MockSite = {
//   site_id: string;
//   name: string;
//   country: string;
//   timezone: string;
//   created_at: string;
// };

// const SITES: MockSite[] = [
//   {
//     site_id: "6b7d8f1a-51e0-4a8c-9b08-6b2a9f0f0a10",
//     name: "DC-SG3",
//     country: "SG",
//     timezone: "Asia/Singapore",
//     created_at: "2025-10-21T10:15:00Z",
//   },
//   {
//     site_id: "e2b2c9c1-0a5a-4db1-9f9c-6aa2db2a0c22",
//     name: "DC-SG8",
//     country: "SG",
//     timezone: "Asia/Singapore",
//     created_at: "2025-09-03T09:00:00Z",
//   },
//   {
//     site_id: "74f3b0e4-7c25-4c42-95df-9a2b5b2e40a1",
//     name: "DC-SG36",
//     country: "AU",
//     timezone: "Australia/Sydney",
//     created_at: "2025-08-01T08:00:00Z",
//   },
// ];

// function sortSitesDesc(a: MockSite, b: MockSite) {
//   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
// }

// type MockFramework = {
//   framework_code: string;
//   name: string;
//   version: string;
//   jurisdiction: string;
//   notes: string | null;
// };

// const FRAMEWORKS: MockFramework[] = [
//   {
//     framework_code: "GMDC_SG_2024",
//     name: "GMDC Singapore 2024",
//     version: "2024",
//     jurisdiction: "SG",
//     notes: "Green Mark DC preset for Singapore.",
//   },
//   {
//     framework_code: "CORP_DEFAULT",
//     name: "Corporate Default Baseline",
//     version: "1.0",
//     jurisdiction: "GLOBAL",
//     notes: "Slightly tighter generic corporate baseline.",
//   },
//   {
//     framework_code: "SLA_STRICT",
//     name: "SLA Strict Premium",
//     version: "1.0",
//     jurisdiction: "GLOBAL",
//     notes: "Strict thresholds for premium or SLA sites.",
//   },
// ];

// type MockSiteFramework = {
//   site_id: string;
//   framework_code: string;
//   framework_name: string;
//   is_active: boolean;
//   precedence: number;
// };

// let SITE_FRAMEWORKS: MockSiteFramework[] = [
//   {
//     site_id: SITES[0].site_id,
//     framework_code: "GMDC_SG_2024",
//     framework_name: "GMDC Singapore 2024",
//     is_active: true,
//     precedence: 10,
//   },
//   {
//     site_id: SITES[0].site_id,
//     framework_code: "CORP_DEFAULT",
//     framework_name: "Corporate Default Baseline",
//     is_active: true,
//     precedence: 20,
//   },
// ];

// type Indicator = "PUE" | "WUE" | "CUE";
// type Severity = "WARN" | "CRIT";

// type ThresholdRule = {
//   indicator: Indicator;
//   comparator: "<=" | ">=" | "<" | ">";
//   value: number;
//   severity: Severity;
//   load_band: number | null;
// };

// type ThresholdKey = string;

// const GRID_EF_SG = 0.4057;

// const THRESHOLDS: Record<ThresholdKey, ThresholdRule[]> = {};

// function buildGmdcRules(loadAware: boolean): ThresholdRule[] {
//   const pueBands = [
//     { band: 25, warn: 1.39, crit: 1.46 },
//     { band: 50, warn: 1.33, crit: 1.39 },
//     { band: 75, warn: 1.29, crit: 1.36 },
//     { band: 100, warn: 1.28, crit: 1.35 },
//   ];

//   const rules: ThresholdRule[] = [];

//   if (loadAware) {
//     for (const b of pueBands) {
//       rules.push(
//         {
//           indicator: "PUE",
//           comparator: "<=",
//           severity: "WARN",
//           value: b.warn,
//           load_band: b.band,
//         },
//         {
//           indicator: "PUE",
//           comparator: "<=",
//           severity: "CRIT",
//           value: b.crit,
//           load_band: b.band,
//         }
//       );
//     }
//   } else {
//     const b100 = pueBands.find((b) => b.band === 100)!;
//     rules.push(
//       {
//         indicator: "PUE",
//         comparator: "<=",
//         severity: "WARN",
//         value: b100.warn,
//         load_band: null,
//       },
//       {
//         indicator: "PUE",
//         comparator: "<=",
//         severity: "CRIT",
//         value: b100.crit,
//         load_band: null,
//       }
//     );
//   }

//   rules.push(
//     {
//       indicator: "WUE",
//       comparator: "<=",
//       severity: "WARN",
//       value: 2.0,
//       load_band: null,
//     },
//     {
//       indicator: "WUE",
//       comparator: "<=",
//       severity: "CRIT",
//       value: 2.2,
//       load_band: null,
//     }
//   );

//   if (loadAware) {
//     for (const b of pueBands) {
//       rules.push(
//         {
//           indicator: "CUE",
//           comparator: "<=",
//           severity: "WARN",
//           value: parseFloat((b.warn * GRID_EF_SG).toFixed(3)),
//           load_band: b.band,
//         },
//         {
//           indicator: "CUE",
//           comparator: "<=",
//           severity: "CRIT",
//           value: parseFloat((b.crit * GRID_EF_SG).toFixed(3)),
//           load_band: b.band,
//         }
//       );
//     }
//   } else {
//     const b100 = pueBands.find((b) => b.band === 100)!;
//     rules.push(
//       {
//         indicator: "CUE",
//         comparator: "<=",
//         severity: "WARN",
//         value: parseFloat((b100.warn * GRID_EF_SG).toFixed(3)),
//         load_band: null,
//       },
//       {
//         indicator: "CUE",
//         comparator: "<=",
//         severity: "CRIT",
//         value: parseFloat((b100.crit * GRID_EF_SG).toFixed(3)),
//         load_band: null,
//       }
//     );
//   }

//   return rules;
// }

// function buildCorpDefaultRules(): ThresholdRule[] {
//   return [
//     {
//       indicator: "PUE",
//       comparator: "<=",
//       severity: "WARN",
//       value: 1.35,
//       load_band: null,
//     },
//     {
//       indicator: "PUE",
//       comparator: "<=",
//       severity: "CRIT",
//       value: 1.4,
//       load_band: null,
//     },
//     {
//       indicator: "WUE",
//       comparator: "<=",
//       severity: "WARN",
//       value: 1.9,
//       load_band: null,
//     },
//     {
//       indicator: "WUE",
//       comparator: "<=",
//       severity: "CRIT",
//       value: 2.1,
//       load_band: null,
//     },
//     {
//       indicator: "CUE",
//       comparator: "<=",
//       severity: "WARN",
//       value: parseFloat((1.35 * GRID_EF_SG).toFixed(3)),
//       load_band: null,
//     },
//     {
//       indicator: "CUE",
//       comparator: "<=",
//       severity: "CRIT",
//       value: parseFloat((1.4 * GRID_EF_SG).toFixed(3)),
//       load_band: null,
//     },
//   ];
// }

// function buildSlaStrictRules(): ThresholdRule[] {
//   return [
//     {
//       indicator: "PUE",
//       comparator: "<=",
//       severity: "WARN",
//       value: 1.3,
//       load_band: null,
//     },
//     {
//       indicator: "PUE",
//       comparator: "<=",
//       severity: "CRIT",
//       value: 1.35,
//       load_band: null,
//     },
//     {
//       indicator: "WUE",
//       comparator: "<=",
//       severity: "WARN",
//       value: 1.8,
//       load_band: null,
//     },
//     {
//       indicator: "WUE",
//       comparator: "<=",
//       severity: "CRIT",
//       value: 2.0,
//       load_band: null,
//     },
//     {
//       indicator: "CUE",
//       comparator: "<=",
//       severity: "WARN",
//       value: parseFloat((1.3 * GRID_EF_SG).toFixed(3)),
//       load_band: null,
//     },
//     {
//       indicator: "CUE",
//       comparator: "<=",
//       severity: "CRIT",
//       value: parseFloat((1.35 * GRID_EF_SG).toFixed(3)),
//       load_band: null,
//     },
//   ];
// }

// function buildPresetRules(frameworkCode: string): ThresholdRule[] {
//   switch (frameworkCode) {
//     case "GMDC_SG_2024":
//       return buildGmdcRules(true);
//     case "CORP_DEFAULT":
//       return buildCorpDefaultRules();
//     case "SLA_STRICT":
//       return buildSlaStrictRules();
//     default:
//       return [];
//   }
// }

// function getThresholdKey(
//   companyId: string,
//   siteId: string,
//   frameworkCode: string
// ): ThresholdKey {
//   return `${companyId}:${siteId}:${frameworkCode}`;
// }

// type MockAlert = {
//   alert_id: string;
//   site_id: string;
//   indicator: Indicator;
//   severity: Severity;
//   comparator: "<=" | ">=" | "<" | ">";
//   threshold_value: number;
//   observed_value: number;
//   status: "OPEN" | "CLEARED";
//   framework_code: string;
//   raised_at: string;
//   cleared_at: string | null;
// };

// let ALERTS: MockAlert[] = [
//   {
//     alert_id: "a1",
//     site_id: SITES[0].site_id,
//     indicator: "PUE",
//     severity: "WARN",
//     comparator: "<=",
//     threshold_value: 1.33,
//     observed_value: 1.38,
//     status: "OPEN",
//     framework_code: "GMDC_SG_2024",
//     raised_at: "2025-11-10T10:00:00Z",
//     cleared_at: null,
//   },
//   {
//     alert_id: "a2",
//     site_id: SITES[0].site_id,
//     indicator: "WUE",
//     severity: "CRIT",
//     comparator: "<=",
//     threshold_value: 2.0,
//     observed_value: 2.3,
//     status: "CLEARED",
//     framework_code: "GMDC_SG_2024",
//     raised_at: "2025-11-01T08:00:00Z",
//     cleared_at: "2025-11-03T09:00:00Z",
//   },
// ];

// type IngestToken = {
//   token_id: string;
//   name: string;
//   active: boolean;
//   created_at: string;
//   last_used_at: string | null;
//   company_id: string;
//   user_id: string;
//   plaintext: string;
// };

// let INGEST_TOKENS: IngestToken[] = [];

// function authIngestToken(req: Request): IngestToken | null {
//   const headers = req.headers;
//   let token = headers.get("x-api-key") || headers.get("X-Api-Key") || null;

//   if (!token) {
//     const auth = headers.get("authorization") || headers.get("Authorization");
//     if (auth?.startsWith("Ingest ")) {
//       token = auth.substring("Ingest ".length).trim();
//     }
//   }

//   if (!token) return null;

//   const found = INGEST_TOKENS.find((t) => t.active && t.plaintext === token);
//   if (!found) return null;

//   found.last_used_at = new Date().toISOString();
//   return found;
// }

// export const handlers = [
//   http.get("/healthz", () => HttpResponse.json({ ok: true })),

//   http.post(`${API_BASE}/auth/login`, async ({ request }) => {
//     const body = await request.json().catch(() => ({}));
//     const { username = "Dev User" } = body as any;

//     const token = createMockToken(username);

//     return HttpResponse.json({
//       token,
//       user: { id: "1", name: username, role: "admin" },
//       expiresIn: 3600,
//     });
//   }),

//   http.post(`${API_BASE}/auth/register`, async ({ request }) => {
//     const body = await request.json().catch(() => ({}));
//     const { company_name, email, password } = body as any;

//     if (!company_name || !email || !password) {
//       return HttpResponse.json(
//         { message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const token = createMockToken(email);
//     const user = {
//       id: "reg-" + Math.floor(Math.random() * 1000),
//       company_name,
//       email,
//       role: "user",
//     };

//     return HttpResponse.json(
//       {
//         message: "User registered successfully",
//         token,
//         user,
//       },
//       { status: 201 }
//     );
//   }),

//   http.get(`${API_BASE}/sites`, async ({ request }) => {
//     const allSites = SITES.slice().sort(sortSitesDesc);

//     const url = new URL(request.url);
//     const countryFilter = url.searchParams.get("country");
//     const filtered = countryFilter
//       ? allSites.filter((s) => s.country === countryFilter)
//       : allSites;

//     const sites = filtered.map(({ created_at, ...rest }) => rest);

//     return HttpResponse.json(sites);
//   }),

//   http.get(`${API_BASE}/frameworks`, async () => {
//     return HttpResponse.json({ frameworks: FRAMEWORKS });
//   }),

//   http.get(`${API_BASE}/site_frameworks`, async ({ request }) => {
//     const url = new URL(request.url);
//     const siteId = url.searchParams.get("site_id") || "";

//     if (!siteId) {
//       return HttpResponse.json(
//         { message: "site_id required" },
//         { status: 400 }
//       );
//     }

//     const frameworks = SITE_FRAMEWORKS.filter(
//       (sf) => sf.site_id === siteId
//     ).map(({ site_id, ...rest }) => rest);

//     return HttpResponse.json({
//       site_id: siteId,
//       frameworks,
//     });
//   }),

//   http.post(`${API_BASE}/site_frameworks`, async ({ request }) => {
//     const body = (await request.json().catch(() => ({}))) as {
//       site_id?: string;
//       assignments?: {
//         framework_code?: string;
//         is_active?: boolean;
//         precedence?: number;
//       }[];
//     };

//     const siteId = (body.site_id || "").trim();
//     if (!siteId) {
//       return HttpResponse.json(
//         { message: "site_id required" },
//         { status: 400 }
//       );
//     }

//     if (!Array.isArray(body.assignments)) {
//       SITE_FRAMEWORKS = SITE_FRAMEWORKS.filter((sf) => sf.site_id !== siteId);
//       return HttpResponse.json({ ok: true });
//     }

//     const codes = body.assignments.map((a) => (a.framework_code || "").trim());
//     if (codes.some((c) => !c)) {
//       return HttpResponse.json(
//         { message: "every assignment requires framework_code" },
//         { status: 400 }
//       );
//     }

//     SITE_FRAMEWORKS = SITE_FRAMEWORKS.filter((sf) => sf.site_id !== siteId);

//     for (const a of body.assignments) {
//       const code = (a.framework_code || "").trim();
//       const fw = FRAMEWORKS.find((f) => f.framework_code === code);
//       SITE_FRAMEWORKS.push({
//         site_id: siteId,
//         framework_code: code,
//         framework_name: fw?.name ?? code,
//         is_active: Boolean(a.is_active),
//         precedence: Number.isFinite(a.precedence)
//           ? (a.precedence as number)
//           : 100,
//       });
//     }

//     return HttpResponse.json({ ok: true });
//   }),

//   http.get(`${API_BASE}/thresholds`, async ({ request }) => {
//     const url = new URL(request.url);
//     const siteId = (url.searchParams.get("site_id") || "").trim();
//     const frameworkCode = (
//       url.searchParams.get("framework_code") || "GMDC_SG_2024"
//     ).trim();

//     if (!siteId) {
//       return HttpResponse.json(
//         { message: "site_id required" },
//         { status: 400 }
//       );
//     }

//     const companyId = getCompanyIdFromRequest(request);
//     const key = getThresholdKey(companyId, siteId, frameworkCode);

//     if (!THRESHOLDS[key]) {
//       THRESHOLDS[key] = buildPresetRules(frameworkCode);
//     }

//     return HttpResponse.json({
//       site_id: siteId,
//       framework_code: frameworkCode,
//       rules: THRESHOLDS[key],
//     });
//   }),

//   http.post(`${API_BASE}/thresholds`, async ({ request }) => {
//     const body = (await request.json().catch(() => ({}))) as {
//       site_id?: string;
//       framework_code?: string;
//       rules?: ThresholdRule[];
//     };

//     const siteId = (body.site_id || "").trim();
//     const frameworkCode = (body.framework_code || "GMDC_SG_2024").trim();

//     if (!siteId || !Array.isArray(body.rules) || body.rules.length === 0) {
//       return HttpResponse.json(
//         { message: "site_id and rules[] required" },
//         { status: 400 }
//       );
//     }

//     const companyId = getCompanyIdFromRequest(request);
//     const key = getThresholdKey(companyId, siteId, frameworkCode);

//     THRESHOLDS[key] = body.rules.map((r) => ({
//       indicator: r.indicator,
//       comparator: r.comparator,
//       severity: r.severity,
//       value: Number(r.value),
//       load_band:
//         typeof r.load_band === "number" ? (r.load_band as number) : null,
//     }));

//     return HttpResponse.json({ ok: true });
//   }),

//   http.get(`${API_BASE}/alerts`, async ({ request }) => {
//     const url = new URL(request.url);
//     const status = (url.searchParams.get("status") || "OPEN")
//       .toUpperCase()
//       .trim();
//     const frameworkCode = (
//       url.searchParams.get("framework_code") || "GMDC_SG_2024"
//     ).trim();
//     const siteId = (url.searchParams.get("site_id") || "").trim();

//     if (status !== "OPEN" && status !== "CLEARED") {
//       return HttpResponse.json(
//         { message: "status must be OPEN or CLEARED" },
//         { status: 400 }
//       );
//     }

//     let filtered = ALERTS.filter(
//       (a) => a.status === status && a.framework_code === frameworkCode
//     );
//     if (siteId) {
//       filtered = filtered.filter((a) => a.site_id === siteId);
//     }

//     const alerts = filtered.map((a) => ({
//       alert_id: a.alert_id,
//       site_id: a.site_id,
//       indicator: a.indicator,
//       severity: a.severity,
//       comparator: a.comparator,
//       threshold_value: a.threshold_value,
//       observed_value: a.observed_value,
//       status: a.status,
//       raised_at: a.raised_at,
//       cleared_at: a.cleared_at,
//     }));

//     return HttpResponse.json({ alerts });
//   }),

//   http.post(`${API_BASE}/ingest_tokens`, async ({ request }) => {
//     const claims = getClaimsFromRequest(request);
//     const companyId = claims.company_id;
//     const userId = claims.user_id;
//     if (!companyId || !userId) {
//       return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
//     }

//     const body = (await request.json().catch(() => ({}))) as {
//       name?: string;
//     };
//     const name = (body.name || "").trim() || "default";

//     INGEST_TOKENS = INGEST_TOKENS.map((t) =>
//       t.user_id === userId ? { ...t, active: false } : t
//     );

//     const tokenId = randomId("tok");
//     const plaintext = randomTokenString();
//     const now = new Date().toISOString();

//     const token: IngestToken = {
//       token_id: tokenId,
//       name,
//       active: true,
//       created_at: now,
//       last_used_at: null,
//       company_id: companyId,
//       user_id: userId,
//       plaintext,
//     };
//     INGEST_TOKENS.push(token);

//     return HttpResponse.json(
//       {
//         token_id: tokenId,
//         token: plaintext,
//         name,
//       },
//       { status: 201 }
//     );
//   }),

//   http.get(`${API_BASE}/ingest_tokens`, async ({ request }) => {
//     const claims = getClaimsFromRequest(request);
//     const companyId = claims.company_id;
//     const userId = claims.user_id;
//     if (!companyId || !userId) {
//       return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
//     }

//     const tokensForUser = INGEST_TOKENS.filter(
//       (t) => t.company_id === companyId && t.user_id === userId
//     )
//       .sort(
//         (a, b) =>
//           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       )
//       .map((t) => ({
//         token_id: t.token_id,
//         name: t.name,
//         active: t.active,
//         created_at: t.created_at,
//         last_used_at: t.last_used_at,
//       }));

//     return HttpResponse.json({ tokens: tokensForUser });
//   }),

//   http.post(`${API_BASE}/metrics`, async ({ request }) => {
//     const token = authIngestToken(request);
//     if (!token) {
//       return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
//     }

//     const body = (await request.json().catch(() => ({}))) as {
//       site_id?: string;
//       measured_at?: string;
//       it_load_pct?: number;
//       measurements?: { indicator?: string; value?: number }[];
//     };

//     const siteId = (body.site_id || "").trim();
//     if (!siteId) {
//       return HttpResponse.json(
//         { message: "site_id required" },
//         { status: 400 }
//       );
//     }

//     const siteExists = SITES.some((s) => s.site_id === siteId);
//     if (!siteExists) {
//       return HttpResponse.json({ message: "site not found" }, { status: 404 });
//     }

//     const measurements = Array.isArray(body.measurements)
//       ? body.measurements
//       : [];
//     if (!measurements.length) {
//       return HttpResponse.json(
//         { message: "measurements[] required" },
//         { status: 400 }
//       );
//     }

//     const ingested = measurements.length;

//     return HttpResponse.json({
//       site_id: siteId,
//       ingested,
//     });
//   }),

//   http.get(`${API_BASE}/reports/summary`, async ({ request }) => {
//     const url = new URL(request.url);
//     const siteId = (
//       url.searchParams.get("site_id") ||
//       SITES[0]?.site_id ||
//       ""
//     ).trim();
//     const frameworkCode = (
//       url.searchParams.get("framework_code") || "GMDC_SG_2024"
//     ).trim();
//     let fromIso = (url.searchParams.get("from") || "").trim();
//     let toIso = (url.searchParams.get("to") || "").trim();

//     if (!siteId) {
//       return HttpResponse.json(
//         { message: "site_id required" },
//         { status: 400 }
//       );
//     }

//     const siteExists = SITES.some((s) => s.site_id === siteId);
//     if (!siteExists) {
//       return HttpResponse.json({ message: "site not found" }, { status: 404 });
//     }

//     if (!fromIso || !toIso) {
//       const now = new Date();
//       const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//       fromIso = from.toISOString();
//       toIso = now.toISOString();
//     }

//     const summary = buildMockReportSummary(
//       siteId,
//       frameworkCode,
//       fromIso,
//       toIso
//     );
//     return HttpResponse.json(summary);
//   }),

//   http.post(`${API_BASE}/reports`, async ({ request }) => {
//     const claims = getClaimsFromRequest(request);
//     if (!claims.company_id || !claims.user_id) {
//       return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
//     }

//     const body = (await request.json().catch(() => ({}))) as {
//       site_id?: string;
//       framework_code?: string;
//       from?: string;
//       to?: string;
//       format?: string;
//     };

//     let siteId = (body.site_id || SITES[0]?.site_id || "").trim();
//     const frameworkCode = (body.framework_code || "GMDC_SG_2024").trim();
//     let fromIso = (body.from || "").trim();
//     let toIso = (body.to || "").trim();
//     const fmt = (body.format || "json").trim().toLowerCase();

//     if (!siteId) {
//       return HttpResponse.json(
//         { message: "site_id required" },
//         { status: 400 }
//       );
//     }

//     const siteExists = SITES.some((s) => s.site_id === siteId);
//     if (!siteExists) {
//       return HttpResponse.json({ message: "site not found" }, { status: 404 });
//     }

//     if (!fromIso || !toIso) {
//       const now = new Date();
//       const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//       fromIso = from.toISOString();
//       toIso = now.toISOString();
//     }

//     buildMockReportSummary(siteId, frameworkCode, fromIso, toIso);

//     const reportId = randomId("rpt");
//     const s3Key = `reports/${siteId}/${frameworkCode}/${reportId}.${fmt}`;
//     const downloadUrl = `${API_BASE}/mock-download/${encodeURIComponent(
//       s3Key
//     )}`;

//     return HttpResponse.json(
//       {
//         report_id: reportId,
//         download_url: downloadUrl,
//         s3_key: s3Key,
//         format: fmt,
//       },
//       { status: 201 }
//     );
//   }),
// ];
