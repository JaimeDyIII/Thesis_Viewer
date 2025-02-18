import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  user: any; 
  children: React.ReactNode;
}

// Protected routes to block people from accessing pages before logging in.
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

export default ProtectedRoute; 