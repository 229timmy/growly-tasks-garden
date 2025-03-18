import { APIClient } from './client';
import type { PlantMeasurement, PlantMeasurementInsert } from '@/types/common';
import { supabase } from '@/lib/supabase';
import type { PostgrestResponse } from '@supabase/supabase-js';
import { ActivitiesService } from './activities';
import { NotificationsService } from './notifications';
import { Database } from '@/types/database';

const activitiesService = new ActivitiesService();
const notificationsService = new NotificationsService();

export class PlantMeasurementsService extends APIClient {
  async listMeasurements(
    plantId: string,
    options?: {
      from?: Date;
      to?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<PlantMeasurement[]> {
    const session = await this.requireAuth();
    
    let query = supabase
      .from('plant_measurements')
      .select('*')
      .eq('plant_id', plantId)
      .eq('user_id', session.user.id)
      .order('measured_at', { ascending: false });
    
    if (options?.from) {
      query = query.gte('measured_at', options.from.toISOString());
    }
    
    if (options?.to) {
      query = query.lte('measured_at', options.to.toISOString());
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as PlantMeasurement[];
  }

  async getMeasurement(id: string): Promise<PlantMeasurement> {
    const session = await this.requireAuth();
    
    const { data, error } = await supabase
      .from('plant_measurements')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
      
    if (error) throw error;
    return data as PlantMeasurement;
  }

  async addMeasurement(data: Omit<PlantMeasurementInsert, 'user_id'>): Promise<PlantMeasurement> {
    const session = await this.requireAuth();
    
    const { data: measurement, error } = await supabase
      .from('plant_measurements')
      .insert([{
        ...data,
        user_id: session.user.id,
      }])
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    
    // Track measurement activity
    await activitiesService.trackPlantMeasurement(data.plant_id, data.plant_name || '');
    
    // Check for growth milestones
    await this.checkGrowthMilestones(data.plant_id);
    
    return measurement;
  }

  private async checkGrowthMilestones(plantId: string): Promise<void> {
    const session = await this.requireAuth();
    
    // Get the plant details
    const { data: plant } = await supabase
      .from('plants')
      .select('*')
      .eq('id', plantId)
      .eq('user_id', session.user.id)
      .single();
    
    if (!plant) return;
    
    // Get all measurements for this plant
    const { data: measurements } = await supabase
      .from('plant_measurements')
      .select('*')
      .eq('plant_id', plantId)
      .order('measured_at', { ascending: true });
    
    if (!measurements || measurements.length < 2) return;
    
    const latestMeasurement = measurements[measurements.length - 1];
    const previousMeasurement = measurements[measurements.length - 2];
    
    // Check height milestones
    if (latestMeasurement.height && previousMeasurement.height) {
      const heightGrowth = latestMeasurement.height - previousMeasurement.height;
      const heightGrowthPercent = (heightGrowth / previousMeasurement.height) * 100;
      
      if (heightGrowthPercent >= 25) {
        await notificationsService.notifyGrowthMilestone(
          plantId,
          plant.name,
          `Height increased by ${Math.round(heightGrowthPercent)}%`
        );
      }
      
      // Check absolute height milestones (every 30cm)
      const heightMilestone = Math.floor(latestMeasurement.height / 30) * 30;
      const previousHeightMilestone = Math.floor(previousMeasurement.height / 30) * 30;
      
      if (heightMilestone > previousHeightMilestone) {
        await notificationsService.notifyGrowthMilestone(
          plantId,
          plant.name,
          `Reached ${heightMilestone}cm in height`
        );
      }
    }
    
    // Check leaf count milestones
    if (latestMeasurement.leaf_count && previousMeasurement.leaf_count) {
      const leafGrowth = latestMeasurement.leaf_count - previousMeasurement.leaf_count;
      
      if (leafGrowth >= 5) {
        await notificationsService.notifyGrowthMilestone(
          plantId,
          plant.name,
          `Grew ${leafGrowth} new leaves`
        );
      }
    }
    
    // Check health score improvements
    if (latestMeasurement.health_score && previousMeasurement.health_score) {
      const healthImprovement = latestMeasurement.health_score - previousMeasurement.health_score;
      
      if (healthImprovement >= 20) {
        await notificationsService.notifyGrowthMilestone(
          plantId,
          plant.name,
          `Health score improved by ${Math.round(healthImprovement)} points`
        );
      }
    }
  }

  async updateMeasurement(
    id: string,
    data: Partial<Omit<PlantMeasurement, 'id' | 'user_id' | 'created_at'>>
  ): Promise<PlantMeasurement> {
    const session = await this.requireAuth();
    
    const { data: updatedMeasurement, error } = await supabase
      .from('plant_measurements')
      .update(data)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();
      
    if (error) throw error;
    return updatedMeasurement as PlantMeasurement;
  }

  async deleteMeasurement(id: string): Promise<void> {
    const session = await this.requireAuth();
    
    const { error } = await supabase
      .from('plant_measurements')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
      
    if (error) throw error;
  }

  async getLatestMeasurement(plantId: string): Promise<PlantMeasurement | null> {
    const session = await this.requireAuth();
    
    const { data, error } = await supabase
      .from('plant_measurements')
      .select('*')
      .eq('plant_id', plantId)
      .eq('user_id', session.user.id)
      .order('measured_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data as PlantMeasurement | null;
  }

  async getMeasurementStats(plantId: string): Promise<{
    totalMeasurements: number;
    averageHeight?: number;
    heightGrowthRate?: number;
    averageHealthScore?: number;
    averageLeafCount?: number;
    lastWatering?: Date;
    totalWaterAmount: number;
  }> {
    const session = await this.requireAuth();
    
    const { data: measurements, error } = await supabase
      .from('plant_measurements')
      .select('height, water_amount, measured_at, health_score, leaf_count, growth_rate')
      .eq('plant_id', plantId)
      .eq('user_id', session.user.id)
      .order('measured_at', { ascending: true });
      
    if (error) throw error;
    
    if (!measurements || measurements.length === 0) {
      return {
        totalMeasurements: 0,
        totalWaterAmount: 0,
      };
    }

    const heights = measurements
      .map(m => m.height)
      .filter((h): h is number => h != null);
    
    const waterAmounts = measurements
      .map(m => m.water_amount)
      .filter((w): w is number => w != null);

    const healthScores = measurements
      .map(m => m.health_score)
      .filter((h): h is number => h != null);

    const leafCounts = measurements
      .map(m => m.leaf_count)
      .filter((l): l is number => l != null);

    // Use the automatically calculated growth rate from the database
    const latestMeasurement = measurements[measurements.length - 1];
    const heightGrowthRate = latestMeasurement?.growth_rate;

    return {
      totalMeasurements: measurements.length,
      averageHeight: heights.length ? heights.reduce((a, b) => a + b) / heights.length : undefined,
      heightGrowthRate,
      averageHealthScore: healthScores.length ? healthScores.reduce((a, b) => a + b) / healthScores.length : undefined,
      averageLeafCount: leafCounts.length ? leafCounts.reduce((a, b) => a + b) / leafCounts.length : undefined,
      lastWatering: measurements.find(m => m.water_amount)?.measured_at,
      totalWaterAmount: waterAmounts.reduce((a, b) => a + b, 0),
    };
  }
} 