import { supabase } from '../../lib/supabase';
import { FeaturedThesis } from './types';

export const getFeaturedThesis = async (): Promise<FeaturedThesis[]> => {
  const { data: bookmarks, error: bookmarkError } = await supabase
    .from('bookmarks')
    .select('thesis_id');

  if (bookmarkError) {
    throw new Error(`Failed to fetch bookmarks: ${bookmarkError.message}`);
  }

  if (!bookmarks || bookmarks.length === 0) {
    return [];
  }
  const counts: Record<number, number> = {};
  bookmarks.forEach(b => {
    counts[b.thesis_id] = (counts[b.thesis_id] || 0) + 1;
  });

  const topThesisIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([thesis_id]) => Number(thesis_id));

  const { data: thesesData, error: thesesError } = await supabase
    .from('Thesis')
    .select('id, title, author')
    .in('id', topThesisIds);

  if (thesesError) {
    throw new Error(`Failed to fetch theses: ${thesesError.message}`);
  }

  return topThesisIds.map(thesis_id => {
    const thesis = thesesData?.find(t => t.id === thesis_id);
    return {
      thesis_id,
      Thesis: thesis ? [thesis] : []
    };
  });
};