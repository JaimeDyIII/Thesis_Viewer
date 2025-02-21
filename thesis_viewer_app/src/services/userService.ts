import { supabase } from '../config';

export interface User {
    id?: number;
    email: string;
    role: 'user' | 'admin';
}

export const createUserInDatabase = async (email: string) => {
    const { data, error } = await supabase
        .from('users')
        .insert([{ email, role: 'user' }])
        .select()
        .single();
    if (error) {
        console.error('Error creating user:', error);
        throw error;
    }
    return data;
};
export const checkUserExists = async (email: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking user:', error);
        throw error;
    }
    return data;
};