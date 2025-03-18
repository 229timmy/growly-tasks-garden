import { APIClient } from './client';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { ActivitiesService } from './activities';
import { NotificationsService } from './notifications';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

const activitiesService = new ActivitiesService();
const notificationsService = new NotificationsService();

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

  async addTask(data: Omit<TaskInsert, 'user_id'>): Promise<Task> {
    const session = await this.requireAuth();
    
    const { data: task, error } = await supabase
      .from('tasks')
      .insert([{
        ...data,
        user_id: session.user.id,
      }])
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    
    // Track task creation activity
    await activitiesService.trackTaskCreated(task.id, task.title);
    
    // Send notification if task is due soon (within 24 hours)
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
        await notificationsService.notifyTaskDue(task.id, task.title, dueDate);
      }
    }
    
    return task;
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const session = await this.requireAuth();
    
    const { data: task, error } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    
    // If due date was updated, check if we need to send a notification
    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      const now = new Date();
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
        await notificationsService.notifyTaskDue(task.id, task.title, dueDate);
      }
    }
    
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
      await activitiesService.trackTaskCompleted(updatedTask.id, updatedTask.title);
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

  async checkOverdueTasks(): Promise<void> {
    const session = await this.requireAuth();
    const now = new Date().toISOString();
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('completed', false)
      .lt('due_date', now);
    
    if (error) throw this.handleError(error);
    
    // Send notifications for overdue tasks
    for (const task of tasks) {
      await notificationsService.notifyTaskOverdue(task.id, task.title);
    }
  }
} 