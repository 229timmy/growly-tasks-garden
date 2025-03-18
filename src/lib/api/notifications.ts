import { supabase } from '@/lib/supabase';
import { APIClient } from './client';
import type { Database } from '@/types/database';

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export type NotificationType = 
  | 'task_due'
  | 'task_overdue'
  | 'environmental_alert'
  | 'growth_milestone'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high';

export class NotificationsService extends APIClient {
  async listNotifications(options?: {
    unreadOnly?: boolean;
    limit?: number;
    type?: NotificationType;
  }): Promise<Notification[]> {
    const session = await this.requireAuth();
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (options?.unreadOnly) {
      query = query.eq('read', false);
    }
    
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw this.handleError(error);
    return data;
  }

  async getUnreadCount(): Promise<number> {
    const session = await this.requireAuth();
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('read', false);
    
    if (error) throw this.handleError(error);
    return count || 0;
  }

  async markAsRead(id: string): Promise<void> {
    const session = await this.requireAuth();
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', session.user.id);
    
    if (error) throw this.handleError(error);
  }

  async markAllAsRead(): Promise<void> {
    const session = await this.requireAuth();
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
      .eq('read', false);
    
    if (error) throw this.handleError(error);
  }

  async deleteNotification(id: string): Promise<void> {
    const session = await this.requireAuth();
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
    
    if (error) throw this.handleError(error);
  }

  async addNotification(data: Omit<NotificationInsert, 'user_id'>): Promise<Notification> {
    const session = await this.requireAuth();
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        ...data,
        user_id: session.user.id,
      }])
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return notification;
  }

  // Helper methods for common notification types
  async notifyTaskDue(taskId: string, taskTitle: string, dueDate: Date): Promise<void> {
    await this.addNotification({
      type: 'task_due',
      title: 'Task Due Soon',
      message: `Task "${taskTitle}" is due on ${dueDate.toLocaleDateString()}`,
      link: `/app/tasks?id=${taskId}`,
      priority: 'normal',
      metadata: { taskId, dueDate: dueDate.toISOString() }
    });
  }

  async notifyTaskOverdue(taskId: string, taskTitle: string): Promise<void> {
    await this.addNotification({
      type: 'task_overdue',
      title: 'Task Overdue',
      message: `Task "${taskTitle}" is overdue`,
      link: `/app/tasks?id=${taskId}`,
      priority: 'high',
      metadata: { taskId }
    });
  }

  async notifyEnvironmentalAlert(
    growId: string,
    metric: string,
    value: number,
    threshold: number
  ): Promise<void> {
    await this.addNotification({
      type: 'environmental_alert',
      title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Alert`,
      message: `${metric.charAt(0).toUpperCase() + metric.slice(1)} is outside optimal range`,
      link: `/app/grows/${growId}`,
      priority: 'high',
      metadata: { growId, metric, value, threshold }
    });
  }

  async notifyGrowthMilestone(
    plantId: string,
    plantName: string,
    milestone: string
  ): Promise<void> {
    await this.addNotification({
      type: 'growth_milestone',
      title: 'Growth Milestone',
      message: `Plant "${plantName}" has reached a milestone: ${milestone}`,
      link: `/app/plants/${plantId}`,
      priority: 'normal',
      metadata: { plantId, milestone }
    });
  }
} 