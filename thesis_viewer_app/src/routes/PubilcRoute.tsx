import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import LoadingOverlay from "../components/Global/LoadingOverlay";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
}

export function PublicRoute({ children, redirectIfAuthenticated = false }: PublicRouteProps) {
  const { session, loading } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/homepage";

  if (loading) return (
    <LoadingOverlay />
  );

  if (isHomePage) {
    return <>{children}</>;
  }

  if (session && redirectIfAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}