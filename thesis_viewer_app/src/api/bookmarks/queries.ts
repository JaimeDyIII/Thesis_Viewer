import { supabase } from '../../lib/supabase';
import { FeaturedThesis } from './types';

export const getFeaturedThesis = async (): Promise<FeaturedThesis[]> => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('thesis_id, bookmarked_at, Thesis(id, title, author)')
      .order('bookmarked_at', { ascending: false })
      .limit(4);
  
    if (error) {
      throw new Error(`Failed to fetch theses: ${error.message}`);
    }
  
    return (data || []) as FeaturedThesis[];
  };