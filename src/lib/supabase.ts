import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DownloadRecord = {
  id: string;
  user_id: string | null;
  video_id: string;
  title: string;
  thumbnail: string | null;
  format: string;
  quality: string;
  url: string;
  created_at: string;
};
