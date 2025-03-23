import { APIClient } from './client';
import type { PlantCareActivity, PlantCareActivityInsert } from '@/types/common';
import { supabase } from '@/lib/supabase';
import { addDays, format, subDays } from 'date-fns';

interface CareActivityStats {
  wateringCount: number;
  feedingCount: number;
  totalActivities: number;
  wateringEffectiveness: number;
  feedingEffectiveness: number;
  wateringSchedule: {
    date: string;
    count: number;
    effectiveness: number;
  }[];
  feedingSchedule: {
    date: string;
    count: number;
    effectiveness: number;
  }[];
}

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

  async getActivityStats(days: number = 30): Promise<CareActivityStats> {
    const session = await this.requireAuth();
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Get watering activities
    const { data: wateringData, error: wateringError } = await supabase
      .from('plant_care_activities')
      .select('*')
      .eq('activity_type', 'watering')
      .eq('user_id', session.user.id)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString());

    if (wateringError) {
      throw new Error('Failed to fetch watering activities');
    }

    // Get feeding activities
    const { data: feedingData, error: feedingError } = await supabase
      .from('plant_care_activities')
      .select('*')
      .eq('activity_type', 'feeding')
      .eq('user_id', session.user.id)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString());

    if (feedingError) {
      throw new Error('Failed to fetch feeding activities');
    }

    // Calculate daily stats
    const wateringSchedule = [];
    const feedingSchedule = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Watering stats for the day
      const dayWateringActivities = wateringData.filter(
        activity => format(new Date(activity.performed_at), 'yyyy-MM-dd') === dateStr
      );
      const wateringCount = dayWateringActivities.length;
      const wateringEffectiveness = this.calculateWateringEffectiveness(dayWateringActivities);
      
      wateringSchedule.push({
        date: dateStr,
        count: wateringCount,
        effectiveness: wateringEffectiveness,
      });

      // Feeding stats for the day
      const dayFeedingActivities = feedingData.filter(
        activity => format(new Date(activity.performed_at), 'yyyy-MM-dd') === dateStr
      );
      const feedingCount = dayFeedingActivities.length;
      const feedingEffectiveness = this.calculateFeedingEffectiveness(dayFeedingActivities);
      
      feedingSchedule.push({
        date: dateStr,
        count: feedingCount,
        effectiveness: feedingEffectiveness,
      });

      currentDate = addDays(currentDate, 1);
    }

    // Calculate overall stats
    const totalWateringCount = wateringData.length;
    const totalFeedingCount = feedingData.length;
    const totalActivities = totalWateringCount + totalFeedingCount;

    const overallWateringEffectiveness = this.calculateWateringEffectiveness(wateringData);
    const overallFeedingEffectiveness = this.calculateFeedingEffectiveness(feedingData);

    return {
      wateringCount: totalWateringCount,
      feedingCount: totalFeedingCount,
      totalActivities,
      wateringEffectiveness: overallWateringEffectiveness,
      feedingEffectiveness: overallFeedingEffectiveness,
      wateringSchedule,
      feedingSchedule,
    };
  }

  private calculateWateringEffectiveness(activities: any[]): number {
    if (activities.length === 0) return 0;

    // Calculate effectiveness based on:
    // 1. Time since last watering
    // 2. Plant moisture level
    // 3. Plant health score
    const effectivenessScores = activities.map(activity => {
      let score = 100;

      // Deduct points if watering frequency is too high or too low
      const daysSinceLastWatering = activity.days_since_last_watering || 0;
      if (daysSinceLastWatering > 7) {
        score -= (daysSinceLastWatering - 7) * 10;
      } else if (daysSinceLastWatering < 2) {
        score -= (2 - daysSinceLastWatering) * 15;
      }

      // Adjust based on moisture level
      const moistureLevel = activity.moisture_level || 50;
      if (moistureLevel < 30) {
        score -= (30 - moistureLevel);
      } else if (moistureLevel > 70) {
        score -= (moistureLevel - 70);
      }

      // Consider plant health
      const healthScore = activity.health_score || 5;
      score += (healthScore - 5) * 5;

      return Math.max(0, Math.min(100, score));
    });

    return effectivenessScores.reduce((sum, score) => sum + score, 0) / activities.length;
  }

  private calculateFeedingEffectiveness(activities: any[]): number {
    if (activities.length === 0) return 0;

    // Calculate effectiveness based on:
    // 1. Time since last feeding
    // 2. Plant nutrient levels
    // 3. Growth rate after feeding
    const effectivenessScores = activities.map(activity => {
      let score = 100;

      // Deduct points if feeding frequency is too high or too low
      const daysSinceLastFeeding = activity.days_since_last_feeding || 0;
      if (daysSinceLastFeeding > 14) {
        score -= (daysSinceLastFeeding - 14) * 5;
      } else if (daysSinceLastFeeding < 7) {
        score -= (7 - daysSinceLastFeeding) * 10;
      }

      // Adjust based on nutrient levels
      const nutrientLevel = activity.nutrient_level || 50;
      if (nutrientLevel < 30) {
        score -= (30 - nutrientLevel);
      } else if (nutrientLevel > 70) {
        score -= (nutrientLevel - 70);
      }

      // Consider growth rate
      const growthRate = activity.growth_rate || 0;
      score += growthRate * 5;

      return Math.max(0, Math.min(100, score));
    });

    return effectivenessScores.reduce((sum, score) => sum + score, 0) / activities.length;
  }
} 