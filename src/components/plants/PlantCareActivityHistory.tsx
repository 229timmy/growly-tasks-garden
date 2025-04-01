import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DropletIcon, LeafIcon, Shovel, MoreHorizontalIcon } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlantCareService } from '@/lib/api/plant-care';
import { PlantCareActivity } from '@/types/common';
import { PlantsService } from '@/lib/api/plants';
import { Plant } from '@/types/common';
import { NoPlantState } from './NoPlantState';

interface PlantCareActivityHistoryProps {
  growId: string;
  plantId?: string;
  limit?: number;
}

export function PlantCareActivityHistory({
  growId,
  plantId,
  limit = 10,
}: PlantCareActivityHistoryProps) {
  const [activities, setActivities] = useState<PlantCareActivity[]>([]);
  const [plants, setPlants] = useState<Record<string, Plant>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const loadActivities = async (pageToLoad = 0) => {
    setIsLoading(true);
    try {
      const plantCareService = new PlantCareService();
      const options: {
        growId: string;
        plantId?: string;
        limit: number;
        offset: number;
      } = {
        growId,
        limit: limit + 1, // Fetch one extra to check if there are more
        offset: pageToLoad * limit,
      };

      if (plantId) {
        options.plantId = plantId;
      }

      const fetchedActivities = await plantCareService.listActivities(options);
      
      // Check if there are more activities
      const hasMoreActivities = fetchedActivities.length > limit;
      setHasMore(hasMoreActivities);
      
      // Remove the extra activity if we fetched more than the limit
      const activitiesToDisplay = hasMoreActivities 
        ? fetchedActivities.slice(0, limit) 
        : fetchedActivities;
      
      if (pageToLoad === 0) {
        setActivities(activitiesToDisplay);
      } else {
        setActivities((prev) => [...prev, ...activitiesToDisplay]);
      }
      
      // Load plant details if needed
      const plantIds = new Set<string>();
      activitiesToDisplay.forEach((activity) => {
        if (activity.plant_id && !plants[activity.plant_id]) {
          plantIds.add(activity.plant_id);
        }
      });
      
      if (plantIds.size > 0) {
        await loadPlants(Array.from(plantIds));
      }
    } catch (error) {
      console.error('Failed to load care activities:', error);
      toast.error('Failed to load care activities');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlants = async (plantIds: string[]) => {
    try {
      const plantsService = new PlantsService();
      const fetchedPlants = await Promise.all(
        plantIds.map((id) => plantsService.getPlant(id))
      );
      
      const plantsMap: Record<string, Plant> = {};
      fetchedPlants.forEach((plant) => {
        if (plant) {
          plantsMap[plant.id] = plant;
        }
      });
      
      setPlants((prev) => ({ ...prev, ...plantsMap }));
    } catch (error) {
      console.error('Failed to load plants:', error);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [growId, plantId]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
    loadActivities(page + 1);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'watering':
        return <DropletIcon className="h-4 w-4 text-blue-500" />;
      case 'feeding':
        return <LeafIcon className="h-4 w-4 text-green-500" />;
      case 'top_dressing':
        return <Shovel className="h-4 w-4 text-amber-500" />;
      default:
        return <MoreHorizontalIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (activityType: string) => {
    switch (activityType) {
      case 'watering':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Watering</Badge>;
      case 'feeding':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Feeding</Badge>;
      case 'top_dressing':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Top Dressing</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Other</Badge>;
    }
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center">
        <h3 className="text-lg font-medium">No care activities recorded</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {plantId 
            ? "Record your first care activity to start tracking your plant's care history."
            : "Record your first care activity to start tracking your grow's care history."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            {!plantId && <TableHead>Plant</TableHead>}
            <TableHead>Details</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell className="flex items-center gap-2">
                {getActivityIcon(activity.activity_type)}
                {getActivityBadge(activity.activity_type)}
              </TableCell>
              {!plantId && (
                <TableCell>
                  {activity.plant_id 
                    ? plants[activity.plant_id]?.name || `Plant ${activity.plant_id.substring(0, 8)}` 
                    : 'Entire Grow'}
                </TableCell>
              )}
              <TableCell>
                <div className="flex flex-col">
                  {activity.amount && activity.unit && (
                    <span className="text-sm">
                      {activity.amount} {activity.unit}
                    </span>
                  )}
                  {activity.product_name && (
                    <span className="text-sm font-medium">
                      {activity.product_name}
                    </span>
                  )}
                  {activity.notes && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {activity.notes}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(activity.performed_at), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
} 