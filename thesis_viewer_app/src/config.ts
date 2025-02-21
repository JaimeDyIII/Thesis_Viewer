import { createClient } from '@supabase/supabase-js';
import { HfInference } from "@huggingface/inference";

// Supabase config
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
    }
})

// Hugging face
const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY!

export const inference = new HfInference(huggingFaceApiKey);