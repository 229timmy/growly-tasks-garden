import { APIClient } from './client';
import { supabase } from '@/lib/supabase';

export interface EnvironmentalData {
  id: string;
  grow_id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
  user_id: string;
  created_at: string;
}

interface EnvironmentalDataInsert {
  grow_id: string;
  temperature: number;
  humidity: number;
}

export class EnvironmentalService extends APIClient {
  async getEnvironmentalData(
    growId: string,
    options?: {
      from?: Date;
      to?: Date;
      interval?: '1h' | '1d' | '1w';
    }
  ): Promise<EnvironmentalData[]> {
    const session = await this.requireAuth();
    
    let query = supabase
      .from('environmental_data')
      .select('*')
      .eq('grow_id', growId)
      .eq('user_id', session.user.id)
      .order('timestamp', { ascending: true });
    
    if (options?.from) {
      query = query.gte('timestamp', options.from.toISOString());
    }
    
    if (options?.to) {
      query = query.lte('timestamp', options.to.toISOString());
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async addEnvironmentalData(
    data: EnvironmentalDataInsert
  ): Promise<EnvironmentalData> {
    const session = await this.requireAuth();
    
    const { data: newData, error } = await supabase
      .from('environmental_data')
      .insert({
        ...data,
        user_id: session.user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!newData) throw new Error('Failed to create environmental data');
    
    return newData;
  }

  async batchAddEnvironmentalData(
    data: EnvironmentalDataInsert[]
  ): Promise<EnvironmentalData[]> {
    const session = await this.requireAuth();
    
    const dataWithUserId = data.map(item => ({
      ...item,
      user_id: session.user.id,
    }));
    
    const { data: newData, error } = await supabase
      .from('environmental_data')
      .insert(dataWithUserId)
      .select();
    
    if (error) throw error;
    return newData || [];
  }

  async getLatestEnvironmentalData(
    growId: string
  ): Promise<EnvironmentalData | null> {
    const session = await this.requireAuth();
    
    const { data, error } = await supabase
      .from('environmental_data')
      .select('*')
      .eq('grow_id', growId)
      .eq('user_id', session.user.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
} 