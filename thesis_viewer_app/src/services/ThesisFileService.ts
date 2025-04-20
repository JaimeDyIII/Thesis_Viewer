import { supabase } from '../lib/supabase';

export class ThesisFileService {
  static async uploadPDF(file: File): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage.from("thesis_pdfs").upload(fileName, file);

      if (error) throw error;

      const { publicUrl } = supabase.storage.from("thesis_pdfs").getPublicUrl(fileName).data;
      return publicUrl;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  }
} 