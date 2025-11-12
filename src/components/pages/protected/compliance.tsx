import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-layout";
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
import { Save, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const facilities = [
  { id: "dc-01", name: "Singapore DC-01" },
  { id: "dc-02", name: "Singapore DC-02" },
  { id: "dc-03", name: "Malaysia DC-01" },
  { id: "dc-04", name: "Thailand DC-01" },
];

const standards = [
  {
    id: "bca-green-mark",
    name: "BCA-IMDA Green Mark",
    description: "Singapore's green building certification for data centers",
  },
  {
    id: "leed",
    name: "LEED Data Center",
    description: "Leadership in Energy and Environmental Design",
  },
  {
    id: "iso-50001",
    name: "ISO 50001",
    description: "International energy management standard",
  },
];

const certificationLevels = {
  "bca-green-mark": [
    {
      level: "platinum",
      displayName: "Platinum",
      pue: 1.5,
      wue: 0.8,
      cue: 0.6,
      description: "Highest performance standard",
    },
    {
      level: "goldplus",
      displayName: "GoldPLUS",
      pue: 1.8,
      wue: 1.0,
      cue: 0.8,
      description: "Enhanced gold tier certification",
    },
    {
      level: "gold",
      displayName: "Gold",
      pue: 2.0,
      wue: 1.2,
      cue: 0.9,
      description: "Gold tier certification",
    },
    {
      level: "certified",
      displayName: "Certified",
      pue: 2.2,
      wue: 1.4,
      cue: 1.0,
      description: "Base certification level",
    },
  ],
};

export default function CompliancePage() {
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [thresholds, setThresholds] = useState({ pue: "", wue: "", cue: "" });
  const [customGoals, setCustomGoals] = useState({ pue: "", wue: "", cue: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleLevelChange = (level: string) => {
    setIsLoading(true);
    setSelectedLevel(level);
    const levelData = certificationLevels["bca-green-mark"].find(
      (l) => l.level === level
    );
    if (levelData) {
      setTimeout(() => {
        setThresholds({
          pue: levelData.pue.toString(),
          wue: levelData.wue.toString(),
          cue: levelData.cue.toString(),
        });
        setCustomGoals({ pue: "", wue: "", cue: "" });
        setIsLoading(false);
      }, 500);
    }
  };

  const handleThresholdChange = (
    metric: "pue" | "wue" | "cue",
    value: string
  ) => {
    setThresholds({ ...thresholds, [metric]: value });
  };

  const handleSave = () => {
    toast.success("Configuration Saved", {
      description: `Compliance settings for ${facilities.find((f) => f.id === selectedFacility)?.name} have been updated successfully.`,
    });
  };

  const selectedStandardInfo = standards.find((s) => s.id === selectedStandard);
  const selectedLevelInfo = certificationLevels["bca-green-mark"]?.find(
    (l) => l.level === selectedLevel
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-5xl p-6">
          <div className="mb-6 flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold text-balance">
                Compliance Configuration
              </h1>
              <p className="text-muted-foreground">
                Set sustainability standards and certification targets for your
                facilities
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <CardTitle>Select Facility</CardTitle>
                    <CardDescription>
                      Choose the facility to configure compliance settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="facility">Facility</Label>
                  <Select
                    value={selectedFacility}
                    onValueChange={setSelectedFacility}
                  >
                    <SelectTrigger id="facility">
                      <SelectValue placeholder="Select a facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {facility.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {selectedFacility && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      2
                    </div>
                    <div>
                      <CardTitle>Choose Standard & Level</CardTitle>
                      <CardDescription>
                        Select the sustainability standard and target
                        certification level
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="standard">Sustainability Standard</Label>
                      <Select
                        value={selectedStandard}
                        onValueChange={setSelectedStandard}
                      >
                        <SelectTrigger id="standard">
                          <SelectValue placeholder="Select a standard" />
                        </SelectTrigger>
                        <SelectContent>
                          {standards.map((standard) => (
                            <SelectItem key={standard.id} value={standard.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {standard.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {standard.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedStandardInfo && (
                        <p className="text-sm text-muted-foreground">
                          {selectedStandardInfo.description}
                        </p>
                      )}
                    </div>

                    {selectedStandard === "bca-green-mark" && (
                      <div className="space-y-3">
                        <Label>Certification Level</Label>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          {certificationLevels["bca-green-mark"].map(
                            (level) => (
                              <button
                                key={level.level}
                                onClick={() => handleLevelChange(level.level)}
                                className={`group relative overflow-hidden rounded-lg border-2 p-4 text-left transition-all ${
                                  selectedLevel === level.level
                                    ? "border-primary bg-primary/10 shadow-md"
                                    : "border-border hover:border-primary/50 hover:bg-accent/5"
                                }`}
                              >
                                {selectedLevel === level.level && (
                                  <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-primary" />
                                )}
                                <p className="mb-1 font-semibold text-foreground">
                                  {level.displayName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {level.description}
                                </p>
                                <div className="mt-3 space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      PUE:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      ≤ {level.pue}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      WUE:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      ≤ {level.wue}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      CUE:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      ≤ {level.cue}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedLevel && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      3
                    </div>
                    <div>
                      <CardTitle>Automated Thresholds</CardTitle>
                      <CardDescription>
                        Pre-populated thresholds for{" "}
                        {selectedLevelInfo?.displayName} certification - adjust
                        as needed
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border bg-card p-4">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              Power Usage Effectiveness (PUE)
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Total Facility Energy / IT Equipment Energy
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success"
                          >
                            Certification Max: {selectedLevelInfo?.pue}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pue-threshold">Threshold Value</Label>
                          <Input
                            id="pue-threshold"
                            type="number"
                            step="0.01"
                            value={thresholds.pue}
                            onChange={(e) =>
                              handleThresholdChange("pue", e.target.value)
                            }
                            className="max-w-xs"
                          />
                          <p className="text-xs text-muted-foreground">
                            Industry benchmark for energy efficiency in data
                            centers
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border bg-card p-4">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              Water Usage Effectiveness (WUE)
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Annual Water Usage / IT Equipment Energy
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success"
                          >
                            Certification Max: {selectedLevelInfo?.wue}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wue-threshold">Threshold Value</Label>
                          <Input
                            id="wue-threshold"
                            type="number"
                            step="0.01"
                            value={thresholds.wue}
                            onChange={(e) =>
                              handleThresholdChange("wue", e.target.value)
                            }
                            className="max-w-xs"
                          />
                          <p className="text-xs text-muted-foreground">
                            Measures water consumption efficiency in liters per
                            kWh
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border bg-card p-4">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              Carbon Usage Effectiveness (CUE)
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Total CO2 Emissions / IT Equipment Energy
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success"
                          >
                            Certification Max: {selectedLevelInfo?.cue}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cue-threshold">Threshold Value</Label>
                          <Input
                            id="cue-threshold"
                            type="number"
                            step="0.01"
                            value={thresholds.cue}
                            onChange={(e) =>
                              handleThresholdChange("cue", e.target.value)
                            }
                            className="max-w-xs"
                          />
                          <p className="text-xs text-muted-foreground">
                            Carbon footprint metric in kg CO2 per kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedLevel && !isLoading && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      4
                    </div>
                    <div>
                      <CardTitle>Save Configuration</CardTitle>
                      <CardDescription>
                        Review and save your compliance configuration with
                        adjusted thresholds
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Button onClick={handleSave} className="w-full" size="lg">
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
