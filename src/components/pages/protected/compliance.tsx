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
  X,
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
  SiteResponse,
} from "@/types/data-types";
import { EcoMultiSelectWithTabs } from "@/components/common/EcoMultiSelect";

type PueMode = "STATIC" | "LOAD_AWARE";
type AlertStatusFilter = "ALL" | "OPEN" | "CLEARED";

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
  GDCR_SG_2034: {
    code: "GDCR_SG_2034",
    displayName: "GDCR_SG_2034 (SG Green DC Roadmap)",
    description:
      "Singapore Green Data Centre Roadmap targets for PUE/WUE/CUE at 100% IT load.",
    defaultPueMode: "STATIC",
    supportsLoadAware: false,
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
        load_band: b100.band,
      },
      {
        indicator: "PUE",
        comparator: "<=",
        severity: "CRIT",
        value: b100.crit,
        load_band: b100.band,
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

  rules.push(
    {
      indicator: "CUE",
      comparator: "<=",
      severity: "WARN",
      value: 0.564,
      load_band: null,
    },
    {
      indicator: "CUE",
      comparator: "<=",
      severity: "CRIT",
      value: 0.592,
      load_band: null,
    }
  );

  return rules;
}

function buildGdcrRules(): ThresholdRule[] {
  return [
    {
      indicator: "PUE",
      comparator: "<=",
      severity: "WARN",
      value: 1.3,
      load_band: 50,
    },
    {
      indicator: "WUE",
      comparator: "<=",
      severity: "WARN",
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
  ];
}

function buildCorpDefaultRules(): ThresholdRule[] {
  return [
    {
      indicator: "PUE",
      comparator: "<=",
      severity: "WARN",
      value: 1.35,
      load_band: 60,
    },
    {
      indicator: "PUE",
      comparator: "<=",
      severity: "CRIT",
      value: 1.4,
      load_band: 75,
    },
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
      load_band: 75,
    },
    {
      indicator: "PUE",
      comparator: "<=",
      severity: "CRIT",
      value: 1.35,
      load_band: 75,
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
    case "GDCR_SG_2034":
      return buildGdcrRules();
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

  const [draggedFrameworkCode, setDraggedFrameworkCode] = useState<
    string | null
  >(null);

  const [alertStatusFilter, setAlertStatusFilter] =
    useState<AlertStatusFilter>("ALL");

  useEffect(() => {
    const loadInit = async () => {
      try {
        const [frameworksRes, sitesRes] = await Promise.all([
          amplifyApi.get<FrameworksResponse>("BackendApi", "/frameworks"),
          amplifyApi.get<SiteResponse>("BackendApi", "/sites"),
        ]);

        setFrameworks(frameworksRes.frameworks ?? []);
        setSites((sitesRes.sites ?? []) as Site[]);

        if (sitesRes.sites && sitesRes.sites.length > 0) {
          setSiteId(sitesRes.sites[0].site_id);
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

        let currentAssignments: SiteFrameworkAssignment[] = (
          siteFwRes?.frameworks ?? []
        ).map((f) => ({
          framework_code: f.framework_code,
          framework_name: f.framework_name,
          is_active: f.is_active,
          precedence: f.precedence,
        }));

        const byCode: Record<string, SiteFrameworkAssignment> = {};
        currentAssignments.forEach((a) => {
          byCode[a.framework_code] = a;
        });

        const mergedAssignments: SiteFrameworkAssignment[] = frameworks.map(
          (f, index) => {
            const existing = byCode[f.framework_code];
            return (
              existing ?? {
                framework_code: f.framework_code,
                framework_name: f.name,
                is_active: false,
                precedence: (index + 1) * 10,
              }
            );
          }
        );

        mergedAssignments.sort((a, b) => a.precedence - b.precedence);
        setFrameworkAssignments(mergedAssignments);

        const activeCodes = mergedAssignments
          .filter((a) => a.is_active)
          .map((a) => a.framework_code);

        // keep current selection if still valid; otherwise pick a sensible default
        setSelectedFrameworkCode((prev) => {
          const hasPrev = prev
            ? mergedAssignments.some((a) => a.framework_code === prev)
            : false;

          if (hasPrev) return prev;
          if (activeCodes.length > 0) return activeCodes[0];
          if (mergedAssignments.length > 0)
            return mergedAssignments[0].framework_code;

          return DEFAULT_FRAMEWORK_CODE;
        });

        setThresholds(thresholdsRes);
        if (thresholdsRes?.rules && thresholdsRes.rules.length > 0) {
          setEditableRules(thresholdsRes.rules);
        } else {
          // no thresholds yet – seed from preset
          const meta = FRAMEWORK_PRESETS_META[selectedFrameworkCode];
          const defaultMode = meta?.defaultPueMode ?? "STATIC";
          setPueMode(defaultMode);
          const presetRules = buildPresetRules(
            selectedFrameworkCode,
            defaultMode
          );
          setEditableRules(presetRules);
        }

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
    () =>
      frameworkAssignments
        .filter((a) => a.is_active)
        .sort((a, b) => a.precedence - b.precedence),
    [frameworkAssignments]
  );

  // derive active framework codes from assignments – single source of truth
  const activeFrameworkCodes = useMemo(
    () => activeAssignments.map((a) => a.framework_code),
    [activeAssignments]
  );

  const currentFrameworkMeta: FrameworkPresetMeta | undefined = useMemo(() => {
    if (!selectedFrameworkCode) return undefined;
    return FRAMEWORK_PRESETS_META[selectedFrameworkCode];
  }, [selectedFrameworkCode]);

  const handleMultiSelectChange = (codes: string[]) => {
    setFrameworkAssignments((prev) => {
      const prevByCode: Record<string, SiteFrameworkAssignment> = {};
      prev.forEach((a) => {
        prevByCode[a.framework_code] = a;
      });

      const next: SiteFrameworkAssignment[] = frameworks.map((f, index) => {
        const existing = prevByCode[f.framework_code];
        const isActive = codes.includes(f.framework_code);
        return {
          framework_code: f.framework_code,
          framework_name: f.name,
          is_active: isActive,
          precedence:
            existing?.precedence !== undefined
              ? existing.precedence
              : (index + 1) * 10,
        };
      });

      next.sort((a, b) => a.precedence - b.precedence);
      return next;
    });

    setSelectedFrameworkCode((prev) => {
      if (!codes.length) return prev || DEFAULT_FRAMEWORK_CODE;
      if (prev && codes.includes(prev)) return prev;
      return codes[0];
    });
  };

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

  const handleMoveFramework = (code: string, direction: "up" | "down") => {
    setFrameworkAssignments((prev) => {
      const active = prev.filter((a) => a.is_active);
      const inactive = prev.filter((a) => !a.is_active);
      const idx = active.findIndex((a) => a.framework_code === code);
      if (idx === -1) return prev;
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= active.length) return prev;
      const reordered = [...active];
      const tmp = reordered[idx];
      reordered[idx] = reordered[swapWith];
      reordered[swapWith] = tmp;
      const combined = [...reordered, ...inactive];
      return combined
        .map((a, i) => ({ ...a, precedence: (i + 1) * 10 }))
        .sort((a, b) => a.precedence - b.precedence);
    });
  };

  const handleDropFramework = (targetCode: string) => {
    if (!draggedFrameworkCode || draggedFrameworkCode === targetCode) return;
    setFrameworkAssignments((prev) => {
      const active = prev.filter((a) => a.is_active);
      const inactive = prev.filter((a) => !a.is_active);

      const fromIndex = active.findIndex(
        (a) => a.framework_code === draggedFrameworkCode
      );
      const toIndex = active.findIndex((a) => a.framework_code === targetCode);

      if (fromIndex === -1 || toIndex === -1) return prev;

      const reordered = [...active];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      const combined = [...reordered, ...inactive];
      return combined
        .map((a, i) => ({ ...a, precedence: (i + 1) * 10 }))
        .sort((a, b) => a.precedence - b.precedence);
    });
    setDraggedFrameworkCode(null);
  };

  const handleRemoveFramework = (code: string) => {
    setFrameworkAssignments((prev) =>
      prev.map((a) =>
        a.framework_code === code ? { ...a, is_active: false } : a
      )
    );
    setSelectedFrameworkCode((prev) => {
      if (prev !== code) return prev;
      const remaining = activeAssignments
        .filter((a) => a.framework_code !== code)
        .map((a) => a.framework_code);
      if (remaining.length > 0) return remaining[0];
      return DEFAULT_FRAMEWORK_CODE;
    });
  };

  const handleApplyPreset = async () => {
    if (!selectedFrameworkCode) return;
    const meta = FRAMEWORK_PRESETS_META[selectedFrameworkCode];
    if (!meta) {
      toast.error("No preset metadata for this framework");
      return;
    }
    setIsApplyingPreset(true);
    try {
      const newRules = buildPresetRules(selectedFrameworkCode, pueMode);
      if (!newRules.length) {
        toast.error("No preset rules for this framework");
      } else {
        setEditableRules(newRules);
        toast.success("Preset applied", {
          description:
            "Preset thresholds populated. Review and click Save thresholds to persist.",
        });
      }
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

  const handleReloadThresholds = async () => {
    if (!siteId || !selectedFrameworkCode) return;
    try {
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
      toast.success("Thresholds reloaded from saved");
    } catch (err) {
      console.error("Failed to reload thresholds", err);
      toast.error("Failed to reload thresholds");
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

  const handlePrecedenceInputChange = (code: string, value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    setFrameworkAssignments((prev) => {
      const next = prev.map((a) =>
        a.framework_code === code ? { ...a, precedence: numeric } : a
      );
      next.sort((a, b) => a.precedence - b.precedence);
      return next;
    });
  };

  const currentSiteName =
    sites.find((s) => s.site_id === siteId)?.name ?? "Selected site";

  const frameworksForThresholdSelect =
    activeAssignments.length > 0 ? activeAssignments : frameworkAssignments;

  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    if (alertStatusFilter === "ALL") return alerts;
    return alerts.filter((a) => a.status === alertStatusFilter);
  }, [alerts, alertStatusFilter]);

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
                      Activate one or more frameworks for this site. Drag to set
                      precedence: lower numbers are higher priority in the ops
                      banner.
                    </CardDescription>
                    <EcoMultiSelectWithTabs
                      options={frameworks.map((f) => ({
                        label: `${f.name}${f.notes ? ` (${f.notes})` : ""}`,
                        value: f.framework_code,
                        group: f.jurisdiction ?? "Global",
                      }))}
                      value={activeFrameworkCodes}
                      onChange={handleMultiSelectChange}
                      placeholder="Select frameworks"
                    />
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
                        When multiple frameworks are active, all thresholds are
                        evaluated, but the ops banner follows the
                        highest-precedence framework. Compliance reports remain
                        framework-specific.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {activeAssignments.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No active frameworks selected yet.
                        </p>
                      ) : (
                        activeAssignments.map((a) => {
                          const presetMeta =
                            FRAMEWORK_PRESETS_META[a.framework_code];
                          return (
                            <div
                              key={a.framework_code}
                              className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
                              draggable
                              onDragStart={() =>
                                setDraggedFrameworkCode(a.framework_code)
                              }
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() =>
                                handleDropFramework(a.framework_code)
                              }
                            >
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="cursor-grab text-xs text-muted-foreground">
                                    ⠿
                                  </span>
                                  <span className="font-medium">
                                    {presetMeta?.displayName ??
                                      a.framework_name ??
                                      a.framework_code}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {presetMeta?.description ||
                                    "Framework configured in the database."}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">
                                    Precedence
                                  </span>
                                  <Input
                                    type="number"
                                    className="h-7 w-20 px-2 py-1 text-xs"
                                    value={a.precedence}
                                    onChange={(e) =>
                                      handlePrecedenceInputChange(
                                        a.framework_code,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
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
                                    handleMoveFramework(
                                      a.framework_code,
                                      "down"
                                    )
                                  }
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    handleRemoveFramework(a.framework_code)
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
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

          {siteId && frameworksForThresholdSelect.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    3
                  </div>
                  <div className="flex flex-col gap-2 justify-center w-full">
                    <CardTitle>Thresholds for {currentSiteName}</CardTitle>
                    <CardDescription>
                      Choose PUE mode, apply a preset per framework, and fine
                      tune PUE/WUE/CUE thresholds.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Framework</Label>
                    <Select
                      value={selectedFrameworkCode}
                      onValueChange={setSelectedFrameworkCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworksForThresholdSelect.map((a) => {
                          const presetMeta =
                            FRAMEWORK_PRESETS_META[a.framework_code];
                          const label =
                            presetMeta?.displayName ?? a.framework_name;
                          return (
                            <SelectItem
                              key={a.framework_code}
                              value={a.framework_code}
                            >
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>PUE mode</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={pueMode === "STATIC" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPueMode("STATIC")}
                      >
                        Static (single PUE)
                      </Button>
                      <Button
                        variant={
                          pueMode === "LOAD_AWARE" ? "default" : "outline"
                        }
                        size="sm"
                        disabled={!currentFrameworkMeta?.supportsLoadAware}
                        onClick={() => setPueMode("LOAD_AWARE")}
                      >
                        Load-aware (25/50/75/100%)
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3" />
                  <p>
                    Comparator is{" "}
                    <span className="font-mono text-[11px]">&lt;=</span>. A
                    breach occurs when the measured value is greater than the
                    threshold.{" "}
                    <span className="font-semibold">CRIT overrides WARN.</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyPreset}
                    disabled={isApplyingPreset || !currentFrameworkMeta}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    {isApplyingPreset ? "Applying preset..." : "Apply preset"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReloadThresholds}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Reload from saved
                  </Button>
                </div>

                {editableRules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No thresholds defined yet for this framework. Apply a preset
                    or add rules via the backend configuration.
                  </p>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <div className="grid grid-cols-6 gap-2 border-b bg-muted px-3 py-2 text-xs font-medium">
                      <div>Indicator</div>
                      <div>Severity</div>
                      <div>Comparator</div>
                      <div>Load band</div>
                      <div>Value</div>
                      <div>Preview</div>
                    </div>
                    {editableRules.map((r, idx) => (
                      <div
                        key={`${r.indicator}-${r.severity}-${r.load_band ?? "all"}-${idx}`}
                        className="grid grid-cols-6 gap-2 border-b px-3 py-2 text-xs items-center"
                      >
                        <div>{r.indicator}</div>
                        <div>
                          <Badge
                            variant={
                              r.severity === "CRIT" ? "destructive" : "outline"
                            }
                            className="uppercase"
                          >
                            {r.severity}
                          </Badge>
                        </div>
                        <div className="font-mono text-[11px]">&lt;=</div>
                        <div>
                          {r.load_band
                            ? `${r.load_band}% IT load`
                            : "All loads"}
                        </div>
                        <div>
                          <Input
                            type="number"
                            className="h-8 w-24"
                            value={r.value}
                            onChange={(e) =>
                              handleRuleValueChange(idx, e.target.value)
                            }
                          />
                        </div>
                        <div>
                          If measured{" "}
                          <span className="font-mono text-[11px]">
                            &gt; {r.value}
                          </span>{" "}
                          → {r.severity} alert
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveThresholds}
                    disabled={isSavingThresholds}
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
