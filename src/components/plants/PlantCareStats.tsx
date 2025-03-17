import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { DropletIcon, LeafIcon, Shovel, MoreHorizontalIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlantCareService } from '@/lib/api/plant-care';

interface PlantCareStatsProps {
  growId?: string;
  plantId?: string;
  className?: string;
}

export function PlantCareStats({
  growId,
  plantId,
  className,
}: PlantCareStatsProps) {
  const [stats, setStats] = useState<{
    totalActivities: number;
    wateringCount: number;
    feedingCount: number;
    topDressingCount: number;
    otherCount: number;
    lastWatering?: Date;
    lastFeeding?: Date;
    lastTopDressing?: Date;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!growId && !plantId) return;
      
      setIsLoading(true);
      try {
        const plantCareService = new PlantCareService();
        const options: {
          growId?: string;
          plantId?: string;
        } = {};
        
        if (growId) options.growId = growId;
        if (plantId) options.plantId = plantId;
        
        const fetchedStats = await plantCareService.getActivityStats(options);
        setStats(fetchedStats);
      } catch (error) {
        console.error('Failed to load care activity stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [growId, plantId]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Care Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Care Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Care Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Activities</span>
              <span className="text-2xl font-bold">{stats.totalActivities}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Last Activity</span>
              <span className="text-lg font-medium">
                {stats.lastWatering || stats.lastFeeding || stats.lastTopDressing
                  ? formatDistanceToNow(
                      new Date(
                        Math.max(
                          ...[
                            stats.lastWatering,
                            stats.lastFeeding,
                            stats.lastTopDressing,
                          ]
                            .filter(Boolean)
                            .map((date) => date!.getTime())
                        )
                      ),
                      { addSuffix: true }
                    )
                  : 'Never'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DropletIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Watering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.wateringCount}</span>
                {stats.lastWatering && (
                  <span className="text-xs text-muted-foreground">
                    Last: {formatDistanceToNow(stats.lastWatering, { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LeafIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm">Feeding</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.feedingCount}</span>
                {stats.lastFeeding && (
                  <span className="text-xs text-muted-foreground">
                    Last: {formatDistanceToNow(stats.lastFeeding, { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shovel className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Top Dressing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.topDressingCount}</span>
                {stats.lastTopDressing && (
                  <span className="text-xs text-muted-foreground">
                    Last: {formatDistanceToNow(stats.lastTopDressing, { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MoreHorizontalIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Other</span>
              </div>
              <span className="text-sm font-medium">{stats.otherCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 