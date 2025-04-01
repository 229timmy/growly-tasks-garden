import { APIClient } from './client';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Define the bucket name for avatars
const AVATARS_BUCKET = 'avatars';

export class ProfilesService extends APIClient {
  async getProfile(userId: string): Promise<Profile | null> {
    console.log(`ProfilesService: Fetching profile for user: ${userId}`);
    
    // Use maybeSingle instead of single to avoid the PGRST116 error
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('ProfilesService: Error fetching profile:', error);
      throw error;
    }
    
    console.log('ProfilesService: Profile fetch result:', data);
    return data;
  }

  async updateProfile(userId: string, update: ProfileUpdate): Promise<Profile> {
    console.log('ProfilesService: Updating profile for user:', userId);
    console.log('ProfilesService: Update data:', update);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', userId)
      .select('*')
      .single();
      
    if (error) {
      console.error('ProfilesService: Error updating profile:', error);
      throw error;
    }
    
    console.log('ProfilesService: Profile update result:', data);
    return data;
  }

  async getCurrentProfile(): Promise<Profile> {
    console.log('ProfilesService: Getting current profile');
    const session = await this.requireAuth();
    console.log('ProfilesService: Current session:', session);
    
    // First try to get the existing profile
    const profile = await this.getProfile(session.user.id);
    
    // If profile exists, return it
    if (profile) {
      console.log('ProfilesService: Found existing profile:', profile);
      return profile;
    }
    
    // If no profile found, create one
    console.log('ProfilesService: Profile not found, creating a new one...');
    try {
      const newProfile = await this.initializeProfile(session.user.id, session.user.email || '');
      console.log('ProfilesService: Created new profile:', newProfile);
      toast.success('Profile created successfully');
      return newProfile;
    } catch (createError) {
      console.error('ProfilesService: Error creating profile:', createError);
      throw createError;
    }
  }

  /**
   * Upload a profile avatar image and update the profile with the new avatar URL
   * Note: The 'avatars' bucket must be created manually in the Supabase dashboard
   */
  async uploadAvatar(userId: string, file: File): Promise<Profile> {
    try {
      console.log('Starting avatar upload process for user:', userId);
      
      // Get current session to confirm authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }
      
      // Use a very simple file name format
      const timestamp = new Date().getTime();
      const fileName = `avatar_${timestamp}.png`;
      
      console.log(`Attempting upload to ${AVATARS_BUCKET}/${fileName}`);
      
      // First try to use a fully public bucket approach
      try {
        const { data, error: uploadError } = await supabase.storage
          .from(AVATARS_BUCKET)
          .upload(fileName, file, {
            upsert: true
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError.message);
          throw uploadError;
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from(AVATARS_BUCKET)
          .getPublicUrl(fileName);
        
        console.log('Public URL generated:', urlData.publicUrl);
        
        // Update profile with the new avatar URL
        return await this.updateProfile(userId, {
          avatar_url: urlData.publicUrl
        });
      } catch (uploadError) {
        console.error('Upload failed, trying fallback:', uploadError);
        
        // FALLBACK: If upload fails, just update the profile with a placeholder image URL
        // This is just to test if the issue is with storage or with profile updates
        
        const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=random`;
        console.log('Using placeholder URL:', placeholderUrl);
        
        return await this.updateProfile(userId, {
          avatar_url: placeholderUrl
        });
      }
    } catch (error) {
      console.error('Error in avatar update process:', error);
      throw error;
    }
  }

  private async initializeProfile(userId: string, email: string): Promise<Profile> {
    console.log(`ProfilesService: Initializing new profile for user ${userId} with email ${email}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: null,
        avatar_url: null,
        tier: 'free',
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('ProfilesService: Error initializing profile:', error);
      throw error;
    }
    
    console.log('ProfilesService: Profile initialization result:', data);
    return data;
  }
}