import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { GrowsService } from '@/lib/api/grows';
import { TasksService } from '@/lib/api/tasks';
import { PlantsService } from '@/lib/api/plants';
import { GrowCard } from '@/components/dashboard/GrowCard';
import { TaskItem } from '@/components/tasks/TaskItem';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn, calculateGrowProgress } from '@/lib/utils';
import type { Database } from '@/types/database';

// Services
const growsService = new GrowsService();
const plantsService = new PlantsService();
const tasksService = new TasksService();

export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Fetch data
  const { data: grows, isLoading: isLoadingGrows } = useQuery({
    queryKey: ['grows'],
    queryFn: () => growsService.listGrows(),
  });

  const { data: plants, isLoading: isLoadingPlants } = useQuery({
    queryKey: ['plants'],
    queryFn: () => plantsService.listPlants(),
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksService.listTasks(),
  });

  // Fetch photos for all active grows at once
  const { data: growPhotos } = useQuery({
    queryKey: ['grow-photos', grows?.filter(grow => grow.stage !== 'completed')?.map(g => g.id)],
    queryFn: async () => {
      if (!grows?.filter(grow => grow.stage !== 'completed')?.length) return {};
      const photos = await Promise.all(
        grows.filter(grow => grow.stage !== 'completed').map(async (grow) => {
          const url = await growsService.getLatestGrowPhoto(grow.id);
          return [grow.id, url];
        })
      );
      return Object.fromEntries(photos);
    },
    enabled: !!grows?.filter(grow => grow.stage !== 'completed')?.length,
  });

  // Prepare data for display
  const activeGrows = grows?.filter(grow => grow.stage !== 'completed') || [];
  const activeTasks = tasks?.filter(task => !task.is_completed) || [];
  const totalPlants = plants?.length || 0;

  if (!user) {
    return null;
  }

  // Handle task toggling
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await tasksService.toggleTaskCompletion(taskId);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  return (
    <div className={cn(
      "container mx-auto",
      isMobile ? "p-2 space-y-2" : "p-8 space-y-8"
    )}>
      <div className="flex items-center justify-between">
        <h1 className={cn(
          "font-semibold",
          isMobile ? "text-xl" : "text-2xl"
        )}>Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-3"
      )}>
        <Card>
          <CardHeader className={cn(
            isMobile ? "p-3" : "p-6"
          )}>
            <CardTitle className={cn(
              isMobile ? "text-sm" : "text-base"
            )}>Active Grows</CardTitle>
          </CardHeader>
          <CardContent className={cn(
            isMobile ? "p-3 pt-0" : "p-6 pt-0"
          )}>
            <div className={cn(
              "text-2xl font-bold",
              isMobile && "text-xl"
            )}>
              {isLoadingGrows ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeGrows.length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn(
            isMobile ? "p-3" : "p-6"
          )}>
            <CardTitle className={cn(
              isMobile ? "text-sm" : "text-base"
            )}>Total Plants</CardTitle>
          </CardHeader>
          <CardContent className={cn(
            isMobile ? "p-3 pt-0" : "p-6 pt-0"
          )}>
            <div className={cn(
              "text-2xl font-bold",
              isMobile && "text-xl"
            )}>
              {isLoadingPlants ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalPlants
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn(
            isMobile ? "p-3" : "p-6"
          )}>
            <CardTitle className={cn(
              isMobile ? "text-sm" : "text-base"
            )}>Active Tasks</CardTitle>
          </CardHeader>
          <CardContent className={cn(
            isMobile ? "p-3 pt-0" : "p-6 pt-0"
          )}>
            <div className={cn(
              "text-2xl font-bold",
              isMobile && "text-xl"
            )}>
              {isLoadingTasks ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeTasks.length
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        {/* Grows Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={cn(
              "font-semibold",
              isMobile ? "text-lg" : "text-xl"
            )}>Active Grows</h2>
            <Button asChild size={isMobile ? "sm" : "default"}>
              <Link to="/app/grows/new">
                <Plus className={cn(
                  "mr-2",
                  isMobile ? "h-4 w-4" : "h-5 w-5"
                )} />
                New Grow
              </Link>
            </Button>
          </div>

          {isLoadingGrows ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !activeGrows.length ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No active grows</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeGrows.slice(0, 3).map((grow) => {
                // Calculate days active
                const startDate = grow.start_date || grow.created_at;
                const daysActive = startDate 
                  ? Math.ceil((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                
                // Count plants in this grow
                const growPlantCount = plants?.filter(p => p.grow_id === grow.id)?.length || 0;

                // Get photo URL from the pre-fetched photos
                const photoUrl = growPhotos?.[grow.id];

                // Get latest environmental data
                const temp = grow.target_temp_high || 0;
                const humidity = grow.target_humidity_high || 0;
                
                return (
                  <GrowCard
                    key={grow.id}
                    id={grow.id}
                    name={grow.name}
                    stage={grow.stage as "seedling" | "vegetation" | "flowering" | "harvested"}
                    startDate={startDate}
                    daysActive={daysActive}
                    plantCount={growPlantCount}
                    temperature={temp}
                    humidity={humidity}
                    lastUpdated={grow.updated_at}
                    progress={calculateGrowProgress(startDate)}
                    imageUrl={photoUrl || undefined}
                  />
                );
              })}
              {activeGrows.length > 3 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/app/grows">View All Grows</Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={cn(
              "font-semibold",
              isMobile ? "text-lg" : "text-xl"
            )}>Recent Tasks</h2>
            <Button asChild size={isMobile ? "sm" : "default"}>
              <Link to="/app/tasks/new">
                <Plus className={cn(
                  "mr-2",
                  isMobile ? "h-4 w-4" : "h-5 w-5"
                )} />
                New Task
              </Link>
            </Button>
          </div>

          {isLoadingTasks ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !activeTasks.length ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No active tasks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeTasks.slice(0, 3).map((task) => {
                // Skip rendering if required fields are missing
                if (!task || !task.id || !task.title || !task.due_date) {
                  return null;
                }
                
                return (
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description ?? undefined}
                    dueDate={task.due_date}
                    priority={task.priority as "low" | "medium" | "high"}
                    isCompleted={task.is_completed}
                    onToggle={handleTaskToggle}
                    className={isMobile ? "p-3" : undefined}
                  />
                );
              })}
              {activeTasks.length > 3 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/app/tasks">View All Tasks</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed compact={isMobile} />
    </div>
  );
} 