import { supabase } from '../lib/supabase';

export const getAllThesisBookmarkCounts = async (): Promise<Record<number, number>> => {
  const { data: bookmarksData } = await supabase
    .from('bookmarks')
    .select('thesis_id');
  
  const bookmarkCounts: Record<number, number> = {};
  (bookmarksData || []).forEach((bookmark: any) => {
    bookmarkCounts[bookmark.thesis_id] = (bookmarkCounts[bookmark.thesis_id] || 0) + 1;
  });
  
  return bookmarkCounts;
};