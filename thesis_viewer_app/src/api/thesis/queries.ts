import { supabase } from '../../lib/supabase';
import { Thesis, ThesisFilters } from './types';

const THESIS_SELECT = `
  id,
  created_at,
  title,
  description,
  category,
  pdf_url,
  isActive,
  author,
  creatorID,
  publishing_year
` as const;

export const getThesisById = async (id: number): Promise<Thesis> => {
  const { data, error } = await supabase
    .from('Thesis')
    .select(THESIS_SELECT)
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to fetch thesis: ${error.message}`);
  if (!data) throw new Error('Thesis not found');
  
  return data as Thesis;
};

export const getAllTheses = async (filters?: ThesisFilters): Promise<Thesis[]> => {
  let query = supabase
    .from('Thesis')
    .select(THESIS_SELECT);

  if (filters) {
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('isActive', filters.isActive);
    }
    if (filters.searchTerm) {
      query = query.or(
        `title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,author.ilike.%${filters.searchTerm}%`
      );
    }
    if (filters.year) {
      query = query.eq('publishing_year', filters.year);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch theses: ${error.message}`);
  
  return (data || []) as Thesis[];
};

export const getThesesByCategory = async (category: string): Promise<Thesis[]> => {
  const { data, error } = await supabase
    .from('Thesis')
    .select(THESIS_SELECT)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch theses by category: ${error.message}`);
  
  return (data || []) as Thesis[];
};

export const searchTheses = async (searchTerm: string): Promise<Thesis[]> => {
  const { data, error } = await supabase
    .from('Thesis')
    .select(THESIS_SELECT)
    .or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to search theses: ${error.message}`);
  
  return (data || []) as Thesis[];
};

export const getThesesByAuthor = async (author: string): Promise<Thesis[]> => {
  const { data, error } = await supabase
    .from('Thesis')
    .select(THESIS_SELECT)
    .eq('author', author)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch theses by author: ${error.message}`);
  
  return (data || []) as Thesis[];
};

export const getThesesByYear = async (year: number): Promise<Thesis[]> => {
  const { data, error } = await supabase
    .from('Thesis')
    .select(THESIS_SELECT)
    .eq('publishing_year', year)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch theses by year: ${error.message}`);
  
  return (data || []) as Thesis[];
};

export const getActiveTheses = async (): Promise<Thesis[]> => {
  const { data, error } = await supabase
    .from('Thesis')
    .select(THESIS_SELECT)
    .eq('isActive', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch active theses: ${error.message}`);
  
  return (data || []) as Thesis[];
};

export const getInactiveTheses = async (): Promise<Thesis[]> => {
  const { data, error } = await supabase
    .from('Thesis')
    .select(THESIS_SELECT)
    .eq('isActive', false)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch inactive theses: ${error.message}`);
  
  return (data || []) as Thesis[];
};