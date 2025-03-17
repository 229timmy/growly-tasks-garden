import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ActivitiesService } from '@/lib/api/activities';

const activitiesService = new ActivitiesService();

// Activity types that we'll track
type ActivityType = 
  | 'plant_measurement'
  | 'plant_photo'
  | 'task_completed'
  | 'task_created'
  | 'grow_updated'
  | 'plant_updated';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  related_grow_id?: string;
  related_plant_id?: string;
  related_task_id?: string;
}

interface ActivityFeedProps {
  className?: string;
  limit?: number;
}

export function ActivityFeed({ className, limit = 10 }: ActivityFeedProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesService.listActivities({ limit }),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'plant_measurement':
        return '📏';
      case 'plant_photo':
        return '📸';
      case 'task_completed':
        return '✅';
      case 'task_created':
        return '📝';
      case 'grow_updated':
        return '🌱';
      case 'plant_updated':
        return '🪴';
      default:
        return '📌';
    }
  };

  const getActivityLink = (activity: Activity) => {
    if (activity.related_grow_id) {
      return {
        href: `/app/grows/${activity.related_grow_id}`,
        label: 'View Grow',
      };
    }
    if (activity.related_plant_id) {
      return {
        href: `/app/plants/${activity.related_plant_id}`,
        label: 'View Plant',
      };
    }
    if (activity.related_task_id) {
      return {
        href: `/app/tasks#${activity.related_task_id}`,
        label: 'View Task',
      };
    }
    return null;
  };

  return (
    <Card className={cn('h-[400px]', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !activities?.length ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 text-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{activity.title}</p>
                    {activity.description && (
                      <p className="text-muted-foreground">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                      {getActivityLink(activity) && (
                        <Link
                          to={getActivityLink(activity)!.href}
                          className="text-xs text-primary hover:underline"
                        >
                          {getActivityLink(activity)!.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
} 