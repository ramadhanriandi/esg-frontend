"use client";

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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "sonner";
import { useEcoAuth } from "@/authentication/use-eco-auth-hook";
import { Form, useForm } from "react-hook-form";

export default function LoginPage() {
  const navigate = useNavigate();

  const authContext = useEcoAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const onSubmit = async () => {
    setLoading(true);
    try {
      const trimmed = formData.email.trim();
      if (trimmed === "") {
        setLoading(false);
        return;
      }
      await authContext.login(trimmed);
      const redirectTo = "/dashboard"; //(location.state as any)?.from?.pathname ||
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error:", {
        description: message,
      });
      setError(message);
    }
  };

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     const userData = localStorage.getItem("ecotrack_user");

  //     if (!userData) {
  //       throw new Error("No account found. Please sign up first.");
  //     }

  //     const user = JSON.parse(userData);

  //     if (user.companyEmail !== email) {
  //       throw new Error("Invalid email or password");
  //     }

  //     // Check if verified
  //     //   const isVerified = localStorage.getItem("ecotrack_verified") === "true";

  //     //   if (!isVerified) {
  //     //     navigate("/onboarding");
  //     //     return;
  //     //   }

  //     // Check if has facilities
  //     const facilities = localStorage.getItem("ecotrack_facilities");

  //     if (!facilities || JSON.parse(facilities).length === 0) {
  //       navigate("/onboarding");
  //     } else {
  //       navigate("/dashboard");
  //     }
  //   } catch (error: unknown) {
  //     setError(error instanceof Error ? error.message : "An error occurred");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
            <h1 className="text-3xl font-bold text-balance">Welcome Back</h1>
            <p className="text-muted-foreground text-balance">
              Sign in to your EcoTrack account
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={onSubmit}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@u.nus.edu"
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
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <RouterLink
                      to="/auth/sign-up"
                      className="underline underline-offset-4 text-emerald-600 hover:text-emerald-700"
                    >
                      Create account
                    </RouterLink>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
