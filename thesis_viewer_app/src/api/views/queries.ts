import { supabase } from '../../lib/supabase';
import { RecentlyRead } from './types';

export const getRecentlyReadThesis = async (userId: string): Promise<RecentlyRead[]> => {
  const { data: views, error: viewsError } = await supabase
    .from('views')
    .select('thesis_id, viewed_at, user_id')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(4);

  if (viewsError) {
    throw new Error(`Failed to fetch recent views: ${viewsError.message}`);
  }

  if (!views || views.length === 0) {
    return [];
  }

  const thesisIds = views.map(view => view.thesis_id);

  const { data: theses, error: thesisError } = await supabase
    .from('Thesis')
    .select('id, title, author')
    .in('id', thesisIds);

  if (thesisError) {
    throw new Error(`Failed to fetch thesis details: ${thesisError.message}`);
  }

  return views.map(view => ({
    user_id: view.user_id,
    thesis_id: view.thesis_id,
    viewed_at: view.viewed_at,
    Thesis: theses?.find(t => t.id === view.thesis_id) ?? null,
  }));
};
