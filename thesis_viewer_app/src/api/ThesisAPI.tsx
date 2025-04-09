import { supabase } from '../lib/supabase';
import { Thesis } from '../context/AnalyticsContext';

export interface ThesisStats {
  total: number;
  active: number;
  inactive: number;
}

export const getTotalThesesCount = async (): Promise<number> => {
  const { count } = await supabase
    .from('Thesis')
    .select('*', { count: 'exact', head: true });
  
  return count || 0;
};

export const getActiveThesesCount = async (): Promise<number> => {
  const { count } = await supabase
    .from('Thesis')
    .select('*', { count: 'exact', head: true })
    .eq('isActive', true);
  
  return count || 0;
};

export const getThesisStats = async (): Promise<ThesisStats> => {
  const totalTheses = await getTotalThesesCount();
  const activeTheses = await getActiveThesesCount();
  
  return {
    total: totalTheses,
    active: activeTheses,
    inactive: totalTheses - activeTheses
  };
};

export const getAllTheses = async (): Promise<Thesis[]> => {
  const { data } = await supabase
    .from('Thesis')
    .select('id, title, category, isActive, publishing_year, author');
  
  return data || [];
};