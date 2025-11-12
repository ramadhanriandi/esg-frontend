import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEcoAuth } from "./use-eco-auth-hook";
import { LoadingProgressBar } from "@/components/common/loadingProgressBar";

export const ProtectedRoute = () => {
  const location = useLocation();
  const authContext = useEcoAuth();

  const auth = authContext;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isLoading, auth.isAuthenticated, location]);

  if (auth.isLoading || !authContext.isRestored) {
    return <LoadingProgressBar />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
