import { APIClient } from './client';
import type { PlantMeasurement, PlantMeasurementInsert } from '@/types/common';
import { supabase } from '@/lib/supabase';
import type { PostgrestResponse } from '@supabase/supabase-js';

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
    
    const { data: newMeasurement, error } = await supabase
      .from('plant_measurements')
      .insert({
        ...data,
        user_id: session.user.id,
      })
      .select()
      .single();
      
    if (error) throw error;
    return newMeasurement as PlantMeasurement;
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
    heightGrowthRate?: number; // cm per day
    lastWatering?: Date;
    totalWaterAmount: number;
  }> {
    const session = await this.requireAuth();
    
    const { data: measurements, error } = await supabase
      .from('plant_measurements')
      .select('height, water_amount, measured_at')
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

    // Calculate growth rate using first and last height measurements
    let heightGrowthRate: number | undefined;
    if (heights.length >= 2) {
      const firstHeight = heights[0];
      const lastHeight = heights[heights.length - 1];
      const daysDiff = (
        new Date(measurements[measurements.length - 1].measured_at).getTime() -
        new Date(measurements[0].measured_at).getTime()
      ) / (1000 * 60 * 60 * 24);
      
      heightGrowthRate = (lastHeight - firstHeight) / daysDiff;
    }

    return {
      totalMeasurements: measurements.length,
      averageHeight: heights.length ? heights.reduce((a, b) => a + b) / heights.length : undefined,
      heightGrowthRate,
      lastWatering: measurements.find(m => m.water_amount)?.measured_at,
      totalWaterAmount: waterAmounts.reduce((a, b) => a + b, 0),
    };
  }
} 