import { APIClient } from './client';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { StorageService, PhotoMetadata } from './storage';
import type { Tables } from '@/types/common';

type Plant = Database['public']['Tables']['plants']['Row'];
type PlantInsert = Database['public']['Tables']['plants']['Insert'];
type PlantUpdate = Database['public']['Tables']['plants']['Update'];
type Grow = Database['public']['Tables']['grows']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];

export interface PlantPhoto {
  id: string;
  plant_id: string;
  file_name: string;
  content_type: string;
  size: number;
  url: string;
  user_id: string;
  created_at: string;
}

export class PlantsService extends APIClient {
  private storageService: StorageService;

  constructor() {
    super();
    this.storageService = new StorageService();
    // Initialize storage service
    this.storageService.initialize().catch(console.error);
  }

  async listPlants(filters?: {
    growId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Plant[]> {
    const session = await this.requireAuth();
    
    let query = supabase
      .from('plants')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (filters?.growId) {
      query = query.eq('grow_id', filters.growId);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    return this.query(() => query);
  }

  async getPlant(id: string): Promise<Plant | null> {
    try {
      const session = await this.requireAuth();
      
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching plant:', error);
      return null;
    }
  }

  private async checkPlantLimit(growId: string): Promise<boolean> {
    const session = await this.requireAuth();

    // Get user's profile with tier
    const profile = await this.query<Profile>(() =>
      supabase
        .from('profiles')
        .select('tier')
        .eq('id', session.user.id)
        .single()
    );

    // Get tier limits from subscription plans
    const tierLimits = await this.query<{ max_plants_per_grow: number }>(() =>
      supabase
        .from('subscription_plans')
        .select('max_plants_per_grow')
        .eq('name', profile.tier)
        .single()
    );

    // Get current plant count for this grow - don't require data for this query
    const result = await this.query<{ count: number }>(
      () =>
        supabase
          .from('plants')
          .select('*', { count: 'exact', head: true })
          .eq('grow_id', growId),
      false // Set requireData to false for this query
    );

    const count = result?.count ?? 0;
    return count < tierLimits.max_plants_per_grow;
  }

  async createPlant(data: PlantInsert): Promise<Plant> {
    const session = await this.requireAuth();
    
    const canAddPlant = await this.checkPlantLimit(data.grow_id);
    if (!canAddPlant) {
      throw new Error('Plant limit reached for this grow. Please upgrade your plan to add more plants.');
    }

    return this.query<Plant>(() =>
      supabase
        .from('plants')
        .insert({
          ...data,
          user_id: session.user.id
        })
        .select('*')
        .single()
    );
  }

  async updatePlant(id: string, data: PlantUpdate): Promise<Plant> {
    return this.query<Plant>(() =>
      supabase
        .from('plants')
        .update(data)
        .eq('id', id)
        .select('*')
        .single()
    );
  }

  async deletePlant(id: string): Promise<void> {
    await this.query(() =>
      supabase
        .from('plants')
        .delete()
        .eq('id', id)
    );
  }

  async getPlantStats(): Promise<{
    total: number;
    byGrow: Record<string, number>;
  }> {
    const session = await this.requireAuth();
    
    const plants = await this.query<Plant[]>(() =>
      supabase
        .from('plants')
        .select('grow_id')
        .eq('user_id', session.user.id)
    );

    const byGrow: Record<string, number> = {};

    plants.forEach((plant) => {
      byGrow[plant.grow_id] = (byGrow[plant.grow_id] || 0) + 1;
    });

    return {
      total: plants.length,
      byGrow,
    };
  }

  // Photo management methods

  /**
   * Upload a photo for a plant and store metadata
   */
  async uploadPlantPhoto(plantId: string, file: File): Promise<PlantPhoto> {
    const session = await this.requireAuth();
    
    try {
      // Upload to storage
      const photoMetadata = await this.storageService.uploadPlantPhoto(plantId, file);
      
      // Store metadata in database
      const { data, error } = await supabase
        .from('plant_photos')
        .insert({
          plant_id: plantId,
          file_name: photoMetadata.fileName,
          content_type: photoMetadata.contentType,
          size: photoMetadata.size,
          url: photoMetadata.url,
          user_id: session.user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update plant's last_photo_url and photo_count
      await this.updatePlantPhotoInfo(plantId);
      
      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all photos for a plant
   */
  async getPlantPhotos(plantId: string): Promise<PlantPhoto[]> {
    const session = await this.requireAuth();
    
    return this.query(() =>
      supabase
        .from('plant_photos')
        .select('*')
        .eq('plant_id', plantId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
    );
  }

  /**
   * Delete a plant photo
   */
  async deletePlantPhoto(photoId: string): Promise<void> {
    const session = await this.requireAuth();
    
    try {
      // Get the photo metadata
      const { data: photo, error } = await supabase
        .from('plant_photos')
        .select('*')
        .eq('id', photoId)
        .eq('user_id', session.user.id)
        .single();
      
      if (error) throw error;
      if (!photo) throw new Error('Photo not found');
      
      // Delete from storage
      await this.storageService.deletePlantPhoto(photo.plant_id, photo.file_name);
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('plant_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', session.user.id);
      
      if (deleteError) throw deleteError;
      
      // Update plant's last_photo_url and photo_count
      await this.updatePlantPhotoInfo(photo.plant_id);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete all photos for a plant
   */
  async deleteAllPlantPhotos(plantId: string): Promise<void> {
    const session = await this.requireAuth();
    
    try {
      // Delete from storage
      await this.storageService.deleteAllPlantPhotos(plantId);
      
      // Delete from database
      const { error } = await supabase
        .from('plant_photos')
        .delete()
        .eq('plant_id', plantId)
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      // Update plant's photo info
      await this.updatePlant(plantId, {
        last_photo_url: null,
        photo_count: 0
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update a plant's last_photo_url and photo_count
   */
  private async updatePlantPhotoInfo(plantId: string): Promise<void> {
    try {
      // Get the latest photo
      const { data: photos, error } = await supabase
        .from('plant_photos')
        .select('*')
        .eq('plant_id', plantId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      // Get the total count
      const { count, error: countError } = await supabase
        .from('plant_photos')
        .select('*', { count: 'exact', head: true })
        .eq('plant_id', plantId);
      
      if (countError) throw countError;
      
      // Update the plant
      await this.updatePlant(plantId, {
        last_photo_url: photos && photos.length > 0 ? photos[0].url : null,
        photo_count: count || 0
      });
    } catch (error) {
      console.error('Failed to update plant photo info:', error);
    }
  }

  /**
   * Get the latest photo for a plant
   */
  async getPlantPhoto(plantId: string): Promise<string | null> {
    const session = await this.requireAuth();
    console.log(`Fetching latest photo for plant ${plantId}`);
    
    try {
      // Get the latest photo
      const photos = await this.query(() => 
        supabase
          .from('plant_photos')
          .select('*')
          .eq('plant_id', plantId)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
      );
      
      console.log(`Found ${photos?.length || 0} photos for plant ${plantId}`);
      
      if (!photos || photos.length === 0) {
        // Fall back to the last_photo_url on the plant
        const plant = await this.query(() =>
          supabase
            .from('plants')
            .select('last_photo_url')
            .eq('id', plantId)
            .eq('user_id', session.user.id)
            .single()
        );
        
        return plant?.last_photo_url || null;
      }
      
      console.log(`Returning photo URL for plant ${plantId}:`, photos[0].url);
      return photos[0].url;
    } catch (error) {
      console.error('Failed to get plant photo:', error);
      return null;
    }
  }
} 