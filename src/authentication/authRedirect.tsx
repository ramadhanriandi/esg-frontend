import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { LoadingProgressBar } from "@/components/common/loadingProgressBar";

export default function AuthRedirect() {
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (auth.isAuthenticated) {
      const redirectTo = sessionStorage.getItem("postLoginRedirect") || "/";
      sessionStorage.removeItem("postLoginRedirect");
      navigate(redirectTo);
    }
  }, [auth.isAuthenticated, navigate]);

  return <LoadingProgressBar />;
}
