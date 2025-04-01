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
type ActivityType = string;

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  timestamp: string;
  related_grow_id: string | null;
  related_plant_id: string | null;
  related_task_id: string | null;
}

interface ActivityFeedProps {
  className?: string;
  limit?: number;
  compact?: boolean;
}

export function ActivityFeed({ className, limit = 10, compact = false }: ActivityFeedProps) {
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
    <Card className={className}>
      <CardHeader className={cn(
        compact ? "p-3" : "p-6"
      )}>
        <CardTitle className={cn(
          "text-lg font-semibold",
          compact && "text-base"
        )}>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className={cn(
        "p-0",
        !compact && "pb-4"
      )}>
        <ScrollArea className={cn(
          "h-[400px] px-6",
          compact && "h-[300px] px-3"
        )}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !activities?.length ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 pb-4 last:pb-0",
                    !compact && "text-sm"
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
                    <span role="img" aria-label={activity.type}>
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "font-medium leading-none",
                      compact && "text-sm"
                    )}>{activity.title}</p>
                    {activity.description && (
                      <p className={cn(
                        "text-muted-foreground",
                        compact ? "text-xs" : "text-sm"
                      )}>{activity.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <time className={cn(
                        "text-muted-foreground",
                        compact ? "text-xs" : "text-sm"
                      )}>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </time>
                      {getActivityLink(activity) && (
                        <>
                          <span className={cn(
                            "text-muted-foreground",
                            compact ? "text-xs" : "text-sm"
                          )}>•</span>
                          <Link
                            to={getActivityLink(activity)!.href}
                            className={cn(
                              "text-primary hover:underline",
                              compact ? "text-xs" : "text-sm"
                            )}
                          >
                            {getActivityLink(activity)!.label}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 