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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Save,
  Building2,
  ArrowUp,
  ArrowDown,
  Info,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { amplifyApi } from "@/api/amplify-api";
import type {
  Framework,
  Site,
  FrameworksResponse,
  SiteFrameworksResponse,
  ThresholdsResponse,
  ThresholdRule,
  AlertsResponse,
  Alert,
} from "@/types/data-types";

type PueMode = "STATIC" | "LOAD_AWARE";
type Severity = "WARN" | "CRIT";
type Indicator = "PUE" | "WUE" | "CUE";

interface FrameworkPresetMeta {
  code: string;
  displayName: string;
  description: string;
  defaultPueMode: PueMode;
  supportsLoadAware: boolean;
}

const GRID_EF_SG = 0.4057;

const FRAMEWORK_PRESETS_META: Record<string, FrameworkPresetMeta> = {
  GMDC_SG_2024: {
    code: "GMDC_SG_2024",
    displayName: "GMDC_SG_2024 (Singapore Green Mark)",
    description:
      "Aligns to BCA–IMDA Green Mark bands. Platinum ≈ WARN; GoldPLUS ≈ CRIT.",
    defaultPueMode: "LOAD_AWARE",
    supportsLoadAware: true,
  },
  CORP_DEFAULT: {
    code: "CORP_DEFAULT",
    displayName: "CORP_DEFAULT (Company baseline)",
    description:
      "Slightly tighter than GMDC, simple static PUE/WUE/CUE thresholds.",
    defaultPueMode: "STATIC",
    supportsLoadAware: false,
  },
  SLA_STRICT: {
    code: "SLA_STRICT",
    displayName: "SLA_STRICT (Premium SLA)",
    description:
      "Strict thresholds for premium or customer SLA sites, static PUE/WUE/CUE.",
    defaultPueMode: "STATIC",
    supportsLoadAware: false,
  },
};

type SiteFrameworkAssignment = {
  framework_code: string;
  framework_name: string;
  is_active: boolean;
  precedence: number;
};

const DEFAULT_FRAMEWORK_CODE = "GMDC_SG_2024";

function buildGmdcRules(pueMode: PueMode): ThresholdRule[] {
  const pueBands = [
    { band: 25, warn: 1.39, crit: 1.46 },
    { band: 50, warn: 1.33, crit: 1.39 },
    { band: 75, warn: 1.29, crit: 1.36 },
    { band: 100, warn: 1.28, crit: 1.35 },
  ];

  const rules: ThresholdRule[] = [];

  if (pueMode === "LOAD_AWARE") {
    for (const b of pueBands) {
      rules.push(
        {
          indicator: "PUE",
          comparator: "<=",
          severity: "WARN",
          value: b.warn,
          load_band: b.band,
        },
        {
          indicator: "PUE",
          comparator: "<=",
          severity: "CRIT",
          value: b.crit,
          load_band: b.band,
        }
      );
    }
  } else {
    const b100 = pueBands.find((b) => b.band === 100)!;
    rules.push(
      {
        indicator: "PUE",
        comparator: "<=",
        severity: "WARN",
        value: b100.warn,
        load_band: null,
      },
      {
        indicator: "PUE",
        comparator: "<=",
        severity: "CRIT",
        value: b100.crit,
        load_band: null,
      }
    );
  }

  rules.push(
    {
      indicator: "WUE",
      comparator: "<=",
      severity: "WARN",
      value: 2.0,
      load_band: null,
    },
    {
      indicator: "WUE",
      comparator: "<=",
      severity: "CRIT",
      value: 2.2,
      load_band: null,
    }
  );

  if (pueMode === "LOAD_AWARE") {
    for (const b of pueBands) {
      rules.push(
        {
          indicator: "CUE",
          comparator: "<=",
          severity: "WARN",
          value: parseFloat((b.warn * GRID_EF_SG).toFixed(3)),
          load_band: b.band,
        },
        {
          indicator: "CUE",
          comparator: "<=",
          severity: "CRIT",
          value: parseFloat((b.crit * GRID_EF_SG).toFixed(3)),
          load_band: b.band,
        }
      );
    }
  } else {
    const b100 = pueBands.find((b) => b.band === 100)!;
    rules.push(
      {
        indicator: "CUE",
        comparator: "<=",
        severity: "WARN",
        value: parseFloat((b100.warn * GRID_EF_SG).toFixed(3)),
        load_band: null,
      },
      {
        indicator: "CUE",
        comparator: "<=",
        severity: "CRIT",
        value: parseFloat((b100.crit * GRID_EF_SG).toFixed(3)),
        load_band: null,
      }
    );
  }

  return rules;
}

function buildCorpDefaultRules(): ThresholdRule[] {
  return [
    {
      indicator: "PUE",
      comparator: "<=",
      severity: "WARN",
      value: 1.35,
      load_band: null,
    },
    {
      indicator: "PUE",
      comparator: "<=",
      severity: "CRIT",
      value: 1.4,
      load_band: null,
    },
    // WUE static
    {
      indicator: "WUE",
      comparator: "<=",
      severity: "WARN",
      value: 1.9,
      load_band: null,
    },
    {
      indicator: "WUE",
      comparator: "<=",
      severity: "CRIT",
      value: 2.1,
      load_band: null,
    },
    {
      indicator: "CUE",
      comparator: "<=",
      severity: "WARN",
      value: parseFloat((1.35 * GRID_EF_SG).toFixed(3)),
      load_band: null,
    },
    {
      indicator: "CUE",
      comparator: "<=",
      severity: "CRIT",
      value: parseFloat((1.4 * GRID_EF_SG).toFixed(3)),
      load_band: null,
    },
  ];
}

function buildSlaStrictRules(): ThresholdRule[] {
  return [
    {
      indicator: "PUE",
      comparator: "<=",
      severity: "WARN",
      value: 1.3,
      load_band: null,
    },
    {
      indicator: "PUE",
      comparator: "<=",
      severity: "CRIT",
      value: 1.35,
      load_band: null,
    },
    {
      indicator: "WUE",
      comparator: "<=",
      severity: "WARN",
      value: 1.8,
      load_band: null,
    },
    {
      indicator: "WUE",
      comparator: "<=",
      severity: "CRIT",
      value: 2.0,
      load_band: null,
    },
    {
      indicator: "CUE",
      comparator: "<=",
      severity: "WARN",
      value: parseFloat((1.3 * GRID_EF_SG).toFixed(3)),
      load_band: null,
    },
    {
      indicator: "CUE",
      comparator: "<=",
      severity: "CRIT",
      value: parseFloat((1.35 * GRID_EF_SG).toFixed(3)),
      load_band: null,
    },
  ];
}

function buildPresetRules(
  frameworkCode: string,
  pueMode: PueMode
): ThresholdRule[] {
  switch (frameworkCode) {
    case "GMDC_SG_2024":
      return buildGmdcRules(pueMode);
    case "CORP_DEFAULT":
      return buildCorpDefaultRules();
    case "SLA_STRICT":
      return buildSlaStrictRules();
    default:
      return [];
  }
}

export default function CompliancePage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<string>("");

  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworkAssignments, setFrameworkAssignments] = useState<
    SiteFrameworkAssignment[]
  >([]);

  const [selectedFrameworkCode, setSelectedFrameworkCode] = useState<string>(
    DEFAULT_FRAMEWORK_CODE
  );

  const [thresholds, setThresholds] = useState<ThresholdsResponse | null>(null);
  const [editableRules, setEditableRules] = useState<ThresholdRule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [pueMode, setPueMode] = useState<PueMode>("LOAD_AWARE");

  const [isInitLoading, setIsInitLoading] = useState(true);
  const [isLoadingSiteData, setIsLoadingSiteData] = useState(false);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);
  const [isSavingFrameworks, setIsSavingFrameworks] = useState(false);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const [frameworksRes, sitesRes] = await Promise.all([
          amplifyApi.get<FrameworksResponse>("BackendApi", "/frameworks"),
          amplifyApi.get<Site[]>("BackendApi", "/sites"),
        ]);

        setFrameworks(frameworksRes.frameworks ?? []);
        setSites(Array.isArray(sitesRes) ? sitesRes : [sitesRes]);

        if (Array.isArray(sitesRes) && sitesRes.length > 0) {
          setSiteId(sitesRes[0].site_id);
        } else if (!Array.isArray(sitesRes) && sitesRes) {
          setSiteId((sitesRes as Site).site_id);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
        toast.error("Failed to load initial data");
      } finally {
        setIsInitLoading(false);
      }
    };

    loadInit();
  }, []);

  useEffect(() => {
    if (!siteId) return;

    const loadSiteData = async () => {
      setIsLoadingSiteData(true);
      try {
        const [siteFwRes, thresholdsRes, alertsRes] = await Promise.all([
          amplifyApi.get<SiteFrameworksResponse>(
            "BackendApi",
            "/site_frameworks",
            { site_id: siteId }
          ),
          amplifyApi.get<ThresholdsResponse>("BackendApi", "/thresholds", {
            site_id: siteId,
            framework_code: selectedFrameworkCode || DEFAULT_FRAMEWORK_CODE,
          }),
          amplifyApi.get<AlertsResponse>("BackendApi", "/alerts", {
            site_id: siteId,
            framework_code: selectedFrameworkCode || DEFAULT_FRAMEWORK_CODE,
          }),
        ]);

        const currentAssignments: SiteFrameworkAssignment[] = (
          siteFwRes?.frameworks ?? []
        ).map((f) => ({
          framework_code: f.framework_code,
          framework_name: f.framework_name,
          is_active: f.is_active,
          precedence: f.precedence,
        }));

        const knownPresetCodes = Object.keys(FRAMEWORK_PRESETS_META);
        for (const code of knownPresetCodes) {
          if (!currentAssignments.find((a) => a.framework_code === code)) {
            const fw = frameworks.find((f) => f.framework_code === code);
            currentAssignments.push({
              framework_code: code,
              framework_name: fw?.name ?? code,
              is_active: false,
              precedence: 999,
            });
          }
        }

        currentAssignments.sort((a, b) => a.precedence - b.precedence);
        setFrameworkAssignments(currentAssignments);

        setThresholds(thresholdsRes);
        setEditableRules(thresholdsRes?.rules ?? []);
        setAlerts(alertsRes?.alerts ?? []);
      } catch (err) {
        console.error("Failed to load site data", err);
        toast.error("Failed to load site thresholds/alerts");
      } finally {
        setIsLoadingSiteData(false);
      }
    };

    loadSiteData();
  }, [siteId, selectedFrameworkCode, frameworks]);

  const activeAssignments = useMemo(
    () => frameworkAssignments.filter((a) => a.is_active),
    [frameworkAssignments]
  );

  const currentFrameworkMeta: FrameworkPresetMeta | undefined = useMemo(() => {
    return FRAMEWORK_PRESETS_META[selectedFrameworkCode];
  }, [selectedFrameworkCode]);

  useEffect(() => {
    if (!currentFrameworkMeta) return;
    if (!currentFrameworkMeta.supportsLoadAware && pueMode === "LOAD_AWARE") {
      setPueMode("STATIC");
    } else {
      setPueMode(currentFrameworkMeta.defaultPueMode);
    }
  }, [currentFrameworkMeta]);

  const handleSiteChange = (value: string) => {
    setSiteId(value);
  };

  const handleToggleActiveFramework = (code: string) => {
    setFrameworkAssignments((prev) =>
      prev.map((a) =>
        a.framework_code === code ? { ...a, is_active: !a.is_active } : a
      )
    );
  };

  const handleMoveFramework = (code: string, direction: "up" | "down") => {
    setFrameworkAssignments((prev) => {
      const idx = prev.findIndex((a) => a.framework_code === code);
      if (idx === -1) return prev;
      const newArr = [...prev];
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= newArr.length) return prev;
      const tmp = newArr[idx];
      newArr[idx] = newArr[swapWith];
      newArr[swapWith] = tmp;
      return newArr.map((a, i) => ({ ...a, precedence: (i + 1) * 10 }));
    });
  };

  const handleApplyPreset = async () => {
    if (!siteId || !selectedFrameworkCode) return;
    if (!currentFrameworkMeta) {
      toast.error("No preset metadata for this framework");
      return;
    }
    setIsApplyingPreset(true);
    try {
      const newRules = buildPresetRules(selectedFrameworkCode, pueMode);
      setEditableRules(newRules);

      toast.success("Preset applied", {
        description:
          "Preset thresholds populated. Review and click Save thresholds to persist.",
      });
    } finally {
      setIsApplyingPreset(false);
    }
  };

  const handleRuleValueChange = (idx: number, value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    setEditableRules((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, value: numeric } : r))
    );
  };

  const handleSaveThresholds = async () => {
    if (!siteId || !selectedFrameworkCode) return;
    if (!editableRules.length) {
      toast.error("No thresholds to save");
      return;
    }

    setIsSavingThresholds(true);
    try {
      await amplifyApi.post<unknown>("BackendApi", "/thresholds", {
        site_id: siteId,
        framework_code: selectedFrameworkCode,
        rules: editableRules.map((r) => ({
          indicator: r.indicator,
          comparator: r.comparator,
          severity: r.severity,
          value: r.value,
          load_band: r.load_band ?? null,
        })),
      });

      toast.success("Thresholds saved", {
        description:
          "Thresholds were upserted for this site and framework. Alerts will be evaluated in Journey 3.",
      });

      const thresholdsRes = await amplifyApi.get<ThresholdsResponse>(
        "BackendApi",
        "/thresholds",
        {
          site_id: siteId,
          framework_code: selectedFrameworkCode,
        }
      );
      setThresholds(thresholdsRes);
      setEditableRules(thresholdsRes.rules ?? []);
    } catch (err) {
      console.error("Failed to save thresholds", err);
      toast.error("Failed to save thresholds");
    } finally {
      setIsSavingThresholds(false);
    }
  };

  const handleSaveFrameworkAssignments = async () => {
    if (!siteId) return;
    setIsSavingFrameworks(true);
    try {
      const active = frameworkAssignments.filter((a) => a.is_active);
      await amplifyApi.post<unknown>("BackendApi", "/site_frameworks", {
        site_id: siteId,
        assignments: active.map((a) => ({
          framework_code: a.framework_code,
          is_active: a.is_active,
          precedence: a.precedence,
        })),
      });

      toast.success("Frameworks updated", {
        description:
          "Active frameworks and precedence saved. Ops banner will follow highest precedence framework.",
      });
    } catch (err) {
      console.error("Failed to save frameworks", err);
      toast.error("Failed to save frameworks");
    } finally {
      setIsSavingFrameworks(false);
    }
  };

  const currentSiteName =
    sites.find((s) => s.site_id === siteId)?.name ?? "Selected site";

  return (
    <AppLayout>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-balance">
          Thresholds & Frameworks
        </h1>
        <p className="text-muted-foreground pb-4">
          Configure multi-framework sustainability thresholds for each site.
        </p>
      </div>

      {isInitLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Step 1: Select site */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  1
                </div>
                <div className="flex flex-col gap-2 justify-center w-full">
                  <CardTitle>Select Site</CardTitle>
                  <CardDescription>
                    Choose the site to configure framework thresholds.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 flex flex-col gap-1 justify-center w-full">
                <Label htmlFor="facility">Site</Label>
                <Select value={siteId} onValueChange={handleSiteChange}>
                  <SelectTrigger id="facility">
                    <div className="flex justify-center w-full">
                      <SelectValue placeholder="Select a site" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem
                        key={site.site_id}
                        value={site.site_id}
                        className="flex justify-center w-full"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {site.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Multi-framework selection & precedence */}
          {siteId && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    2
                  </div>
                  <div className="flex flex-col gap-2 justify-center w-full">
                    <CardTitle>Frameworks & Precedence</CardTitle>
                    <CardDescription>
                      Activate one or more frameworks for this site. Lowest
                      precedence number = highest priority for ops banner.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSiteData ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Active frameworks</Label>
                      <p className="text-xs text-muted-foreground">
                        CRIT overrides WARN. When multiple frameworks are
                        active, ops view will follow the highest-precedence
                        framework, while compliance reports remain
                        framework-specific.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {frameworkAssignments.map((a) => {
                        const presetMeta =
                          FRAMEWORK_PRESETS_META[a.framework_code];
                        return (
                          <div
                            key={a.framework_code}
                            className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <input
                                  id={`fw-${a.framework_code}`}
                                  type="checkbox"
                                  checked={a.is_active}
                                  onChange={() =>
                                    handleToggleActiveFramework(
                                      a.framework_code
                                    )
                                  }
                                  className="h-4 w-4"
                                />
                                <Label
                                  htmlFor={`fw-${a.framework_code}`}
                                  className="font-medium"
                                >
                                  {presetMeta?.displayName ??
                                    a.framework_name ??
                                    a.framework_code}
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {presetMeta?.description ||
                                  "Framework configured in the database."}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Precedence: {a.precedence}
                              </Badge>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  handleMoveFramework(a.framework_code, "up")
                                }
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  handleMoveFramework(a.framework_code, "down")
                                }
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveFrameworkAssignments}
                        disabled={isSavingFrameworks}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isSavingFrameworks ? "Saving..." : "Save frameworks"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Thresholds for a selected framework */}
          {siteId && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    3
                  </div>
                  <div className="flex flex-col gap-2 justify-center w-full">
                    <CardTitle>Thresholds per Framework</CardTitle>
                    <CardDescription>
                      Choose a framework, set PUE mode, apply presets, then
                      tweak and save thresholds for{" "}
                      <span className="font-medium">{currentSiteName}</span>.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Framework selector for editing context */}
                <div className="space-y-2">
                  <Label htmlFor="framework-select">
                    Framework to configure
                  </Label>
                  <Select
                    value={selectedFrameworkCode}
                    onValueChange={setSelectedFrameworkCode}
                  >
                    <SelectTrigger id="framework-select">
                      <SelectValue placeholder="Select a framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(FRAMEWORK_PRESETS_META).map((code) => (
                        <SelectItem key={code} value={code}>
                          {FRAMEWORK_PRESETS_META[code].displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentFrameworkMeta && (
                    <p className="text-xs text-muted-foreground">
                      {currentFrameworkMeta.description}
                    </p>
                  )}
                </div>

                {/* PUE mode toggle */}
                {currentFrameworkMeta && (
                  <div className="space-y-2">
                    <Label>PUE mode</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={pueMode === "STATIC" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPueMode("STATIC")}
                      >
                        Static (single PUE limit)
                      </Button>
                      <Button
                        type="button"
                        variant={
                          pueMode === "LOAD_AWARE" ? "default" : "outline"
                        }
                        size="sm"
                        disabled={!currentFrameworkMeta.supportsLoadAware}
                        onClick={() => setPueMode("LOAD_AWARE")}
                      >
                        Load-aware (25/50/75/100% IT load)
                      </Button>
                    </div>
                    {!currentFrameworkMeta.supportsLoadAware && (
                      <p className="text-xs text-muted-foreground">
                        This framework uses static PUE thresholds only.
                      </p>
                    )}
                  </div>
                )}

                {/* Apply preset */}
                <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>
                      Comparator is{" "}
                      <code className="px-1 py-0.5 text-xs rounded bg-background border">
                        {"<="}
                      </code>
                      . A breach occurs when measured value{" "}
                      <strong>&gt; threshold</strong>. CRIT overrides WARN.
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyPreset}
                    disabled={isApplyingPreset || !currentFrameworkMeta}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    {isApplyingPreset ? "Applying..." : "Apply preset"}
                  </Button>
                </div>

                {/* Thresholds list / editor */}
                {isLoadingSiteData ? (
                  <Skeleton className="h-32 w-full" />
                ) : editableRules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No thresholds configured yet for this framework. Apply a
                    preset to start.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Threshold rules</Label>
                      {thresholds?.rules && thresholds.rules.length > 0 && (
                        <Badge variant="outline">
                          Loaded {thresholds.rules.length} rule
                          {thresholds.rules.length === 1 ? "" : "s"} from
                          backend
                        </Badge>
                      )}
                    </div>
                    <div className="rounded-md border overflow-hidden">
                      <div className="grid grid-cols-5 gap-2 border-b bg-muted px-3 py-2 text-xs font-medium">
                        <div>Indicator</div>
                        <div>Severity</div>
                        <div>Load band</div>
                        <div>Comparator</div>
                        <div>Threshold value</div>
                      </div>
                      {editableRules.map((r, idx) => (
                        <div
                          key={`${r.indicator}-${r.severity}-${r.load_band ?? "null"}-${idx}`}
                          className="grid grid-cols-5 gap-2 border-b px-3 py-2 text-xs items-center"
                        >
                          <div className="font-medium">{r.indicator}</div>
                          <div>
                            <Badge
                              variant={
                                r.severity === "CRIT"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="uppercase"
                            >
                              {r.severity}
                            </Badge>
                          </div>
                          <div>{r.load_band ?? "—"}</div>
                          <div>
                            <code className="rounded border bg-background px-1 py-0.5">
                              {r.comparator}
                            </code>
                          </div>
                          <div>
                            <Input
                              type="number"
                              step="0.001"
                              value={r.value}
                              onChange={(e) =>
                                handleRuleValueChange(idx, e.target.value)
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hysteresis and clear policy (2% band, 3 good samples
                      before clearing) will be implemented in Journey 3 on the
                      metric ingestion side.
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveThresholds}
                    disabled={isSavingThresholds || editableRules.length === 0}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingThresholds ? "Saving..." : "Save thresholds"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {siteId && alerts && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    4
                  </div>
                  <div className="flex flex-col gap-2 justify-center w-full">
                    <CardTitle>Alerts (read-only, Journey 2)</CardTitle>
                    <CardDescription>
                      Current alerts for this site and framework. Fully
                      automated ingestion.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No alerts for this selection yet.
                  </p>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <div className="grid grid-cols-6 gap-2 border-b bg-muted px-3 py-2 text-xs font-medium">
                      <div>Indicator</div>
                      <div>Severity</div>
                      <div>Observed</div>
                      <div>Threshold</div>
                      <div>Status</div>
                      <div>Raised at</div>
                    </div>
                    {alerts.slice(0, 10).map((a) => (
                      <div
                        key={a.alert_id}
                        className="grid grid-cols-6 gap-2 border-b px-3 py-2 text-xs"
                      >
                        <div>{a.indicator}</div>
                        <div>
                          <Badge
                            variant={
                              a.severity === "CRIT" ? "destructive" : "outline"
                            }
                            className="uppercase"
                          >
                            {a.severity}
                          </Badge>
                        </div>
                        <div>{a.observed_value}</div>
                        <div>{a.threshold_value}</div>
                        <div>{a.status}</div>
                        <div>{a.raised_at}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
}
