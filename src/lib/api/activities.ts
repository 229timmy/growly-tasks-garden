import { APIClient } from './client';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Activity = Database['public']['Tables']['activities']['Row'];
type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
type ActivityType = 'plant_measurement' | 'plant_photo' | 'task_completed' | 'task_created' | 'grow_updated' | 'plant_updated';

export class ActivitiesService extends APIClient {
  async listActivities(options?: {
    type?: Activity['type'];
    limit?: number;
    offset?: number;
  }): Promise<Activity[]> {
    const session = await this.requireAuth();
    
    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', session.user.id)
      .order('timestamp', { ascending: false });
    
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async addActivity(data: Omit<ActivityInsert, 'user_id'>): Promise<Activity> {
    const session = await this.requireAuth();
    
    const { data: activity, error } = await supabase
      .from('activities')
      .insert({
        ...data,
        user_id: session.user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!activity) throw new Error('Failed to create activity');
    
    return activity;
  }

  // Helper method to track task creation
  async trackTaskCreated(taskId: string, title: string): Promise<void> {
    await this.addActivity({
      type: 'task_created',
      title: 'Task Created',
      description: title,
      related_task_id: taskId,
    });
  }

  // Helper method to track task completion
  async trackTaskCompleted(taskId: string, title: string): Promise<void> {
    await this.addActivity({
      type: 'task_completed',
      title: 'Task Completed',
      description: title,
      related_task_id: taskId,
    });
  }

  // Helper method to track plant measurement
  async trackPlantMeasurement(plantId: string, plantName: string): Promise<void> {
    await this.addActivity({
      type: 'plant_measurement',
      title: 'Plant Measured',
      description: `Recorded measurements for ${plantName}`,
      related_plant_id: plantId,
    });
  }

  // Helper method to track plant photo
  async trackPlantPhoto(plantId: string, plantName: string): Promise<void> {
    await this.addActivity({
      type: 'plant_photo',
      title: 'Photo Added',
      description: `Added photo for ${plantName}`,
      related_plant_id: plantId,
    });
  }

  // Helper method to track grow updates
  async trackGrowUpdated(growId: string, growName: string): Promise<void> {
    await this.addActivity({
      type: 'grow_updated',
      title: 'Grow Updated',
      description: `Updated grow: ${growName}`,
      related_grow_id: growId,
    });
  }

  // Helper method to track plant updates
  async trackPlantUpdated(plantId: string, plantName: string): Promise<void> {
    await this.addActivity({
      type: 'plant_updated',
      title: 'Plant Updated',
      description: `Updated plant: ${plantName}`,
      related_plant_id: plantId,
    });
  }
} 