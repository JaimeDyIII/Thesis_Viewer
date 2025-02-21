import { supabase } from '../config';
import { User } from '@supabase/supabase-js';
import { checkUserExists, createUserInDatabase } from './userService';
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const handleNewUser = async (user: User) => {
        const ALLOWED_DOMAIN = "neu.edu.ph";

        if (!user.email) {
            console.error("User email is missing");
            return;
        }

        const emailDomain = user.email.split("@")[1]; 

        if (emailDomain !== ALLOWED_DOMAIN) {
            console.error("Unauthorized email domain:", emailDomain);
            await signOut();
            return;
        }

        try {
            const exists = await checkUserExists(user.email);
            if (!exists) {
                await createUserInDatabase(user.email);
                console.log("User Created!");
            }
        } catch (error) {
            console.error("Error handling new user:", error);
        }
    }

    useEffect(() => {
        const getSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
    
            if (error) {
                console.error('Error getting session:', error);
            }
    
            if (session?.user) {
                await handleNewUser(session.user);
                setUser(session.user);
            } else {
                setUser(null);
            }
    
            setLoading(false);
        };
    
        getSession();
    
        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
    
        return () => subscription.subscription?.unsubscribe();
    }, []);


    const signInWithGoogle = async () => {
        try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}`,
            },
        });

        if (error) throw error;

        } catch (error) {
            console.error('Auth error:', error);
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
