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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { amplifyApi } from "@/api/amplify-api";
import { Copy, Key, Plus, Send } from "lucide-react";

type IngestToken = {
  token_id: string;
  name: string;
  active: boolean;
  created_at: string;
  last_used_at: string | null;
};

export default function DeveloperPage() {
  const [tokens, setTokens] = useState<IngestToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [lastTokenPlain, setLastTokenPlain] = useState<string | null>(null);

  const [testSiteId, setTestSiteId] = useState("");
  const [testItLoad, setTestItLoad] = useState<string>("50");
  const [testIndicator, setTestIndicator] = useState<"PUE" | "WUE" | "CUE">(
    "PUE"
  );
  const [testValue, setTestValue] = useState<string>("1.42");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await amplifyApi.get<{ tokens: IngestToken[] }>(
          "BackendApi",
          "/ingest_tokens"
        );
        setTokens(res.tokens ?? []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load API tokens");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const hasTokens = useMemo(() => (tokens?.length ?? 0) > 0, [tokens]);

  async function generateToken() {
    if (!newTokenName.trim()) {
      toast.error("Please enter a name for your token");
      return;
    }
    setCreating(true);
    try {
      const created = await amplifyApi.post<{
        token_id: string;
        token: string;
        name: string;
      }>("BackendApi", "/ingest_tokens", { name: newTokenName.trim() } as any);

      setNewTokenName("");
      setLastTokenPlain(created.token);

      const list = await amplifyApi.get<{ tokens: IngestToken[] }>(
        "BackendApi",
        "/ingest_tokens"
      );
      setTokens(list.tokens ?? []);

      toast.success("Token generated", {
        description: "Copy this token now. It won’t be shown again.",
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate token");
    } finally {
      setCreating(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  async function sendTestMetric() {
    if (!lastTokenPlain) {
      toast.error("Generate a token first");
      return;
    }
    if (!testSiteId.trim()) {
      toast.error("Enter a site_id to test against");
      return;
    }
    const it = testItLoad ? Number(testItLoad) : undefined;
    const val = Number(testValue);
    if (Number.isNaN(val)) {
      toast.error("Provide a numeric test value");
      return;
    }

    setSending(true);
    try {
      await amplifyApi.post(
        "BackendApi",
        "/metrics",
        {
          site_id: testSiteId.trim(),
          measured_at: new Date().toISOString(),
          it_load_pct: it,
          measurements: [{ indicator: testIndicator, value: val }],
        } as any,
        {
          "X-Api-Key": lastTokenPlain,
        }
      );
      toast.success("Test metric sent", {
        description:
          "If the value breaches a threshold, an alert will open or update.",
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to send test metric");
    } finally {
      setSending(false);
    }
  }

  const codeToken = lastTokenPlain ?? "YOUR_INGEST_TOKEN";
  const codeSite = testSiteId || "YOUR_SITE_ID";

  const curlSnippet = `curl -X POST "${
    import.meta.env.VITE_API_BASE ?? "https://api.example.com"
  }/metrics" \\
  -H "X-Api-Key: ${codeToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "site_id": "${codeSite}",
    "measured_at": "2025-11-14T12:00:00Z",
    "it_load_pct": 50,
    "measurements": [
      { "indicator": "PUE", "value": 1.42 },
      { "indicator": "WUE", "value": 1.95 },
      { "indicator": "CUE", "value": 0.55 }
    ]
  }'`;

  const pySnippet = `import requests, datetime

resp = requests.post(
  f'${import.meta.env.VITE_API_BASE ?? "https://api.example.com"}/metrics',
  headers={'X-Api-Key': '${codeToken}', 'Content-Type': 'application/json'},
  json={
    'site_id': '${codeSite}',
    'measured_at': datetime.datetime.utcnow().isoformat() + 'Z',
    'it_load_pct': 50,
    'measurements': [
      {'indicator':'PUE','value':1.42},
      {'indicator':'WUE','value':1.95},
      {'indicator':'CUE','value':0.55},
    ],
  }
)
print(resp.status_code, resp.json())`;

  const jsSnippet = `await fetch('${
    import.meta.env.VITE_API_BASE ?? "https://api.example.com"
  }/metrics', {
  method: 'POST',
  headers: {
    'X-Api-Key': '${codeToken}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    site_id: '${codeSite}',
    measured_at: new Date().toISOString(),
    it_load_pct: 50,
    measurements: [
      { indicator: 'PUE', value: 1.42 },
      { indicator: 'WUE', value: 1.95 },
      { indicator: 'CUE', value: 0.55 },
    ],
  }),
});`;

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 pb-4">
        <h1 className="text-3xl font-bold text-balance">Developer Portal</h1>
        <p className="text-muted-foreground">
          Generate an ingestion token and configure your BMS/DCIM/scripts to
          push PUE/WUE/CUE to the Open API.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-2 h-4 w-72" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-2 h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="tokens" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tokens">Generate Token</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="test">Send Test Metric</TabsTrigger>
          </TabsList>

          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate token</CardTitle>
                <CardDescription>
                  Click <span className="font-medium">Generate Token</span> and
                  copy it. For security, it will not be shown again.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="tokenName">Token name</Label>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Input
                      id="tokenName"
                      placeholder="e.g., BMS Push, DCIM Writer"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end ">
                    <Button onClick={generateToken} disabled={creating}>
                      <Plus className="mr-2 h-4 w-4" />
                      {creating ? "Generating..." : "Generate Token"}
                    </Button>
                  </div>
                </div>

                {lastTokenPlain && (
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Your new token (copy now)
                      </span>
                    </div>
                    <div className="relative">
                      <pre className="rounded bg-background p-3 text-sm overflow-x-auto">
                        <code>{lastTokenPlain}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => copy(lastTokenPlain)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Your tokens</Label>
                  {!hasTokens ? (
                    <p className="text-sm text-muted-foreground">
                      No tokens yet. Generate one to get started.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tokens.map((t) => (
                        <div
                          key={t.token_id}
                          className="flex items-center justify-between rounded-lg border bg-card p-4"
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <Key className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {t.name}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span>Created: {t.created_at}</span>
                                <span>
                                  Last used: {t.last_used_at ?? "Never"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={t.active ? "default" : "secondary"}
                            className="uppercase"
                          >
                            {t.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How it works</CardTitle>
                <CardDescription>
                  Systems POST metrics to <code>/metrics</code> with your token.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-3 text-sm">
                  <li>
                    <span className="font-medium">1. Generate a token:</span>{" "}
                    Open API Access → Generate Token.
                  </li>
                  <li>
                    <span className="font-medium">
                      2. Configure your BMS/DCIM/scripts:
                    </span>{" "}
                    store the token securely (env var, secret manager).
                  </li>
                  <li>
                    <span className="font-medium">
                      3. POST metrics to /metrics:
                    </span>{" "}
                    include <code>X-Api-Key</code> or{" "}
                    <code>Authorization: Ingest &lt;token&gt;</code>.
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request format</CardTitle>
                <CardDescription>JSON body sent to /metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                  <code className="text-foreground">{`{
  "site_id": "YOUR_SITE_ID",
  "measured_at": "2025-11-14T12:00:00Z", // optional; now() if omitted
  "it_load_pct": 50,                     // optional; used for PUE banding
  "measurements": [
    { "indicator": "PUE", "value": 1.42 },
    { "indicator": "WUE", "value": 1.95 },
    { "indicator": "CUE", "value": 0.55 }
  ]
}`}</code>
                </pre>
                <p className="mt-2 text-xs text-muted-foreground">
                  Comparator is <code>{"<="}</code>. A breach occurs when
                  observed value &gt; threshold. CRIT overrides WARN. If no{" "}
                  <code>measured_at</code> is provided, the server stores the
                  current time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
                <CardDescription>curl / Python / JS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    <code className="text-foreground">{curlSnippet}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => copy(curlSnippet)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    <code className="text-foreground">{pySnippet}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => copy(pySnippet)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    <code className="text-foreground">{jsSnippet}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => copy(jsSnippet)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send test metric</CardTitle>
                <CardDescription>
                  Uses your latest generated token to send one measurement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteId">site_id</Label>
                    <Input
                      id="siteId"
                      placeholder="e.g., 6b7d8f1a-51e0-4a8c-9b08-6b2a9f0f0a10"
                      value={testSiteId}
                      onChange={(e) => setTestSiteId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itpct">it_load_pct (optional)</Label>
                    <Input
                      id="itpct"
                      placeholder="25 | 50 | 75 | 100"
                      value={testItLoad}
                      onChange={(e) => setTestItLoad(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>indicator</Label>
                    <div className="flex gap-2">
                      {(["PUE", "WUE", "CUE"] as const).map((k) => (
                        <Button
                          key={k}
                          type="button"
                          variant={testIndicator === k ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTestIndicator(k)}
                        >
                          {k}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="val">value</Label>
                    <Input
                      id="val"
                      placeholder="e.g., 1.42"
                      value={testValue}
                      onChange={(e) => setTestValue(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    Header: <code>X-Api-Key: {"<your token>"}</code> or{" "}
                    <code>Authorization: Ingest {"<your token>"}</code>
                  </p>
                  <Button onClick={sendTestMetric} disabled={sending}>
                    <Send className="mr-2 h-4 w-4" />
                    {sending ? "Sending..." : "Send test"}
                  </Button>
                </div>
                {!lastTokenPlain && (
                  <p className="text-xs text-muted-foreground">
                    Tip: Generate a token first (Tokens tab). The plaintext
                    token will appear once — copy it and keep it safe.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}
