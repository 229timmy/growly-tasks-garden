import { createClient } from '@supabase/supabase-js';

// Use anon key for client-side operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a client using anon key for all client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Custom function to get the current user's ID safely
export const getCurrentUserId = async (): Promise<string | undefined> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

// Custom function to check if a user has access to a resource
export const hasResourceAccess = async (
  table: string, 
  resourceId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('id', resourceId)
      .single();
      
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error(`Access check failed for ${table}:${resourceId}:`, error);
    return false;
  }
};

// Helper function to get user session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}; 