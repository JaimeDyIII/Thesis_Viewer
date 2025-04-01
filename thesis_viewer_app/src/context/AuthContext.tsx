import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation  } from "react-router-dom";
import { Session } from '@supabase/supabase-js'; 

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
        const hashParams = new URLSearchParams(location.hash.replace('#', '?'));
        
        if (searchParams.get('error') || hashParams.get('error')) {
            console.error("Auth error from URL:", searchParams.get('error_description') || hashParams.get('error_description'));
            setShowError(true);
            navigate('/login', { replace: true });
        }
    }, [location]);
    
    // Set data and listen to auth changes
    useEffect(() => {
        const setData = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (!session?.user?.email?.endsWith('@neu.edu.ph')) {
              await supabase.auth.signOut();
              navigate('/login')
            }

            if(error) throw error;
            setSession(session);
            setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setLoading(false);
            console.log("Auth state changed:", event, session?.user?.id);
        });

        setData();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Fetching Profile
    useEffect(() => {
        if (session && session.user) {
          const fetchProfile = async () => {
            const { data, error } = await supabase
              .from("users")
              .select("role")
              .eq("id", session.user.id)
              .single();
            if (error) {
              console.error("Error fetching profile:", error.message);
            } else {
              setProfile(data);
            }
          };
          fetchProfile();
        } else {
          setProfile(null);
        }
    }, [session]);

    // Role based redirection
    useEffect(() => {
        if (session && session.user && profile && location.pathname === "/login") {
            navigate("/dashboard", { replace: true });
        }
      }, [session, profile, location.pathname, navigate]);


    const handleGoogleLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: window.location.origin + '/login',
                }
            });

            if(error) throw error;
            console.log("Google auth initiated:", data);
        } catch(e) {
            console.error(e);
        }
    }

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/login', { replace: true });
        } catch (e){
            console.error('Error signing out: ', e);
        }
    }


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
        throw new Error('useAuth must be used within an AuthProvider');
    }  
    return context;
};