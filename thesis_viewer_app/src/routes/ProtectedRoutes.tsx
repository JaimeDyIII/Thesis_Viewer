import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { Box } from "@mui/material";

import { Footer } from "../components/Global/Footer";

interface ProtectedRouteProps {
  allowedRoles: string[];
  requiredPermissions?: string[] | null;
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, requiredPermissions = [], children }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();
  const { permissions, permissionLoading } = usePermissions();
  const location = useLocation();

  if (loading || permissionLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

  const userRole = profile.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!permissions) {
      return <Navigate to="/unauthorized" replace />;
    }

    const hasPermission = requiredPermissions.some(
      permission => permissions[permission] === true
    );
    
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Wrap the children or Outlet with Header and Footer
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
    
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children ? children : <Outlet />}
      </Box>
      <Footer />
    </Box>
  );
}