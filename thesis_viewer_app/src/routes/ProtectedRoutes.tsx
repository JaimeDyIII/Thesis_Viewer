import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";

interface ProtectedRouteProps {
  allowedRoles: string[];
  requiredPermissions?: string[] | null;
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, requiredPermissions = [], children }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();
  const { permissions } = usePermissions();
    const location = useLocation();

  if (loading) {
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

  return children ? <>{children}</> : <Outlet />;
}