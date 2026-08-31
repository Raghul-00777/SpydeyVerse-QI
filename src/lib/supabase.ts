import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  hasSupabaseConfig ? supabaseUrl : 'http://127.0.0.1:54321',
  hasSupabaseConfig ? supabaseAnonKey : 'missing-supabase-anon-key'
);

let _supabaseAvailable: boolean | null = null;

export async function checkSupabaseAvailable(): Promise<boolean> {
  if (_supabaseAvailable !== null) return _supabaseAvailable;
  if (!hasSupabaseConfig) {
    _supabaseAvailable = false;
    return _supabaseAvailable;
  }
  try {
    // getSession() only reads local storage — doesn't validate the key.
    // Use a real API call to verify the anon key is actually usable.
    const { error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      const msg = (error.message || '').toLowerCase();
      _supabaseAvailable = !(
        msg.includes('invalid api key') ||
        msg.includes('fetch') ||
        msg.includes('network')
      );
    } else {
      _supabaseAvailable = true;
    }
  } catch {
    _supabaseAvailable = false;
  }
  return _supabaseAvailable;
}

export function isSupabaseAvailable(): boolean {
  return _supabaseAvailable ?? false;
}

export function setSupabaseAvailable(available: boolean): void {
  _supabaseAvailable = available;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          avatar_url: string | null;
          organization: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          module: string;
          action: string;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
};
