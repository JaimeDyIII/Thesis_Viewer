import { supabase } from '../../lib/supabase';
import { UserCreateInput } from './types';
import { checkUserExists } from './queries';

export const insertUserAfterAcceptingTermsAndCondition = async (userId: string, email: string, name: string): Promise<UserCreateInput> => {
    const { data, error } = await supabase
        .from('users')
        .insert({ 
            id: userId,
            email: email,
            role: 'User',
            terms_and_condition: true,
            name: name,
        })
        .single();
    if (error) throw error;

    return data;
}

/**
 * Sign In User using Google Auth
 */ 
export const signInWithGoogle = async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                    hd: 'neu.edu.ph',
                },
                redirectTo: window.location.origin + '/terms',
            }
        });
    
        if(error) throw error;
        
        return data;
    } catch (error) {
        console.error("Google login error:", error);
        throw error;
    }
}

/**
 * Sign Out user
 */ 
export const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const updateTermsAndConditions = async (userId: string, terms_and_condition_status: boolean) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ terms_and_condition: terms_and_condition_status })
            .eq('id', userId);
            
        if (error) throw error;
    } catch (error) {
        console.error("Error updating terms and conditions:", error);
        throw error;
    }
}
