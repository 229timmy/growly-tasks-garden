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

/**
 * Base API client with authentication and error handling
 */
export class APIClient {
  constructor() {
    // Initialize with Supabase client
  }

  /**
   * Require authentication before proceeding with request
   * @returns Current user session or throws if not authenticated
   */
  protected async requireAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      this.handleError(error);
    }
    
    if (!session) {
      const authError = new Error('Authentication required');
      authError.name = 'AuthError';
      throw authError;
    }
    
    return session;
  }

  /**
   * Validates input against a schema
   * @param input The input to validate
   * @param schema Simple validation schema object
   * @returns True if valid, throws error if invalid
   */
  protected validateInput(input: Record<string, any>, schema: Record<string, {
    required?: boolean;
    type?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validator?: (value: any) => boolean;
  }>) {
    const errors: string[] = [];
    
    Object.entries(schema).forEach(([key, rules]) => {
      const value = input[key];
      
      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} is required`);
        return;
      }
      
      // Skip remaining checks if value is not provided and not required
      if (value === undefined || value === null) return;
      
      // Check type
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${key} should be a ${rules.type}`);
      }
      
      // Check string constraints
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${key} should be at least ${rules.minLength} characters`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${key} should be at most ${rules.maxLength} characters`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${key} has an invalid format`);
        }
      }
      
      // Custom validator
      if (rules.validator && !rules.validator(value)) {
        errors.push(`${key} is invalid`);
      }
    });
    
    if (errors.length > 0) {
      const error = new Error(errors.join(', '));
      error.name = 'ValidationError';
      throw error;
    }
    
    return true;
  }

  /**
   * Sanitize input to prevent injection attacks
   * @param input Input to sanitize
   * @returns Sanitized input
   */
  protected sanitizeInput(input: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.entries(input).forEach(([key, value]) => {
      // Handle strings
      if (typeof value === 'string') {
        // Basic XSS prevention for strings
        sanitized[key] = value
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      } 
      // Handle nested objects recursively
      else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'object' && item !== null 
            ? this.sanitizeInput(item) 
            : (typeof item === 'string' 
              ? item.replace(/</g, '&lt;').replace(/>/g, '&gt;') 
              : item)
        );
      }
      // Pass through other types
      else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }

  /**
   * Execute a query with error handling
   * @param queryFn Function that executes the query
   * @param requireData Whether to throw an error if no data is returned
   * @returns Query result data
   */
  protected async query<T>(queryFn: () => Promise<{ data: T | null, error: any }>, requireData = true): Promise<T> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        throw error;
      }
      
      if (requireData && !data) {
        throw new Error('No data returned from query');
      }
      
      return data as T;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * @param error Error to handle
   * @returns Never returns, always throws
   */
  protected handleError(error: any): never {
    console.error('API Error:', error);
    
    // Determine error message to display
    let message = 'An unexpected error occurred';
    
    if (error?.message) {
      message = error.message;
    }
    
    // Handle specific error types
    if (error?.name === 'AuthError') {
      message = 'Please sign in to continue';
      // Redirect to login if needed
      window.location.href = '/login';
    }
    
    // Only show toast for user-facing errors
    // Skip common internal errors that don't need user notification
    const skipErrorMessages = [
      'No data returned from query'
    ];
    
    if (!skipErrorMessages.includes(message)) {
      // Show toast notification for user feedback
      toast.error(message);
    }
    
    throw error;
  }
} 