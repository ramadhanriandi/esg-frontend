import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Loader2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
// import { ThemeToggle } from "../../theme-toggle";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Label } from "../../ui/label";
// import { useLgtAuth } from "@/authentication/use-lgt-auth-hook";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useAuthenticator } from "@aws-amplify/ui-react";

const updates = [
  {
    date: "2025-01-15",
    title: "AI-Powered Risk Assessment",
    description:
      "New machine learning models for automated risk scoring and prediction",
    badge: "New Feature",
  },
  {
    date: "2025-01-10",
    title: "Enhanced Audit Logging",
    description:
      "Comprehensive activity tracking with advanced filtering and export capabilities",
    badge: "Enhancement",
  },
  {
    date: "2025-01-05",
    title: "Bulk Upload Improvements",
    description:
      "Support for larger datasets and improved validation with detailed error reporting",
    badge: "Update",
  },
  {
    date: "2024-12-20",
    title: "Dark Mode Support",
    description:
      "Professional dark theme optimized for extended use and reduced eye strain",
    badge: "New Feature",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  // const authContext = useLgtAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
  });

  const { signOut } = useAuthenticator();

  const form = useForm({
    defaultValues: {
      userId: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  // const onSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     const trimmed = formData.userId.trim();
  //     if (trimmed === "") {
  //       toast.error("Please select a user");
  //       setLoading(false);
  //       return;
  //     }
  //     await authContext.login(trimmed);
  //     const redirectTo = "/dashboard"; //(location.state as any)?.from?.pathname ||
  //     navigate(redirectTo, { replace: true });
  //   } catch (error) {
  //     const message =
  //       error instanceof Error ? error.message : "An unknown error occurred";
  //     toast.error("Error:", {
  //       description: message,
  //     });
  //   }
  // };

  function mapToUserOption(users: any[]) {
    return users.map(({ id, name }) => ({ value: id, label: name }));
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ART</h1>
              {/* <p className="text-xs text-muted-foreground">
                Enterprise Risk Management
              </p> */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <ThemeToggle /> */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {/* <Badge className="bg-secondary text-secondary-foreground">
              Trusted by Financial Institutions
            </Badge> */}
            <h2 className="text-4xl lg:text-5xl font-bold text-balance leading-tight">
              Enterprise Risk Management Platform
            </h2>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Comprehensive risk assessment, case management, and compliance
              tracking.
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-lg">
            <CardHeader>
              {/* <CardTitle>Quick Access</CardTitle> */}
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
            <Button onClick={signOut}>Sign out</Button>
              
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16 px-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Powerful Risk Management Tools
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage risk effectively in one integrated
              platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor risk metrics and trends with interactive dashboards
                  and reports
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Leverage machine learning for predictive risk assessment and
                  recommendations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <FileCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Case Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track and manage risk cases through their complete lifecycle
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Work seamlessly with your team and stakeholders across
                  departments
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Updates Section */}
      <section className="container mx-auto px-10 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Latest Updates</h3>
            <p className="text-muted-foreground">
              Stay informed about new features and improvements
            </p>
          </div>
          <div className="space-y-6">
            {updates.map((update, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={
                            update.badge === "New Feature"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {update.badge}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {update.date}
                        </span>
                      </div>
                      <CardTitle className="text-xl mb-2">
                        {update.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {update.description}
                      </CardDescription>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ART. Risk Management Platform.</p>
        </div>
      </footer>
    </div>
  );
}
