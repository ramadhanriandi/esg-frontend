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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { amplifyApi } from "@/api/amplify-api";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { useEcoAuth } from "@/authentication/use-eco-auth-hook";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    company_name: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const authContext = useEcoAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      company_name: "",
      password: "",
    },
  });

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      await amplifyApi.post<string>("BackendApi", "/auth/register", formData);
      toast.success("Account created successfully");
      await authContext.login({
        email: formData.email,
        password: formData.password,
      });
      navigate("/onboarding");
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

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="w-full max-w-md">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-balance">
              Welcome to EcoTrack
            </h1>
            <p className="text-muted-foreground text-balance">
              Track and optimize your data center ESG metrics
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Enter your company details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="NUS Co."
                        required
                        value={formData.company_name}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            company_name: value.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@nus.edu.sg"
                        required
                        value={formData.email}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            email: value.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            password: value.target.value,
                          })
                        }
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
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <RouterLink
                  to="/login"
                  className="underline underline-offset-4 text-emerald-600 hover:text-emerald-700"
                >
                  Sign in
                </RouterLink>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
