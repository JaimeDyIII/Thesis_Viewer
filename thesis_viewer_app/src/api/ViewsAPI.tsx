import { supabase } from '../lib/supabase';

export const getAllThesisViewCounts = async (): Promise<Record<number, number>> => {
  const { data: viewsData } = await supabase
    .from('views')
    .select('thesis_id');
  
  const viewCounts: Record<number, number> = {};
  (viewsData || []).forEach((view: any) => {
    viewCounts[view.thesis_id] = (viewCounts[view.thesis_id] || 0) + 1;
  });
  
  return viewCounts;
};