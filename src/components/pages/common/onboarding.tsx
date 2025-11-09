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

export default function OnboardingPage() {
  const [facilityName, setFacilityName] = useState("");
  const [location, setLocation] = useState("");
  const [sizeSqm, setSizeSqm] = useState("");
  const [operationalCapacity, setOperationalCapacity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("ecotrack_user");
      const isVerified = localStorage.getItem("ecotrack_verified") === "true";

      if (!userData || !isVerified) {
        navigate("/auth/login");
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userData = localStorage.getItem("ecotrack_user");

      if (!userData) {
        throw new Error("Not authenticated");
      }

      const user = JSON.parse(userData);

      // Get existing facilities or create new array
      const existingFacilities = localStorage.getItem("ecotrack_facilities");
      const facilities = existingFacilities
        ? JSON.parse(existingFacilities)
        : [];

      // Create new facility
      const newFacility = {
        id: `facility-${Date.now()}`,
        user_email: user.companyEmail,
        name: facilityName,
        location: location,
        size_sqm: sizeSqm ? Number.parseFloat(sizeSqm) : null,
        operational_capacity_kw: operationalCapacity
          ? Number.parseFloat(operationalCapacity)
          : null,
        created_at: new Date().toISOString(),
      };

      // Add to facilities array
      facilities.push(newFacility);

      // Save back to localStorage
      localStorage.setItem("ecotrack_facilities", JSON.stringify(facilities));

      navigate("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
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
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facilityName">Facility Name *</Label>
                    <Input
                      id="facilityName"
                      type="text"
                      placeholder="e.g., Singapore Data Center 1"
                      required
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., Singapore, Jurong West"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sizeSqm">Size (sq meters)</Label>
                      <Input
                        id="sizeSqm"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 5000"
                        value={sizeSqm}
                        onChange={(e) => setSizeSqm(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="operationalCapacity">
                        Operational Capacity (kW)
                      </Label>
                      <Input
                        id="operationalCapacity"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 1000"
                        value={operationalCapacity}
                        onChange={(e) => setOperationalCapacity(e.target.value)}
                      />
                    </div>
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
