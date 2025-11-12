import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-layout";
import { Activity, Building2, TrendingUp, AlertTriangle } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const performanceData = [
  { month: "Jan", pue: 1.8, wue: 1.2, cue: 0.9 },
  { month: "Feb", pue: 1.75, wue: 1.15, cue: 0.85 },
  { month: "Mar", pue: 1.7, wue: 1.1, cue: 0.8 },
  { month: "Apr", pue: 1.65, wue: 1.05, cue: 0.75 },
  { month: "May", pue: 1.6, wue: 1.0, cue: 0.7 },
  { month: "Jun", pue: 1.55, wue: 0.95, cue: 0.68 },
];

const facilities = [
  {
    id: 1,
    name: "Singapore DC-01",
    pue: 1.55,
    wue: 0.95,
    cue: 0.68,
    status: "compliant",
  },
  {
    id: 2,
    name: "Singapore DC-02",
    pue: 1.82,
    wue: 1.15,
    cue: 0.88,
    status: "warning",
  },
  {
    id: 3,
    name: "Malaysia DC-01",
    pue: 1.48,
    wue: 0.88,
    cue: 0.62,
    status: "compliant",
  },
  {
    id: 4,
    name: "Thailand DC-01",
    pue: 2.15,
    wue: 1.35,
    cue: 1.05,
    status: "alert",
  },
];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold text-balance">
                  Sustainability Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Monitor your facility performance and compliance status
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
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
              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="mt-2 h-4 w-56" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="mt-2 h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Facilities
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {facilities.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all regions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg PUE
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.75</div>
                    <p className="flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="h-3 w-3" />
                      <span>12% improvement</span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Compliant Facilities
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3 / 4</div>
                    <p className="text-xs text-muted-foreground">
                      75% compliance rate
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
                    <div className="text-2xl font-bold">2</div>
                    <p className="text-xs text-destructive">
                      Requires attention
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>
                      6-month sustainability metrics overview
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        pue: {
                          label: "PUE",
                          color: "hsl(var(--chart-1))",
                        },
                        wue: {
                          label: "WUE",
                          color: "hsl(var(--chart-2))",
                        },
                        cue: {
                          label: "CUE",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="pue"
                            stackId="1"
                            stroke="var(--color-chart-1)"
                            fill="var(--color-chart-1)"
                            fillOpacity={0.6}
                          />
                          <Area
                            type="monotone"
                            dataKey="wue"
                            stackId="2"
                            stroke="var(--color-chart-2)"
                            fill="var(--color-chart-2)"
                            fillOpacity={0.6}
                          />
                          <Area
                            type="monotone"
                            dataKey="cue"
                            stackId="3"
                            stroke="var(--color-chart-3)"
                            fill="var(--color-chart-3)"
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>
                      Latest system notifications and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Thailand DC-01 exceeds PUE threshold
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Current PUE: 2.15 (Target: {"<"} 2.0)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            2 hours ago
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Singapore DC-02 approaching limit
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Current PUE: 1.82 (Target: {"<"} 1.8)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            5 hours ago
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-3">
                        <TrendingUp className="h-5 w-5 text-success" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Malaysia DC-01 performing excellently
                          </p>
                          <p className="text-xs text-muted-foreground">
                            15% below target thresholds
                          </p>
                          <p className="text-xs text-muted-foreground">
                            1 day ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Facility Overview</CardTitle>
                  <CardDescription>
                    Current status of all monitored data centers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {facilities.map((facility) => (
                      <div
                        key={facility.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">
                              {facility.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PUE: {facility.pue} | WUE: {facility.wue} | CUE:{" "}
                              {facility.cue}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            facility.status === "compliant"
                              ? "default"
                              : facility.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            facility.status === "compliant"
                              ? "bg-success text-success-foreground"
                              : facility.status === "warning"
                                ? "bg-warning text-foreground"
                                : ""
                          }
                        >
                          {facility.status === "compliant"
                            ? "Compliant"
                            : facility.status === "warning"
                              ? "Warning"
                              : "Alert"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </SidebarProvider>
  );
}
