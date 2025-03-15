import { APIClient } from './client';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { ActivitiesService } from './activities';

type Grow = Database['public']['Tables']['grows']['Row'];
type GrowInsert = Database['public']['Tables']['grows']['Insert'];
type GrowUpdate = Database['public']['Tables']['grows']['Update'];

export class GrowsService extends APIClient {
  private activitiesService: ActivitiesService;

  constructor() {
    super();
    this.activitiesService = new ActivitiesService();
  }

  async listGrows(filters?: {
    stage?: Grow['stage'];
    limit?: number;
    offset?: number;
  }): Promise<Grow[]> {
    const session = await this.requireAuth();
    console.log('Fetching grows for user:', session.user.id);
    
    let query = supabase
      .from('grows')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (filters?.stage) {
      query = query.eq('stage', filters.stage);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getGrow(id: string): Promise<Grow> {
    const session = await this.requireAuth();
    
    const { data, error } = await supabase
      .from('grows')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Grow not found');
    return data;
  }

  async createGrow(data: Omit<GrowInsert, 'user_id'>): Promise<Grow> {
    const session = await this.requireAuth();
    
    const { data: grow, error } = await supabase
      .from('grows')
      .insert({
        ...data,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    if (!grow) throw new Error('Failed to create grow');

    // Track the grow creation activity
    await this.activitiesService.addActivity({
      type: 'grow_updated',
      title: 'Grow Created',
      description: `Created new grow: ${data.name}`,
      related_grow_id: grow.id,
    });

    return grow;
  }

  async updateGrow(id: string, data: GrowUpdate): Promise<Grow> {
    const session = await this.requireAuth();
    
    const { data: grow, error } = await supabase
      .from('grows')
      .update(data)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!grow) throw new Error('Grow not found');

    // Track the grow update activity
    await this.activitiesService.trackGrowUpdated(grow.id, grow.name);

    return grow;
  }

  async deleteGrow(id: string): Promise<void> {
    const session = await this.requireAuth();
    
    const { error } = await supabase
      .from('grows')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;
  }

  async getGrowStats(id: string): Promise<{
    plantCount: number;
    activeTasks: number;
    completedTasks: number;
  }> {
    const session = await this.requireAuth();

    const [plantsResult, tasksResult] = await Promise.all([
      supabase
        .from('plants')
        .select('id')
        .eq('grow_id', id)
        .eq('user_id', session.user.id),
      supabase
        .from('tasks')
        .select('id, completed')
        .eq('grow_id', id)
        .eq('user_id', session.user.id),
    ]);

    if (plantsResult.error) throw plantsResult.error;
    if (tasksResult.error) throw tasksResult.error;

    const plants = plantsResult.data || [];
    const tasks = tasksResult.data || [];

    return {
      plantCount: plants.length,
      activeTasks: tasks.filter(t => !t.completed).length,
      completedTasks: tasks.filter(t => t.completed).length,
    };
  }

  /**
   * Get the latest photo for a grow by fetching the latest photo from any plant in the grow
   */
  async getLatestGrowPhoto(growId: string): Promise<string | null> {
    const session = await this.requireAuth();
    console.log(`Fetching latest photo for grow ${growId}`);
    
    try {
      // Try a different approach - query plant_photos directly
      const { data: photos, error: photosError } = await supabase
        .from('plant_photos')
        .select('url, plant_id, plants!inner(grow_id)')
        .eq('plants.grow_id', growId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (photosError) {
        console.error(`Error fetching photos for grow ${growId}:`, photosError);
        
        // Fall back to the original approach if the join query fails
        const { data: plants, error: plantsError } = await supabase
          .from('plants')
          .select('id, last_photo_url')
          .eq('grow_id', growId)
          .eq('user_id', session.user.id)
          .not('last_photo_url', 'is', null)
          .order('updated_at', { ascending: false });
        
        if (plantsError) {
          console.error(`Error fetching plants for grow ${growId}:`, plantsError);
          return null;
        }
        
        console.log(`Found ${plants?.length || 0} plants with photos for grow ${growId}`);
        
        if (!plants || plants.length === 0) {
          console.log(`No plants with photos found for grow ${growId}`);
          return null;
        }
        
        console.log(`Returning photo URL for grow ${growId} (fallback):`, plants[0].last_photo_url);
        return plants[0].last_photo_url;
      }
      
      console.log(`Found ${photos?.length || 0} photos for grow ${growId}`);
      
      if (!photos || photos.length === 0) {
        console.log(`No photos found for grow ${growId}`);
        return null;
      }
      
      console.log(`Returning photo URL for grow ${growId}:`, photos[0].url);
      return photos[0].url;
    } catch (error) {
      console.error('Failed to get latest grow photo:', error);
      return null;
    }
  }
} 