import { APIClient } from './client';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { ActivitiesService } from './activities';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

const activitiesService = new ActivitiesService();

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
    
    const { data } = await query;
    return data || [];
  }

  async getTask(id: string): Promise<Task> {
    const session = await this.requireAuth();
    
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
      
    if (!data) throw new Error('Task not found');
    return data;
  }

  async createTask(data: Omit<TaskInsert, 'user_id'>): Promise<Task> {
    const session = await this.requireAuth();
    
    const { data: task } = await supabase
      .from('tasks')
      .insert({
        ...data,
        user_id: session.user.id,
      })
      .select()
      .single();
      
    if (!task) throw new Error('Failed to create task');

    // Track task creation activity
    await activitiesService.addActivity({
      type: 'task_created',
      title: `Created task: ${task.title}`,
      description: task.description,
      related_task_id: task.id,
      related_grow_id: task.grow_id,
    });

    return task;
  }

  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    const session = await this.requireAuth();
    
    const { data: task } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();
      
    if (!task) throw new Error('Task not found');
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const session = await this.requireAuth();
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
      
    if (error) throw error;
  }

  async toggleTaskCompletion(id: string): Promise<Task> {
    const task = await this.getTask(id);
    const updatedTask = await this.updateTask(id, { completed: !task.completed });
    
    // Track task completion activity
    if (updatedTask.completed) {
      await activitiesService.addActivity({
        type: 'task_completed',
        title: `Completed task: ${updatedTask.title}`,
        description: updatedTask.description,
        related_task_id: updatedTask.id,
        related_grow_id: updatedTask.grow_id,
      });
    }
    
    return updatedTask;
  }

  async getTaskStats(): Promise<{
    total: number;
    completed: number;
    upcoming: number;
    overdue: number;
  }> {
    const session = await this.requireAuth();
    const now = new Date().toISOString();
    
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, completed, due_date')
      .eq('user_id', session.user.id);

    if (!tasks) return { total: 0, completed: 0, upcoming: 0, overdue: 0 };

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