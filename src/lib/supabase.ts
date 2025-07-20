import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug
console.log('Environment Variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'set' : 'not set',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'not set',
  NODE_ENV: import.meta.env.MODE
});

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Check if Supabase is properly configured
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

console.log('Supabase Configuration:', {
  isConfigured: isSupabaseConfigured,
  url: supabaseUrl,
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'not set'
});

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'DozAsistan' }
  }
});

// Test the connection
if (isSupabaseConfigured) {
  console.log('Testing Supabase connection...');
  
  // Test auth state first
  supabase.auth.getSession()
    .then(({ data }: { data: { session: any } }) => {
      console.log('Current auth session:', data.session);
      
      // Then test database connection
      return supabase.from('users').select('*').limit(1);
    })
    .then(({ error }: { error: any }) => {
      if (error) {
        console.error('Supabase database connection test failed:', error);
      } else {
        console.log('Supabase database connection test successful');
      }
    })
    .catch((error: Error) => {
      console.error('Error during Supabase tests:', error);
    });
} else {
  console.error('❌ Supabase not configured properly. Please check your environment variables.');
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          avatar_url: string | null;
          theme: 'light' | 'dark';
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email?: string | null;
          avatar_url?: string | null;
          theme?: 'light' | 'dark';
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string | null;
          avatar_url?: string | null;
          theme?: 'light' | 'dark';
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      medicines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          dosage: string;
          frequency: string;
          times: string[];
          start_date: string;
          end_date: string | null;
          notes: string | null;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          dosage: string;
          frequency: string;
          times: string[];
          start_date: string;
          end_date?: string | null;
          notes?: string | null;
          color: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          dosage?: string;
          frequency?: string;
          times?: string[];
          start_date?: string;
          end_date?: string | null;
          notes?: string | null;
          color?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      medicine_taken: {
        Row: {
          id: string;
          medicine_id: string;
          user_id: string;
          taken_at: string;
          scheduled_time: string;
          status: 'taken' | 'missed' | 'pending';
          created_at: string;
        };
        Insert: {
          id?: string;
          medicine_id: string;
          user_id: string;
          taken_at: string;
          scheduled_time: string;
          status: 'taken' | 'missed' | 'pending';
          created_at?: string;
        };
        Update: {
          id?: string;
          medicine_id?: string;
          user_id?: string;
          taken_at?: string;
          scheduled_time?: string;
          status?: 'taken' | 'missed' | 'pending';
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'warning' | 'success' | 'error';
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'warning' | 'success' | 'error';
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          is_read?: boolean;
        };
      };
      family_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          relationship: string;
          birth_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          relationship: string;
          birth_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          relationship?: string;
          birth_date?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      mood_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: 'very-bad' | 'bad' | 'neutral' | 'good' | 'very-good';
          energy: number;
          symptoms: string[];
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          mood: 'very-bad' | 'bad' | 'neutral' | 'good' | 'very-good';
          energy: number;
          symptoms: string[];
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          mood?: 'very-bad' | 'bad' | 'neutral' | 'good' | 'very-good';
          energy?: number;
          symptoms?: string[];
          notes?: string | null;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_points: number;
          current_streak: number;
          longest_streak: number;
          total_medicines_taken: number;
          adherence_rate: number;
          level: number;
          achievements: string[];
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_points?: number;
          current_streak?: number;
          longest_streak?: number;
          total_medicines_taken?: number;
          adherence_rate?: number;
          level?: number;
          achievements?: string[];
          last_updated?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_points?: number;
          current_streak?: number;
          longest_streak?: number;
          total_medicines_taken?: number;
          adherence_rate?: number;
          level?: number;
          achievements?: string[];
          last_updated?: string;
        };
      };
    };
  };
}