// src/api/auth.ts - Complete file
import { supabase } from "../lib/supabase";

/**
 * Signs the user in with Google OAuth
 */
export const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login'
      }
    });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

/**
 * Signs out the current user
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Fetches user profile data from database
 * @param userId The ID of the user
 * @returns The user profile data or null on error
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Updates a user's profile to indicate they've accepted the terms and conditions
 * @param userId The ID of the user
 * @param accepted Whether the user has accepted the terms
 * @returns The updated profile data or null on error
 */
export const updateUserTermsAcceptance = async (userId: string, accepted: boolean) => {
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