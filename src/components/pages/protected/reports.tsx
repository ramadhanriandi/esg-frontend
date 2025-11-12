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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState("compliance");
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-01-09");
  const [selectedFacilities, setSelectedFacilities] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = (format: string) => {
    toast.success("Report Generated", {
      description: `Your ${reportType} report has been generated in ${format.toUpperCase()} format.`,
    });
  };

  const handleGenerate = (templateName: string) => {
    toast.info("Generating Report", {
      description: `Creating ${templateName}...`,
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-6">
          <div className="mb-6 flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold text-balance">ESG Reporting</h1>
              <p className="text-muted-foreground">
                Generate comprehensive sustainability reports
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="mt-2 h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Configuration</CardTitle>
                  <CardDescription>
                    Customize your sustainability report parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger id="report-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compliance">
                            Compliance Documentation
                          </SelectItem>
                          <SelectItem value="esg">
                            ESG Summary Report
                          </SelectItem>
                          <SelectItem value="detailed">
                            Detailed Performance Analysis
                          </SelectItem>
                          <SelectItem value="quarterly">
                            Quarterly Review
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="date-from">From Date</Label>
                        <input
                          type="date"
                          id="date-from"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date-to">To Date</Label>
                        <input
                          type="date"
                          id="date-to"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facilities">Facilities</Label>
                      <Select
                        value={selectedFacilities}
                        onValueChange={setSelectedFacilities}
                      >
                        <SelectTrigger id="facilities">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Facilities</SelectItem>
                          <SelectItem value="dc-01">Singapore DC-01</SelectItem>
                          <SelectItem value="dc-02">Singapore DC-02</SelectItem>
                          <SelectItem value="dc-03">Malaysia DC-01</SelectItem>
                          <SelectItem value="dc-04">Thailand DC-01</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>
                    Choose from pre-configured report templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            BCA Green Mark Compliance
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Official compliance documentation
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleGenerate("BCA Green Mark Compliance Report")
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            Executive ESG Summary
                          </p>
                          <p className="text-sm text-muted-foreground">
                            High-level stakeholder report
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleGenerate("Executive ESG Summary")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            Technical Performance Report
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Detailed metrics and analysis
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleGenerate("Technical Performance Report")
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>
                    Download or share your reports in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => handleExport("pdf")}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport("csv")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export as CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport("excel")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export as Excel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.success("Share Report", {
                          description:
                            "Report sharing link has been copied to clipboard.",
                        });
                      }}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </SidebarProvider>
  );
}
