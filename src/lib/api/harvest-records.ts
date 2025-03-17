import { APIClient } from './client';
import type { HarvestRecord, HarvestRecordInsert, HarvestRecordUpdate } from '@/types/common';
import { supabase } from '@/lib/supabase';

export class HarvestRecordsService extends APIClient {
  async getHarvestRecord(id: string): Promise<HarvestRecord> {
    const session = await this.requireAuth();
    
    const { data, error } = await supabase
      .from('harvest_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
      
    if (error) throw error;
    return data as HarvestRecord;
  }

  async getHarvestRecordByGrow(growId: string): Promise<HarvestRecord | null> {
    const session = await this.requireAuth();
    
    const { data, error } = await supabase
      .from('harvest_records')
      .select('*')
      .eq('grow_id', growId)
      .eq('user_id', session.user.id)
      .maybeSingle();
      
    if (error) throw error;
    return data as HarvestRecord | null;
  }

  async listHarvestRecords(options?: {
    limit?: number;
    offset?: number;
  }): Promise<HarvestRecord[]> {
    const session = await this.requireAuth();
    
    let query = supabase
      .from('harvest_records')
      .select('*')
      .eq('user_id', session.user.id)
      .order('harvest_date', { ascending: false });
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as HarvestRecord[];
  }

  async addHarvestRecord(data: Omit<HarvestRecordInsert, 'user_id'>): Promise<HarvestRecord> {
    const session = await this.requireAuth();
    
    const { data: newRecord, error } = await supabase
      .from('harvest_records')
      .insert({
        ...data,
        user_id: session.user.id,
      })
      .select()
      .single();
      
    if (error) throw error;
    return newRecord as HarvestRecord;
  }

  async updateHarvestRecord(
    id: string,
    data: Partial<HarvestRecordUpdate>
  ): Promise<HarvestRecord> {
    const session = await this.requireAuth();
    
    const { data: updatedRecord, error } = await supabase
      .from('harvest_records')
      .update(data)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();
      
    if (error) throw error;
    return updatedRecord as HarvestRecord;
  }

  async deleteHarvestRecord(id: string): Promise<void> {
    const session = await this.requireAuth();
    
    const { error } = await supabase
      .from('harvest_records')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
      
    if (error) throw error;
  }

  // Get harvest statistics for a user
  async getHarvestStats(): Promise<{
    totalHarvests: number;
    totalYield: number;
    averageYield: number;
    averageQuality: number;
  }> {
    const session = await this.requireAuth();
    
    const { data, error } = await supabase
      .from('harvest_records')
      .select('total_yield_grams, overall_quality_rating')
      .eq('user_id', session.user.id);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        totalHarvests: 0,
        totalYield: 0,
        averageYield: 0,
        averageQuality: 0,
      };
    }
    
    const totalHarvests = data.length;
    const totalYield = data.reduce((sum, record) => sum + (record.total_yield_grams || 0), 0);
    const averageYield = totalYield / totalHarvests;
    
    const qualityRatings = data
      .filter(record => record.overall_quality_rating !== null)
      .map(record => record.overall_quality_rating);
      
    const averageQuality = qualityRatings.length > 0
      ? qualityRatings.reduce((sum, rating) => sum + rating, 0) / qualityRatings.length
      : 0;
    
    return {
      totalHarvests,
      totalYield,
      averageYield,
      averageQuality,
    };
  }
} 