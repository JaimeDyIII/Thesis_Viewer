// src/hooks/views/useView.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useView = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const recordViewMutation = useMutation({
    mutationFn: async (thesisId: number) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('views')
        .insert([{ thesis_id: thesisId, user_id: userId }]);
      
      if (error) throw error;
    }
  });

  const getViewCount = async (thesisId: number): Promise<number> => {
    const { count, error } = await supabase
      .from('views')
      .select('*', { count: 'exact', head: true })
      .eq('thesis_id', thesisId);

    if (error) throw error;
    return count || 0;
  };

  return {
    recordView: recordViewMutation.mutate,
    getViewCount
  };
};