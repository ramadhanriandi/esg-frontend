import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { countries } from "@/components/common/countries";
import { EcoCombobox } from "@/components/common/EcoComboBox";
import { amplifyApi } from "@/api/amplify-api";

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
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

  const timezones = Intl.supportedValuesOf("timeZone");

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

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      await amplifyApi.post<string>("BackendApi", "/sites", formData);
      toast.success("Site created successfully");

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
                    <Input
                      id="facilityName"
                      type="text"
                      placeholder="Enter facility name"
                      value={formData.name}
                      onChange={(value) =>
                        setFormData({ ...formData, name: value.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country *</Label>
                    <EcoCombobox
                      items={countries}
                      value={formData.country}
                      onChange={(value) =>
                        setFormData({ ...formData, country: value })
                      }
                      getLabel={(country) => country.name}
                      getValue={(country) => country.code}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <EcoCombobox
                      items={timezones}
                      value={formData.timezone}
                      onChange={(value) =>
                        setFormData({ ...formData, timezone: value })
                      }
                      getLabel={(timezone) => timezone}
                      getValue={(timezone) => timezone}
                    />
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
