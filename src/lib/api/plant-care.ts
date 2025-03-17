import { APIClient } from './client';
import type { PlantCareActivity, PlantCareActivityInsert } from '@/types/common';
import { supabase } from '@/lib/supabase';

export class PlantCareService extends APIClient {
  async listActivities(
    options?: {
      plantId?: string;
      growId?: string;
      activityType?: 'watering' | 'feeding' | 'top_dressing' | 'other';
      from?: Date;
      to?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<PlantCareActivity[]> {
    const session = await this.requireAuth();
    
    let query = supabase
      .from('plant_care_activities')
      .select('*')
      .eq('user_id', session.user.id)
      .order('performed_at', { ascending: false });
    
    if (options?.plantId) {
      query = query.eq('plant_id', options.plantId);
    }
    
    if (options?.growId) {
      query = query.eq('grow_id', options.growId);
    }
    
    if (options?.activityType) {
      query = query.eq('activity_type', options.activityType);
    }
    
    if (options?.from) {
      query = query.gte('performed_at', options.from.toISOString());
    }
    
    if (options?.to) {
      query = query.lte('performed_at', options.to.toISOString());
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as PlantCareActivity[];
  }

  async getActivity(id: string): Promise<PlantCareActivity> {
    const session = await this.requireAuth();
    
    const { data, error } = await supabase
      .from('plant_care_activities')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
      
    if (error) throw error;
    return data as PlantCareActivity;
  }

  async addActivity(data: Omit<PlantCareActivityInsert, 'user_id'>): Promise<PlantCareActivity> {
    const session = await this.requireAuth();
    
    const { data: newActivity, error } = await supabase
      .from('plant_care_activities')
      .insert({
        ...data,
        user_id: session.user.id,
      })
      .select()
      .single();
      
    if (error) throw error;
    return newActivity as PlantCareActivity;
  }

  async addBatchActivities(
    activities: Omit<PlantCareActivityInsert, 'user_id'>[]
  ): Promise<PlantCareActivity[]> {
    const session = await this.requireAuth();
    
    const activitiesWithUserId = activities.map(activity => ({
      ...activity,
      user_id: session.user.id,
    }));
    
    const { data, error } = await supabase
      .from('plant_care_activities')
      .insert(activitiesWithUserId)
      .select();
      
    if (error) throw error;
    return data as PlantCareActivity[];
  }

  async updateActivity(
    id: string,
    data: Partial<Omit<PlantCareActivity, 'id' | 'user_id' | 'created_at'>>
  ): Promise<PlantCareActivity> {
    const session = await this.requireAuth();
    
    const { data: updatedActivity, error } = await supabase
      .from('plant_care_activities')
      .update(data)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();
      
    if (error) throw error;
    return updatedActivity as PlantCareActivity;
  }

  async deleteActivity(id: string): Promise<void> {
    const session = await this.requireAuth();
    
    const { error } = await supabase
      .from('plant_care_activities')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
      
    if (error) throw error;
  }

  async getActivityStats(
    options?: {
      plantId?: string;
      growId?: string;
      from?: Date;
      to?: Date;
    }
  ): Promise<{
    totalActivities: number;
    wateringCount: number;
    feedingCount: number;
    topDressingCount: number;
    otherCount: number;
    lastWatering?: Date;
    lastFeeding?: Date;
    lastTopDressing?: Date;
  }> {
    const session = await this.requireAuth();
    
    let query = supabase
      .from('plant_care_activities')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (options?.plantId) {
      query = query.eq('plant_id', options.plantId);
    }
    
    if (options?.growId) {
      query = query.eq('grow_id', options.growId);
    }
    
    if (options?.from) {
      query = query.gte('performed_at', options.from.toISOString());
    }
    
    if (options?.to) {
      query = query.lte('performed_at', options.to.toISOString());
    }
    
    const { data: activities, error } = await query;
    
    if (error) throw error;
    
    if (!activities || activities.length === 0) {
      return {
        totalActivities: 0,
        wateringCount: 0,
        feedingCount: 0,
        topDressingCount: 0,
        otherCount: 0,
      };
    }

    const wateringActivities = activities.filter(a => a.activity_type === 'watering');
    const feedingActivities = activities.filter(a => a.activity_type === 'feeding');
    const topDressingActivities = activities.filter(a => a.activity_type === 'top_dressing');
    const otherActivities = activities.filter(a => a.activity_type === 'other');

    // Sort activities by performed_at in descending order
    const sortedWatering = [...wateringActivities].sort(
      (a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    );
    
    const sortedFeeding = [...feedingActivities].sort(
      (a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    );
    
    const sortedTopDressing = [...topDressingActivities].sort(
      (a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    );

    return {
      totalActivities: activities.length,
      wateringCount: wateringActivities.length,
      feedingCount: feedingActivities.length,
      topDressingCount: topDressingActivities.length,
      otherCount: otherActivities.length,
      lastWatering: sortedWatering.length > 0 ? new Date(sortedWatering[0].performed_at) : undefined,
      lastFeeding: sortedFeeding.length > 0 ? new Date(sortedFeeding[0].performed_at) : undefined,
      lastTopDressing: sortedTopDressing.length > 0 ? new Date(sortedTopDressing[0].performed_at) : undefined,
    };
  }
} 