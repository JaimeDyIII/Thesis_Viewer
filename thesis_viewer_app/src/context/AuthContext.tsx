import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { signInWithGoogle, signOutUser, fetchUserProfile } from "../api/auth";
import { supabase } from "../lib/supabase";

type AuthContextType = {
  session: Session | null | undefined;
  profile: any;
  showError: boolean;
  loading: boolean;
  handleGoogleLogin: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  setShowError: (show: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showError, setShowError] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace("#", "?"));

    if (searchParams.get("error") || hashParams.get("error")) {
      console.error(
        "Auth error from URL:",
        searchParams.get("error_description") || hashParams.get("error_description")
      );
      setShowError(true);
      navigate("/login", { replace: true });
    }
  }, [location]);

  // Set session and listen to auth changes
    useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        // Check if the email domain is valid
        if (!session?.user?.email?.endsWith("@neu.edu.ph") && location.pathname !== "/" && location.pathname !== "/home" && !location.pathname.match(/\/.*/)) {          
          await signOutUser();
          navigate("/login");
        } else {
          setSession(session);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false)
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Update session when auth state changes
      setSession(session);
      setLoading(false);
      console.log("Auth state changed:", session?.user?.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]); 


  useEffect(() => {
    if (session?.user) {
      const loadProfile = async () => {
        const profileData = await fetchUserProfile(session.user.id);
        setProfile(profileData);
      };
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("Google login error:", e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  const value = {
    session,
    profile,
    showError,
    loading,
    handleGoogleLogin,
    handleSignOut,
    setShowError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
