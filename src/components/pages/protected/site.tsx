import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EcoCombobox } from "@/components/common/EcoComboBox";
import { countries } from "@/components/common/countries";
import { amplifyApi } from "@/api/amplify-api";
import { AppLayout } from "@/components/app-layout";

type SiteFormData = {
  name: string;
  country: string;
  timezone: string;
};

export default function AddSitePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SiteFormData>({
    name: "",
    country: "",
    timezone:
      typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "",
  });

  const timezones = Intl.supportedValuesOf("timeZone");

  const handleChange = (field: keyof SiteFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.country) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await amplifyApi.post<string>("BackendApi", "/sites", formData);
      toast.success("Site created successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      toast.error("Error creating site", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold text-balance">Add New Facility</h1>
        <p className="text-muted-foreground pb-4">
          Create a new facility to track its environmental performance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>
            Specify the location and timezone for accurate reporting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="facilityName">Facility Name *</Label>
                <Input
                  id="facilityName"
                  type="text"
                  placeholder="Enter facility name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <EcoCombobox
                  items={countries}
                  value={formData.country}
                  onChange={handleChange("country")}
                  getLabel={(country) => country.name}
                  getValue={(country) => country.code}
                  placeholder="Select country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <EcoCombobox
                  items={timezones}
                  value={formData.timezone}
                  onChange={handleChange("timezone")}
                  getLabel={(timezone) => timezone}
                  getValue={(timezone) => timezone}
                  placeholder="Select timezone"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating facility...
                  </>
                ) : (
                  "Create Facility"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
