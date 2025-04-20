import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

/**
 *  Fetch User Session
 */
export const getUserSession = async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};


/**
 * Sign In User using Google Auth
 */ 
export const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                redirectTo: window.location.origin + '/dashboard',
            }
        });

        if(error) throw error;
        return data;
}

/**
 * Sign Out user
 */ 
export const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Fetch user profile from the database
 */
export const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
  
    if (error) {
      console.error("Error fetching profile:", error.message);
      return null;
    }
    return data;
};