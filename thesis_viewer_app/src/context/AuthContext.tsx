import { createContext, useContext, useEffect, ReactNode, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { signInWithGoogle, signOutUser } from "../api/auth/mutation";
import { fetchUserProfile } from "../api/auth/queries";
import { supabase } from "../lib/supabase";

type AuthContextType = {
  session: Session | null | undefined;
  profile: any;
  showError: boolean;
  loading: boolean;
  handleGoogleLogin: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  setShowError: (show: boolean) => void;
  setUserProfile: (profile: any) => void;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showError, setShowError] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isRedirecting = useRef(false);
  const profileFetchingInProgress = useRef(false);
  const [profileError, setProfileError] = useState(false);

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
  }, [location, navigate]);

    useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (
          session?.user &&
          !session.user.email?.endsWith("@neu.edu.ph") && 
          !isRedirecting.current &&
          !location.pathname.match(/^\/(login|home|$)/) 
        ) {          
          isRedirecting.current = true;
          await signOutUser();
          navigate("/login");
          return;
        }
        
        setSession(session);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
        setTimeout(() => {
          isRedirecting.current = false;
        }, 1000);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session?.user?.id);
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      isRedirecting.current = true;
      await signOutUser();
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Error signing out:", e);
    } finally {
      setTimeout(() => {
        isRedirecting.current = false;
      }, 1000);
    }
  };

  const setUserProfile = (profile: any) => {
    setProfile(profile);
  }

  
  const refreshUserProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      profileFetchingInProgress.current = true;
      setProfileError(false);
      
      const profileData = await fetchUserProfile(session.user.id);
      
      if (profileData) {
        setProfile(profileData);
        return profileData;
      } else {
        setProfileError(true);
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
      setProfileError(true);
      setProfile(null);
      return null;
    } finally {
      profileFetchingInProgress.current = false;
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
    setUserProfile,
    refreshUserProfile
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