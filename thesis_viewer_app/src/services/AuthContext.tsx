import { createContext, useContext, useEffect, ReactNode } from "react";
import { supabase } from "../config";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
    handleGoogleLogin: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    checkSession: () => Promise<void>;
  };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            console.log("Current session:", session);

            if(session?.user){
                await handleSession(session);
            }
        } catch(e) {
            console.error(e);
        }
    }

    const handleSession = async (session: any) => {
        try {
            console.log("Handling session for user:", session.user.id);

            const { data: userData, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single()

            if(error){
                console.error(error);
                throw error;
            }

            console.log("User role:", userData.role);

            if (userData.role === 'Admin') {
                navigate('/admin', { replace: true });
            } else if (userData.role === 'User'){
                navigate('/user', { replace: true });
            } else {
                console.error("Invalid role!")
            }
        } catch(e) {
            console.error(e);
        }
    }

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
    
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.id);

            if (event === 'SIGNED_IN' && session) {
            await handleSession(session);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);
    

    const value = {
        handleGoogleLogin,
        handleSignOut,
        checkSession
    };
    
    return (
        <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
    );
}
export const useAuth = () => {
      const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }  
    return context;
};