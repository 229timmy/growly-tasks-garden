import { APIClient } from './client';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';

type Grow = Database['public']['Tables']['grows']['Row'];
type GrowInsert = Database['public']['Tables']['grows']['Insert'];
type GrowUpdate = Database['public']['Tables']['grows']['Update'];

export class GrowsService extends APIClient {
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
    
    const result = await this.query(() => query);
    console.log('Grows fetched:', result);
    return result;
  }

  async getGrow(id: string): Promise<Grow> {
    const session = await this.requireAuth();
    
    return this.query(() =>
      supabase
        .from('grows')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single()
    );
  }

  async createGrow(data: Omit<GrowInsert, 'user_id'>): Promise<Grow> {
    const session = await this.requireAuth();
    
    return this.query(() =>
      supabase
        .from('grows')
        .insert({
          ...data,
          user_id: session.user.id,
        })
        .select()
        .single()
    );
  }

  async updateGrow(id: string, data: GrowUpdate): Promise<Grow> {
    const session = await this.requireAuth();
    
    return this.query(() =>
      supabase
        .from('grows')
        .update(data)
        .eq('id', id)
        .eq('user_id', session.user.id)
        .select()
        .single()
    );
  }

  async deleteGrow(id: string): Promise<void> {
    const session = await this.requireAuth();
    
    type DeleteResponse = null;
    await this.query<DeleteResponse>(
      () =>
        supabase
          .from('grows')
          .delete()
          .eq('id', id)
          .eq('user_id', session.user.id),
      false
    );
  }

  async getGrowStats(id: string): Promise<{
    plantCount: number;
    activeTasks: number;
    completedTasks: number;
  }> {
    const session = await this.requireAuth();
    
    type StatsResponse = {
      plants: Array<{ id: string }>;
      tasks: Array<{ id: string; completed: boolean }>;
    };

    const [plants, tasks] = await Promise.all([
      this.query<Array<{ id: string }>>(
        () =>
          supabase
            .from('plants')
            .select('id')
            .eq('grow_id', id)
            .eq('user_id', session.user.id)
      ),
      this.query<Array<{ id: string; completed: boolean }>>(
        () =>
          supabase
            .from('tasks')
            .select('id, completed')
            .eq('grow_id', id)
            .eq('user_id', session.user.id)
      ),
    ]);

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
    
    try {
      // First get all plants for this grow
      const { data: plants, error: plantsError } = await supabase
        .from('plants')
        .select('id, last_photo_url')
        .eq('grow_id', growId)
        .eq('user_id', session.user.id)
        .not('last_photo_url', 'is', null)
        .order('updated_at', { ascending: false });
      
      if (plantsError) throw plantsError;
      
      // If no plants have photos, return null
      if (!plants || plants.length === 0) {
        return null;
      }
      
      // Return the first plant's last photo URL
      return plants[0].last_photo_url;
    } catch (error) {
      console.error('Failed to get latest grow photo:', error);
      return null;
    }
  }
} 