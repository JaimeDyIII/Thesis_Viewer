import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import { supabase } from '../config';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        if (userData.role === 'User' || userData.role === 'Admin') {
          setAuthorized(true);
          if (userData.role === 'User') {
            <Navigate to="/user" state={{ from: location }} replace />
            return;
          }
      
          if (userData.role === 'Admin') {
            <Navigate to="/admin" state={{ from: location }} replace />;
          }
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        console.error(error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}