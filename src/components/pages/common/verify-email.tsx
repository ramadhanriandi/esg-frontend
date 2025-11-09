import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Get user email from localStorage
    const userData = localStorage.getItem("ecotrack_user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserEmail(parsed.companyEmail);
    }
  }, []);

  const handleVerify = () => {
    // Mark as verified
    localStorage.setItem("ecotrack_needs_verification", "false");
    localStorage.setItem("ecotrack_verified", "true");

    // Redirect to onboarding
    navigate("/onboarding");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-center">
                {userEmail
                  ? `Verification email sent to ${userEmail}`
                  : "Check your email for verification"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                In a production environment, you would click the link in your
                email. For this demo, click the button below to simulate email
                verification.
              </p>
              <Button
                onClick={handleVerify}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Verify Email (Demo)
              </Button>
              <div className="pt-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <a href="/auth/login">Back to Sign In</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
