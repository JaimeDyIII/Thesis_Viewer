// src/api/thesis/mutations.ts
import { supabase } from '../../lib/supabase';
import { Thesis, ThesisCreateInput, ThesisUpdateInput } from './types';

export const createThesis = async (thesis: ThesisCreateInput): Promise<Thesis> => {
  const { data, error } = await supabase
    .from('Thesis')
    .insert([thesis])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateThesis = async (id: number, thesis: ThesisUpdateInput): Promise<Thesis> => {
  const { data, error } = await supabase
    .from('Thesis')
    .update(thesis)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteThesis = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('Thesis')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const toggleThesisStatus = async (id: number): Promise<Thesis> => {
  const { data: currentThesis, error: fetchError } = await supabase
    .from('Thesis')
    .select('isActive')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from('Thesis')
    .update({ isActive: !currentThesis.isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};