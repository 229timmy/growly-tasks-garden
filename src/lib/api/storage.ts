import { APIClient } from './client';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Define the bucket name for plant photos
const PLANT_PHOTOS_BUCKET = 'plant-photos';

// Flag to track if we've already checked the bucket
let bucketChecked = false;

export interface PhotoMetadata {
  id: string;
  plantId: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
  url: string;
}

export class StorageService extends APIClient {
  /**
   * Initialize the storage service and check if the plant photos bucket exists
   * Note: Bucket creation requires admin privileges and should be done in the Supabase dashboard
   */
  async initialize(): Promise<void> {
    // Only check bucket once to avoid excessive API calls
    if (bucketChecked) return;

    try {
      // Check if the bucket exists
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error listing buckets:', error.message);
        // Mark as checked even if there was an error to prevent retries
        bucketChecked = true;
        return;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === PLANT_PHOTOS_BUCKET);
      
      if (!bucketExists) {
        console.warn(`Storage bucket '${PLANT_PHOTOS_BUCKET}' does not exist. Please create it in the Supabase dashboard.`);
        console.warn('Go to: https://app.supabase.com/project/_/storage/buckets and create a bucket named "plant-photos" with public access.');
      } else {
        console.log(`Storage bucket '${PLANT_PHOTOS_BUCKET}' exists and is ready to use.`);
      }
      
      // Mark as checked to prevent future calls
      bucketChecked = true;
    } catch (error) {
      console.error('Failed to check storage buckets:', error);
      // Mark as checked even if there was an error to prevent retries
      bucketChecked = true;
    }
  }

  /**
   * Upload a photo for a plant
   */
  async uploadPlantPhoto(
    plantId: string,
    file: File
  ): Promise<PhotoMetadata> {
    const session = await this.requireAuth();
    
    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${plantId}/${uuidv4()}.${fileExt}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(PLANT_PHOTOS_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) throw error;
      if (!data) throw new Error('Upload failed');
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(PLANT_PHOTOS_BUCKET)
        .getPublicUrl(fileName);
      
      // Return metadata
      return {
        id: data.id || uuidv4(),
        plantId,
        fileName: data.path,
        contentType: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
        url: urlData.publicUrl,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all photos for a plant
   */
  async getPlantPhotos(plantId: string): Promise<PhotoMetadata[]> {
    await this.requireAuth();
    
    try {
      // List all files in the plant's folder
      const { data, error } = await supabase.storage
        .from(PLANT_PHOTOS_BUCKET)
        .list(plantId);
      
      if (error) throw error;
      if (!data) return [];
      
      // Get public URLs for all files
      return Promise.all(data.map(async (file) => {
        const path = `${plantId}/${file.name}`;
        const { data: urlData } = supabase.storage
          .from(PLANT_PHOTOS_BUCKET)
          .getPublicUrl(path);
        
        return {
          id: file.id || path,
          plantId,
          fileName: path,
          contentType: file.metadata?.mimetype || 'image/jpeg',
          size: file.metadata?.size || 0,
          createdAt: file.created_at || new Date().toISOString(),
          url: urlData.publicUrl,
        };
      }));
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a plant photo
   */
  async deletePlantPhoto(plantId: string, fileName: string): Promise<void> {
    await this.requireAuth();
    
    try {
      // Extract just the filename part if the full path is provided
      const fileNameOnly = fileName.includes('/') 
        ? fileName.split('/').pop() 
        : fileName;
      
      const path = `${plantId}/${fileNameOnly}`;
      
      const { error } = await supabase.storage
        .from(PLANT_PHOTOS_BUCKET)
        .remove([path]);
      
      if (error) throw error;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete all photos for a plant
   */
  async deleteAllPlantPhotos(plantId: string): Promise<void> {
    await this.requireAuth();
    
    try {
      // List all files in the plant's folder
      const { data, error } = await supabase.storage
        .from(PLANT_PHOTOS_BUCKET)
        .list(plantId);
      
      if (error) throw error;
      if (!data || data.length === 0) return;
      
      // Create an array of paths to delete
      const paths = data.map(file => `${plantId}/${file.name}`);
      
      // Delete all files
      const { error: deleteError } = await supabase.storage
        .from(PLANT_PHOTOS_BUCKET)
        .remove(paths);
      
      if (deleteError) throw deleteError;
    } catch (error) {
      this.handleError(error);
    }
  }
} 