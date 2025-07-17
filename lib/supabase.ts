// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Use server-side environment variables for API routes
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export interface SnapshotData {
  id?: number;
  date: string;
  top_channels: Array<{
    channel: string;
    totalCasts: number;
    mostLikedCast: {
      hash: string;
      text: string;
      author: {
        username: string;
      };
      reactions: {
        likes: Array<{ fid: number }>;
      };
    } | null;
  }>;
  most_liked_cast: {
    hash: string;
    text: string;
    author: {
      username: string;
    };
    reactions: {
      likes: Array<{ fid: number }>;
    };
    channel?: string;
  } | null;
  created_at?: string;
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
