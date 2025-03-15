import { APIClient } from './client';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export class TasksService extends APIClient {
  async listTasks(filters?: {
    growId?: string;
    completed?: boolean;
    priority?: Task['priority'];
    limit?: number;
    offset?: number;
  }): Promise<Task[]> {
    const session = await this.requireAuth();
    
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('due_date', { ascending: true });
    
    if (filters?.growId) {
      query = query.eq('grow_id', filters.growId);
    }
    
    if (filters?.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }
    
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    return this.query(() => query);
  }

  async getTask(id: string): Promise<Task> {
    const session = await this.requireAuth();
    
    return this.query(() =>
      supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single()
    );
  }

  async createTask(data: Omit<TaskInsert, 'user_id'>): Promise<Task> {
    const session = await this.requireAuth();
    
    return this.query(() =>
      supabase
        .from('tasks')
        .insert({
          ...data,
          user_id: session.user.id,
        })
        .select()
        .single()
    );
  }

  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    const session = await this.requireAuth();
    
    return this.query(() =>
      supabase
        .from('tasks')
        .update(data)
        .eq('id', id)
        .eq('user_id', session.user.id)
        .select()
        .single()
    );
  }

  async deleteTask(id: string): Promise<void> {
    const session = await this.requireAuth();
    
    await this.query(() =>
      supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id)
    );
  }

  async toggleTaskCompletion(id: string): Promise<Task> {
    const task = await this.getTask(id);
    return this.updateTask(id, { completed: !task.completed });
  }

  async getTaskStats(): Promise<{
    total: number;
    completed: number;
    upcoming: number;
    overdue: number;
  }> {
    const session = await this.requireAuth();
    const now = new Date().toISOString();
    
    const tasks = await this.query(() =>
      supabase
        .from('tasks')
        .select('id, completed, due_date')
        .eq('user_id', session.user.id)
    );

    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      upcoming: tasks.filter(t => !t.completed && (!t.due_date || t.due_date > now)).length,
      overdue: tasks.filter(t => !t.completed && t.due_date && t.due_date < now).length,
    };
  }

  async deleteCompletedTasks(): Promise<void> {
    const session = await this.requireAuth();
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', session.user.id)
      .eq('completed', true);
      
    if (error) throw error;
  }
} 