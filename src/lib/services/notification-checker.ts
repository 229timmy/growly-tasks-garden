import { SupabaseClient } from '@supabase/supabase-js';
import { TasksService } from '@/lib/api/tasks';
import { GrowsService } from '@/lib/api/grows';
import { EnvironmentalService } from '@/lib/api/environmental';
import { NotificationsService } from '@/lib/api/notifications';
import { Database } from '@/types/database';

export class NotificationChecker {
  private interval: NodeJS.Timeout | null = null;
  private tasksService: TasksService;
  private growsService: GrowsService;
  private environmentalService: EnvironmentalService;
  private notificationsService: NotificationsService;

  constructor() {
    this.tasksService = new TasksService();
    this.growsService = new GrowsService();
    this.environmentalService = new EnvironmentalService();
    this.notificationsService = new NotificationsService();
  }

  async start() {
    if (this.interval) return;
    
    // Do an initial check
    await this.checkForNotifications();
    
    // Then check every 5 minutes
    this.interval = setInterval(() => {
      this.checkForNotifications().catch(console.error);
    }, 5 * 60 * 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async checkForNotifications() {
    try {
      // Check for overdue tasks
      await this.tasksService.checkOverdueTasks();

      // Check environmental conditions for active grows
      const grows = await this.growsService.listGrows({
        stage: 'vegetative' // Check grows in vegetative stage
      });

      for (const grow of grows) {
        const conditions = await this.environmentalService.getEnvironmentalData(grow.id);
        if (conditions?.length > 0) {
          const latest = conditions[0];
          
          // Check temperature
          if (latest.temperature < grow.target_temperature - 5 || 
              latest.temperature > grow.target_temperature + 5) {
            await this.notificationsService.addNotification({
              type: 'environmental_alert',
              title: 'Temperature Alert',
              message: `Temperature is outside optimal range for "${grow.name}"`,
              link: `/app/grows/${grow.id}`,
              metadata: { 
                growId: grow.id,
                metric: 'temperature',
                value: latest.temperature,
                target: grow.target_temperature
              }
            });
          }

          // Check humidity
          if (latest.humidity < grow.target_humidity - 10 || 
              latest.humidity > grow.target_humidity + 10) {
            await this.notificationsService.addNotification({
              type: 'environmental_alert',
              title: 'Humidity Alert',
              message: `Humidity is outside optimal range for "${grow.name}"`,
              link: `/app/grows/${grow.id}`,
              metadata: {
                growId: grow.id,
                metric: 'humidity',
                value: latest.humidity,
                target: grow.target_humidity
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking for notifications:', error);
    }
  }
} 