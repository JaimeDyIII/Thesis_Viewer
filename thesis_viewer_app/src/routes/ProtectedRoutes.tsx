import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useEffect, useState, useRef } from "react";
import { checkUserExists } from "../api/auth/queries";
import { Footer } from "../components/Global/Footer";
import { Box } from "@mui/material";
import LoadingOverlay from '../components/Global/LoadingOverlay';
import { supabase } from "../lib/supabase";

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
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const userCheckRef = useRef(false);

  
  useEffect(() => {
    const checkUser = async () => {
      if (session?.user && !userCheckRef.current) {
        userCheckRef.current = true;
        const exists = await checkUserExists(session.user.id);
        setUserExists(exists);

        // Check if user is active
        if (exists) {
          const { data, error } = await supabase
            .from("users")
            .select("is_active")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error checking user status:", error);
            setIsActive(true); // Default to true if there's an error
          } else {
            setIsActive(data.is_active);
          }
        }
      }
    };

    if (session?.user) {
      checkUser();
    } else {
      userCheckRef.current = false;
      setUserExists(null);
      setIsActive(null);
    }
  }, [session]);

  // Handle loading states first
  if (loading || permissionLoading || (session && (userExists === null || isActive === null))) {
    return <LoadingOverlay />;
  }

  // Handle public routes that don't need authentication
  if (location.pathname === "/" || location.pathname === '/homepage') {
    return <>{children || <Outlet />}</>;
  }

  // Handle banned users first (even if they have a session)
  if (session && isActive === false) {
    // Sign out the user and wait for it to complete
    const signOutAndRedirect = async () => {
      await supabase.auth.signOut();
      window.location.href = '/login#banned';
    };
    signOutAndRedirect();
    return <LoadingOverlay />;
  }

  // Handle unauthenticated users
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle terms acceptance
  if (!userExists || (profile && profile.terms_and_condition === false)) {
    return <Navigate to="/terms" replace />;
  }

  // Handle missing profile
  if (!profile) {
    return <LoadingOverlay />;
  }

  // Check role permissions
  if (!allowedRoles.includes(profile.role)) {
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

  // All checks passed, render the route
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
        {children || <Outlet />}
      </Box>
      <Footer />
    </Box>
  );
}