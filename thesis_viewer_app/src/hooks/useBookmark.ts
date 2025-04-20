import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useBookmark = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const checkBookmark = async (thesisId: number): Promise<boolean> => {
    if (!userId) return false;
    
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('thesis_id', thesisId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  };

  const toggleBookmark = async (thesisId: number): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    
    const isBookmarked = await checkBookmark(thesisId);
    
    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('thesis_id', thesisId)
        .eq('user_id', userId);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert([{ thesis_id: thesisId, user_id: userId }]);
      
      if (error) throw error;
    }
  };

  return {
    checkBookmark,
    toggleBookmark
  };
};