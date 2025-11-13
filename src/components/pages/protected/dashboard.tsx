import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Download,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { amplifyApi } from "@/api/amplify-api";
import type { Site, Alert, AlertsResponse } from "@/types/data-types";
import { Input } from "@/components/ui/input";

type IndicatorKey = "PUE" | "WUE" | "CUE";

type IndicatorSummary = {
  samples: number;
  ok: number;
  warn: number;
  crit: number;
  ok_pct: number;
  warn_pct: number;
  crit_pct: number;
  avg: number | null;
  min: number | null;
  max: number | null;
};

type ReportsSummary = {
  site_id: string;
  framework_code: string;
  period: { from: string; to: string };
  indicators: Record<IndicatorKey, IndicatorSummary>;
};

type SiteOverviewRow = {
  site_id: string;
  name: string;
  status: "compliant" | "warning" | "alert";
  pue_avg?: number | null;
  wue_avg?: number | null;
  cue_avg?: number | null;
};

const DEFAULT_FRAMEWORK_CODE = "GMDC_SG_2024";

function toIsoRange(dateFrom: string, dateTo: string) {
  const fromIso = `${dateFrom}T00:00:00Z`;
  const toIso = `${dateTo}T23:59:59Z`;
  return { fromIso, toIso };
}

function computeStatusFromSummary(
  s: ReportsSummary | null
): "compliant" | "warning" | "alert" {
  if (!s) return "compliant";
  const indicators = Object.values(s.indicators);
  const hasCrit = indicators.some((i) => i.crit > 0);
  if (hasCrit) return "alert";
  const hasWarn = indicators.some((i) => i.warn > 0);
  if (hasWarn) return "warning";
  return "compliant";
}

function formatNumber(x: number | null | undefined, digits = 2): string {
  if (x === null || x === undefined || Number.isNaN(x)) return "–";
  return x.toFixed(digits);
}

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [siteOverview, setSiteOverview] = useState<SiteOverviewRow[]>([]);

  const [isInitLoading, setIsInitLoading] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await amplifyApi.get<any>("BackendApi", "/sites");
        let loadedSites: Site[] = [];

        if (Array.isArray(res)) {
          loadedSites = res;
        } else if (res && Array.isArray(res.sites)) {
          loadedSites = res.sites;
        }

        setSites(loadedSites);
        if (loadedSites.length > 0) {
          setSelectedSiteId(loadedSites[0].site_id);
        }
      } catch (err) {
        console.error("Failed to load sites", err);
        toast.error("Failed to load sites");
      } finally {
        setIsInitLoading(false);
      }
    };

    loadSites();
  }, []);

  useEffect(() => {
    if (!selectedSiteId || !dateFrom || !dateTo) return;

    const loadSiteData = async () => {
      setIsLoadingMetrics(true);
      try {
        const { fromIso, toIso } = toIsoRange(dateFrom, dateTo);

        const [summaryRes, alertsRes] = await Promise.all([
          amplifyApi.get<ReportsSummary>("BackendApi", "/reports/summary", {
            site_id: selectedSiteId,
            framework_code: DEFAULT_FRAMEWORK_CODE,
            from: fromIso,
            to: toIso,
          }),
          amplifyApi.get<AlertsResponse>("BackendApi", "/alerts", {
            site_id: selectedSiteId,
            framework_code: DEFAULT_FRAMEWORK_CODE,
          }),
        ]);

        setSummary(summaryRes);
        setAlerts(alertsRes?.alerts ?? []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    loadSiteData();
  }, [selectedSiteId, dateFrom, dateTo]);

  useEffect(() => {
    const loadOverview = async () => {
      if (sites.length === 0 || !dateFrom || !dateTo) {
        setSiteOverview([]);
        return;
      }

      const { fromIso, toIso } = toIsoRange(dateFrom, dateTo);

      try {
        const results = await Promise.all(
          sites.map(async (s) => {
            try {
              const sum = await amplifyApi.get<ReportsSummary>(
                "BackendApi",
                "/reports/summary",
                {
                  site_id: s.site_id,
                  framework_code: DEFAULT_FRAMEWORK_CODE,
                  from: fromIso,
                  to: toIso,
                }
              );
              const status = computeStatusFromSummary(sum);

              return {
                site_id: s.site_id,
                name: s.name,
                status,
                pue_avg: sum.indicators.PUE.avg,
                wue_avg: sum.indicators.WUE.avg,
                cue_avg: sum.indicators.CUE.avg,
              } as SiteOverviewRow;
            } catch {
              return {
                site_id: s.site_id,
                name: s.name,
                status: "warning" as const,
              };
            }
          })
        );

        setSiteOverview(results);
      } catch (err) {
        console.error("Failed to load site overview", err);
      }
    };

    loadOverview();
  }, [sites, dateFrom, dateTo]);

  const currentSiteName =
    sites.find((s) => s.site_id === selectedSiteId)?.name ?? "Selected site";

  const activeAlertsCount = useMemo(
    () => alerts.filter((a) => a.status === "OPEN").length,
    [alerts]
  );

  const pueSummary = summary?.indicators?.PUE;
  const wueSummary = summary?.indicators?.WUE;
  const cueSummary = summary?.indicators?.CUE;

  const overallOkPct = useMemo(() => {
    if (!summary) return null;
    const vals = [
      summary.indicators.PUE.ok_pct,
      summary.indicators.WUE.ok_pct,
      summary.indicators.CUE.ok_pct,
    ];
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [summary]);

  async function handleGenerateReport(format: "csv" | "json") {
    if (!selectedSiteId) {
      toast.error("Select a site first");
      return;
    }
    if (!dateFrom || !dateTo) {
      toast.error("Please choose a date range");
      return;
    }

    const { fromIso, toIso } = toIsoRange(dateFrom, dateTo);

    setIsGeneratingReport(true);
    try {
      const res = await amplifyApi.post<{
        report_id: string;
        download_url: string;
        s3_key: string;
        format: string;
      }>("BackendApi", "/reports", {
        site_id: selectedSiteId,
        framework_code: DEFAULT_FRAMEWORK_CODE,
        from: fromIso,
        to: toIso,
        format,
      } as any);

      if (res.download_url) {
        window.open(res.download_url, "_blank", "noopener");
        toast.success("Report ready", {
          description: `Download started (${format.toUpperCase()}).`,
        });
      } else {
        toast.success("Report created", {
          description: `Report generated (${format.toUpperCase()})`,
        });
      }
    } catch (err) {
      console.error("Failed to generate report", err);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold text-balance">
          Sustainability Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor PUE / WUE / CUE, alerts and reports per site.
        </p>
      </div>

      {isInitLoading ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-2 h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[220px] w-full" />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-[2fr,3fr]">
            <Card>
              <CardHeader>
                <CardTitle>Journey 4 — Monitor & Alerts</CardTitle>
                <CardDescription>
                  Choose site and period to compute compliance summary.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site">Site</Label>
                  <Select
                    value={selectedSiteId}
                    onValueChange={setSelectedSiteId}
                  >
                    <SelectTrigger id="site">
                      <SelectValue placeholder="Select a site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((s) => (
                        <SelectItem key={s.site_id} value={s.site_id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{s.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="from">From</Label>
                    <Input
                      id="from"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to">To</Label>
                    <Input
                      id="to"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Facilities
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sites.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all regions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg PUE ({currentSiteName})
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(pueSummary?.avg)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min {formatNumber(pueSummary?.min)} · Max{" "}
                    {formatNumber(pueSummary?.max)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Compliance Health
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overallOkPct === null
                      ? "–"
                      : `${overallOkPct.toFixed(1)}% OK`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    % of samples within thresholds for PUE/WUE/CUE
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Alerts
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeAlertsCount}</div>
                  <p
                    className={
                      activeAlertsCount > 0
                        ? "text-xs text-destructive"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {activeAlertsCount > 0
                      ? "Requires attention"
                      : "No open alerts"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-[3fr,2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Indicator breakdown ({currentSiteName})</CardTitle>
                <CardDescription>
                  PUE / WUE / CUE samples, % OK vs WARN/CRIT for the period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics && !summary ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : !summary ? (
                  <p className="text-sm text-muted-foreground">
                    No data for this period yet.
                  </p>
                ) : (
                  <div className="space-y-4 text-sm">
                    {(["PUE", "WUE", "CUE"] as IndicatorKey[]).map((ind) => {
                      const indSummary = summary.indicators[ind];
                      const status =
                        indSummary.crit > 0
                          ? "alert"
                          : indSummary.warn > 0
                            ? "warning"
                            : "compliant";
                      return (
                        <div
                          key={ind}
                          className="rounded-md border p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{ind}</span>
                              <Badge
                                variant={
                                  status === "compliant"
                                    ? "default"
                                    : status === "warning"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className={
                                  status === "compliant"
                                    ? "bg-success text-success-foreground"
                                    : status === "warning"
                                      ? "bg-warning text-foreground"
                                      : ""
                                }
                              >
                                {status === "compliant"
                                  ? "OK"
                                  : status === "warning"
                                    ? "Warning"
                                    : "Alert"}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Avg {formatNumber(indSummary.avg)} · Min{" "}
                              {formatNumber(indSummary.min)} · Max{" "}
                              {formatNumber(indSummary.max)}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>OK</span>
                              <span>
                                {indSummary.ok} samples (
                                {formatNumber(indSummary.ok_pct, 1)}%)
                              </span>
                            </div>
                            <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className="bg-success"
                                style={{
                                  width: `${indSummary.ok_pct || 0}%`,
                                }}
                              />
                              <div
                                className="bg-warning"
                                style={{
                                  width: `${indSummary.warn_pct || 0}%`,
                                }}
                              />
                              <div
                                className="bg-destructive"
                                style={{
                                  width: `${indSummary.crit_pct || 0}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                WARN: {formatNumber(indSummary.warn_pct, 1)}% (
                                {indSummary.warn})
                              </span>
                              <span>
                                CRIT: {formatNumber(indSummary.crit_pct, 1)}% (
                                {indSummary.crit})
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>
                    Breaches against thresholds for this site & framework.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingMetrics && alerts.length === 0 ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No alerts for this selection yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {alerts.slice(0, 5).map((a) => {
                        const isCrit = a.severity === "CRIT";
                        const classes = isCrit
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-warning/30 bg-warning/5";
                        return (
                          <div
                            key={a.alert_id}
                            className={`flex items-start gap-3 rounded-lg border p-3 ${classes}`}
                          >
                            <AlertTriangle
                              className={`h-5 w-5 ${
                                isCrit ? "text-destructive" : "text-warning"
                              }`}
                            />
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {a.indicator} {a.severity} breach
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Observed: {a.observed_value} · Threshold:{" "}
                                {a.threshold_value}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {a.status} ·{" "}
                                {a.raised_at
                                  ? new Date(a.raised_at).toLocaleString()
                                  : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>
                    Generate CSV / JSON reports for regulators or internal ESG
                    teams.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          Compliance summary
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Period: {dateFrom} → {dateTo}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleGenerateReport("csv")}
                        disabled={isGeneratingReport}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateReport("json")}
                        disabled={isGeneratingReport}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        JSON
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reports are generated in S3 and exposed via a presigned
                    download link (valid ~1 hour). PDF layout can be layered on
                    top later.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Facility Overview</CardTitle>
              <CardDescription>
                Current status of all monitored sites for the selected period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {siteOverview.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No facilities or summaries available yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {siteOverview.map((f) => (
                    <div
                      key={f.site_id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            {f.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            PUE: {formatNumber(f.pue_avg)} · WUE:{" "}
                            {formatNumber(f.wue_avg)} · CUE:{" "}
                            {formatNumber(f.cue_avg)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          f.status === "compliant"
                            ? "default"
                            : f.status === "warning"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          f.status === "compliant"
                            ? "bg-success text-success-foreground"
                            : f.status === "warning"
                              ? "bg-warning text-foreground"
                              : ""
                        }
                      >
                        {f.status === "compliant"
                          ? "Compliant"
                          : f.status === "warning"
                            ? "Warning"
                            : "Alert"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AppLayout>
  );
}
