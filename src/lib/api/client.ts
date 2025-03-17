import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { toast } from 'sonner';

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class APIClient {
  constructor() {
    // Initialize with Supabase client
  }

  // Helper to handle API errors consistently
  protected handleError(error: unknown): never {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      toast.error(error.message);
      throw new APIError(error.message);
    }
    
    const message = 'An unexpected error occurred';
    toast.error(message);
    throw new APIError(message);
  }

  // Helper to check if user is authenticated
  protected async requireAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw new APIError('Authentication error', 401);
    if (!session) throw new APIError('Not authenticated', 401);
    
    return session;
  }

  // Generic database query helper with error handling
  protected async query<T>(
    operation: () => Promise<{ data: T | null; error: Error | null }>,
    requireData: boolean = true
  ): Promise<T> {
    try {
      const { data, error } = await operation();
      if (error) throw error;
      if (requireData && !data) throw new Error('No data returned from query');
      return data as T;
    } catch (error) {
      return this.handleError(error);
    }
  }
} 