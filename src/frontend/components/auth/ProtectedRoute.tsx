import { Navigate, Outlet, useLocation } from "react-router-dom";

import { StateDisplay } from "@/components/shared/StateDisplay";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <StateDisplay state="loading" />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
