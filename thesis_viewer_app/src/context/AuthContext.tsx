import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { signInWithGoogle, signOutUser, fetchUserProfile } from "../api/auth"; // Note: removed updateUserTermsAcceptance
import { supabase } from "../lib/supabase";

type AuthContextType = {
  session: Session | null | undefined;
  profile: any;
  showError: boolean;
  loading: boolean;
  showTerms: boolean;
  handleGoogleLogin: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleAcceptTerms: () => Promise<void>;
  handleDeclineTerms: () => Promise<void>;
  setShowError: (show: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showError, setShowError] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Define the function directly in AuthContext to avoid import issues
  const updateUserTermsAcceptance = async (userId: string, accepted: boolean) => {
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            terms_accepted: accepted,
            terms_accepted_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select();
          
        if (error) throw error;
        return data;
      } else {
        // Create new profile with terms acceptance
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            terms_accepted: accepted,
            terms_accepted_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating terms acceptance:', error);
      return null;
    }
  };

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

  // Set session and listen to auth changes
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        // Check if the email domain is valid
        if (session?.user?.email?.endsWith("@neu.edu.ph")) {
          setSession(session);
        } else {
          await signOutUser();
          navigate("/login");
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
  
  const handleAcceptTerms = async () => {
    try {
      if (pendingUser) {
        // Update user profile to indicate terms were accepted
        await updateUserTermsAcceptance(pendingUser.user.id, true);
        
        // Now set the session to complete login
        setSession(pendingUser);
        setPendingUser(null);
        setShowTerms(false);
      }
    } catch (e) {
      console.error("Error accepting terms:", e);
      // Clean up on error
      await signOutUser();
      setShowTerms(false);
      setPendingUser(null);
      setShowError(true);
    }
  };
  
  const handleDeclineTerms = async () => {
    try {
      // Sign out the pending user as they declined terms
      await signOutUser();
      setPendingUser(null);
      setShowTerms(false);
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Error declining terms:", e);
    }
  };

  const value = {
    session,
    profile,
    showError,
    loading,
    showTerms,
    handleGoogleLogin,
    handleSignOut,
    handleAcceptTerms,
    handleDeclineTerms,
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