import { supabase } from '../../lib/supabase';
import { Session } from "@supabase/supabase-js";

/**
 *  Fetch User Session
 */
export const getUserSession = async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
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

/**
 * Check if user exists in the database
 */
export const checkUserExists = async (userId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // User doesn't exist
                return false;
            }
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error('Error checking if user exists:', error);
        return false;
    }
};