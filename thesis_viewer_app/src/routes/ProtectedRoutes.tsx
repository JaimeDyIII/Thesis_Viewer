import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useEffect, useState, useRef } from "react";
import { checkUserExists } from "../api/auth/queries";
import { Footer } from "../components/Global/Footer";
import { Box } from "@mui/material";
import LoadingOverlay from '../components/Global/LoadingOverlay';

interface ProtectedRouteProps {
  allowedRoles: string[];
  requiredPermissions?: string[] | null;
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles = [], requiredPermissions = [], children }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();
  const { permissions, permissionLoading } = usePermissions();
  const location = useLocation();
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkUser = async () => {
      if (session?.user && !hasCheckedRef.current) {
        const exists = await checkUserExists(session.user.id);
        setUserExists(exists);
        hasCheckedRef.current = true;
      }
    };

    checkUser();
  }, [session]);

  if(!session){
    if(location.pathname !== '/login'){
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (loading || permissionLoading || userExists === null) {
    return (
      <LoadingOverlay />
    );
  }

  if (!session) {
    if (location.pathname === "/" || location.pathname === '/homepage') {
      return <>{children}</>;
    }

    if(location.pathname !== '/login'){
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // If user doesn't exist in database or hasn't accepted terms, redirect to terms
  if (session && (!userExists || (profile && profile.terms_and_condition === false))) {
    return <Navigate to="/terms" replace />;
  }

  // If no profile yet, show loading
  if (!profile) {
    return (
      <LoadingOverlay />
    );
  }

  const userRole = profile.role;

  // Check role permissions
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/*" replace />;
  }

  // Check specific permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!permissions) {
      return <Navigate to="/*" replace />;
    }

    const hasPermission = requiredPermissions.some(
      permission => permissions[permission] === true
    );
    
    if (!hasPermission) {
      return <Navigate to="/*" replace />;
    }
  }

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