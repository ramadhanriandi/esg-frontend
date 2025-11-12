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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Key, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const sampleCode = {
  javascript: `// Example: Post energy data to EcoTrack API
const apiKey = 'your_api_key_here';
const facilityId = 'dc-01';

const data = {
  timestamp: new Date().toISOString(),
  totalFacilityEnergy: 1500, // kWh
  itEquipmentEnergy: 950,     // kWh
  waterUsage: 850,            // liters
  carbonEmissions: 650        // kg CO2
};

fetch(\`https://api.ecotrack.com/v1/facilities/\${facilityId}/metrics\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => console.log('Success:', result))
.catch(error => console.error('Error:', error));`,
  python: `# Example: Post energy data to EcoTrack API
import requests
from datetime import datetime

api_key = 'your_api_key_here'
facility_id = 'dc-01'

data = {
    'timestamp': datetime.now().isoformat(),
    'totalFacilityEnergy': 1500,  # kWh
    'itEquipmentEnergy': 950,      # kWh
    'waterUsage': 850,             # liters
    'carbonEmissions': 650         # kg CO2
}

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

response = requests.post(
    f'https://api.ecotrack.com/v1/facilities/{facility_id}/metrics',
    json=data,
    headers=headers
)

print('Success:', response.json())`,
  curl: `# Example: Post energy data to EcoTrack API
curl -X POST https://api.ecotrack.com/v1/facilities/dc-01/metrics \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "timestamp": "2025-01-09T12:00:00Z",
    "totalFacilityEnergy": 1500,
    "itEquipmentEnergy": 950,
    "waterUsage": 850,
    "carbonEmissions": 650
  }'`,
};

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
};

export default function DeveloperPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production Server",
      key: "ect_sk_prod_a1b2c3d4e5f6g7h8i9j0",
      createdAt: "2025-01-01",
      lastUsed: "2 hours ago",
    },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const generateApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key", {
        description: "Please enter a name for your API key",
      });
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `ect_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    toast.success("API Key Generated", {
      description:
        "Your new API key has been created. Make sure to copy it now as it won't be shown again.",
    });
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
    toast.success("API Key Deleted", {
      description: "The API key has been removed.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied", {
      description: "Content copied to clipboard",
    });
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 12) + "•".repeat(20);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-6xl p-6">
          <div className="mb-6 flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold text-balance">
                Developer Portal
              </h1>
              <p className="text-muted-foreground">
                API documentation and integration tools for automated data
                ingestion
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-64" />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="mt-2 h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="mt-2 h-4 w-56" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Tabs defaultValue="api-keys" className="space-y-6">
              <TabsList>
                <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
                <TabsTrigger value="examples">Code Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="api-keys" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate New API Key</CardTitle>
                    <CardDescription>
                      Create an API key to authenticate your applications with
                      EcoTrack
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="keyName">Key Name</Label>
                        <Input
                          id="keyName"
                          placeholder="e.g., Production Server, BMS Integration"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={generateApiKey}>
                          <Plus className="mr-2 h-4 w-4" />
                          Generate Key
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your API Keys</CardTitle>
                    <CardDescription>
                      Manage your active API keys for accessing the EcoTrack API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {apiKeys.map((apiKey) => (
                        <div
                          key={apiKey.id}
                          className="flex items-center justify-between rounded-lg border bg-card p-4"
                        >
                          <div className="flex flex-1 items-center gap-4">
                            <Key className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {apiKey.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono text-muted-foreground">
                                  {visibleKeys.has(apiKey.id)
                                    ? apiKey.key
                                    : maskApiKey(apiKey.key)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toggleKeyVisibility(apiKey.id)}
                                >
                                  {visibleKeys.has(apiKey.id) ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                              <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                                <span>Created: {apiKey.createdAt}</span>
                                <span>Last used: {apiKey.lastUsed}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(apiKey.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteApiKey(apiKey.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Endpoints</CardTitle>
                    <CardDescription>
                      Available endpoints for interacting with EcoTrack
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge className="bg-success text-success-foreground">
                            POST
                          </Badge>
                          <code className="text-sm font-mono text-foreground">
                            /v1/facilities/{"{facilityId}"}/metrics
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submit sustainability metrics for a specific facility.
                          Accepts energy consumption, water usage, and carbon
                          emissions data.
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary">GET</Badge>
                          <code className="text-sm font-mono text-foreground">
                            /v1/facilities/{"{facilityId}"}/metrics
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Retrieve historical metrics for a facility. Supports
                          date range filtering and metric-specific queries.
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary">GET</Badge>
                          <code className="text-sm font-mono text-foreground">
                            /v1/facilities
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          List all facilities in your organization with their
                          current compliance status.
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary">GET</Badge>
                          <code className="text-sm font-mono text-foreground">
                            /v1/facilities/{"{facilityId}"}/compliance
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Get compliance status and threshold information for a
                          specific facility.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>
                      How to authenticate your API requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-foreground">
                      All API requests must include your API key in the
                      Authorization header using Bearer authentication:
                    </p>
                    <div className="relative">
                      <pre className="rounded-lg bg-muted p-4 text-sm">
                        <code className="text-foreground">
                          Authorization: Bearer ect_sk_your_api_key_here
                        </code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() =>
                          copyToClipboard(
                            "Authorization: Bearer ect_sk_your_api_key_here"
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Schema</CardTitle>
                    <CardDescription>
                      Expected data format for metric submissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                        <code className="text-foreground">{`{
  "timestamp": "2025-01-09T12:00:00Z",
  "totalFacilityEnergy": 1500,  // kWh
  "itEquipmentEnergy": 950,      // kWh
  "waterUsage": 850,             // liters
  "carbonEmissions": 650         // kg CO2
}

// Calculated automatically:
// PUE = totalFacilityEnergy / itEquipmentEnergy
// WUE = waterUsage / itEquipmentEnergy
// CUE = carbonEmissions / itEquipmentEnergy`}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(sampleCode.javascript)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript / Node.js</CardTitle>
                    <CardDescription>
                      Example implementation using fetch API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                        <code className="text-foreground">
                          {sampleCode.javascript}
                        </code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(sampleCode.javascript)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Python</CardTitle>
                    <CardDescription>
                      Example implementation using requests library
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                        <code className="text-foreground">
                          {sampleCode.python}
                        </code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(sampleCode.python)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>cURL</CardTitle>
                    <CardDescription>
                      Example implementation using command line
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                        <code className="text-foreground">
                          {sampleCode.curl}
                        </code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(sampleCode.curl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Integration Flow</CardTitle>
                    <CardDescription>
                      Recommended workflow for automated data ingestion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Connect to your data sources
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Building Management Systems (BMS), power monitoring
                            tools, or other infrastructure
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Schedule periodic data collection
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Set up cron jobs or scheduled tasks to collect
                            metrics at regular intervals
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          3
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Transform and submit data
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Format the data according to the API schema and POST
                            to EcoTrack
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          4
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Monitor real-time updates
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Dashboard metrics update automatically with
                            calculated PUE, WUE, and CUE values
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </SidebarProvider>
  );
}
