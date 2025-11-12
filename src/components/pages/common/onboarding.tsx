import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { amplifyApi } from "@/api/amplify-api";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const [sites, setSites] = useState<
    { site_id: string; name: string; country: string; timezone: string }[]
  >([]);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    timezone: "",
  });

  const form = useForm({
    defaultValues: {
      name: "",
      country: "",
      timezone: "",
    },
  });

  useEffect(() => {
    const checkAuth = () => {
      const raw = sessionStorage.getItem("oidc.user");

      if (!raw) {
        navigate("/login");
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    amplifyApi
      .get<
        { site_id: string; name: string; country: string; timezone: string }[]
      >("BackendApi", "/sites")
      .then((response) => {
        setSites(response);
      });
  }, []);

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error:", {
        description: message,
      });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-balance">
              Welcome to EcoTrack
            </h1>
            <p className="text-muted-foreground text-balance">
              Let&apos;s set up your first data center facility
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Add Your First Facility
              </CardTitle>
              <CardDescription>
                Enter the details of your primary data center to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facilityName">Facility Name *</Label>
                    <Select
                      value={formData.name}
                      onValueChange={(value) =>
                        setFormData({ ...formData, name: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites &&
                          sites.length > 0 &&
                          sites.map((site) => (
                            <SelectItem key={site.name} value={site.name}>
                              {site.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData({ ...formData, country: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites &&
                          sites.length > 0 &&
                          sites.map((site) => (
                            <SelectItem key={site.country} value={site.country}>
                              {site.country}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) =>
                        setFormData({ ...formData, timezone: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites &&
                          sites.length > 0 &&
                          sites.map((site) => (
                            <SelectItem
                              key={site.timezone}
                              value={site.timezone}
                            >
                              {site.timezone}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating facility...
                      </>
                    ) : (
                      "Continue to Dashboard"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            You can add more facilities later from your dashboard
          </div>
        </div>
      </div>
    </div>
  );
}
