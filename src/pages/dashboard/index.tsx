import { useAuth } from '@/contexts/auth/AuthContext';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GrowsService } from '@/lib/api/grows';
import { PlantsService } from '@/lib/api/plants';
import { TasksService } from '@/lib/api/tasks';
import { Loader2, Plus } from 'lucide-react';
import { GrowCard } from '@/components/dashboard/GrowCard';
import { TaskItem } from '@/components/tasks/TaskItem';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PlantCareStats } from '@/components/plants/PlantCareStats';
import type { Database } from '@/types/database';
import { calculateGrowProgress } from '@/lib/utils';

type Grow = Database['public']['Tables']['grows']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

const growsService = new GrowsService();
const plantsService = new PlantsService();
const tasksService = new TasksService();

export default function Dashboard() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: grows, isLoading: isLoadingGrows, error: growsError } = useQuery({
    queryKey: ['grows'],
    queryFn: async () => {
      if (!user) {
        throw new Error('Authentication required');
      }
      console.log('Fetching grows for user:', user.id);
      const grows = await growsService.listGrows();
      console.log('Grows fetched:', grows);
      return grows;
    },
    enabled: !!user,
    retry: 1
  });

  const { data: plantStats, isLoading: isLoadingPlants } = useQuery({
    queryKey: ['plants', 'stats'],
    queryFn: () => plantsService.getPlantStats(),
    enabled: !!user,
  });

  const { data: taskStats, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: () => tasksService.getTaskStats(),
    enabled: !!user,
  });

  const { data: tasks, isLoading: isLoadingRecentTasks } = useQuery({
    queryKey: ['tasks', 'recent'],
    queryFn: () => tasksService.listTasks({ 
      completed: false,
      limit: 5
    }),
    enabled: !!user,
  });

  // Add query for photos when grows are loaded
  const growPhotoQueries = useQueries({
    queries: (grows || []).map(grow => ({
      queryKey: ['grow-photo', grow.id],
      queryFn: () => growsService.getLatestGrowPhoto(grow.id),
      enabled: !!grows && !!user,
    })),
    combine: (results) => {
      return {
        data: results.map(result => result.data),
        pending: results.some(result => result.isPending),
      };
    },
  });

  // Create a map of grow ID to photo URL
  const photoMap: Record<string, string | null> = {};
  if (grows && growPhotoQueries.data) {
    grows.forEach((grow, index) => {
      photoMap[grow.id] = growPhotoQueries.data[index];
    });
  }

  // Add query for task related data
  const { data: taskRelatedData } = useQuery({
    queryKey: ['tasks', 'related-data'],
    queryFn: async () => {
      if (!user) return null;
      
      const [grows, plants] = await Promise.all([
        growsService.listGrows(),
        plantsService.listPlants()
      ]);
      
      const growMap = new Map(grows.map(g => [g.id, g]));
      const plantMap = new Map(plants.map(p => [p.id, p]));
      
      return {
        grows: growMap,
        plants: plantMap
      };
    },
    enabled: !!user
  });

  // Log the current state
  console.log('Auth state:', { user, loading });
  console.log('Grows state:', { grows, isLoadingGrows, error: growsError });

  const activeGrows = (grows as Grow[] | undefined)?.filter(grow => 
    ['seedling', 'vegetative', 'flowering'].includes(grow.stage)
  ) || [];
  const isLoading = loading || isLoadingGrows || isLoadingPlants || isLoadingTasks;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email}` : ''}! Here's an overview of your grows and tasks.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Grows</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <p className="text-2xl font-bold">{activeGrows.length}</p>
                <p className="text-xs text-muted-foreground">
                  {grows?.length} total grows
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <p className="text-2xl font-bold">{plantStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Across all grows
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <p className="text-2xl font-bold">
                  {(taskStats?.total || 0) - (taskStats?.completed || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {taskStats?.completed || 0} completed
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <p className="text-2xl font-bold">
                  {taskStats?.total 
                    ? Math.round((taskStats.completed / taskStats.total) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Task completion</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grows Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Grows</h2>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/app/grows/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Grow
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/app/grows">View All</Link>
                </Button>
              </div>
            </div>
            {isLoadingGrows ? (
              <Card>
                <CardContent className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
              </Card>
            ) : growsError ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-destructive">Error loading grows. Please try again.</p>
                </CardContent>
              </Card>
            ) : grows?.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">No grows yet. Create your first grow to get started!</p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link to="/app/grows/new">Create Grow</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeGrows.slice(0, 3).map((grow) => (
                  <GrowCard
                    key={grow.id}
                    id={grow.id}
                    name={grow.name}
                    stage={grow.stage as "seedling" | "vegetation" | "flowering" | "harvested"}
                    startDate={grow.start_date}
                    daysActive={Math.ceil(
                      (new Date().getTime() - new Date(grow.start_date).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )}
                    plantCount={plantStats?.byGrow[grow.id] || 0}
                    temperature={grow.target_temp_high || 0}
                    humidity={grow.target_humidity_high || 0}
                    lastUpdated={grow.updated_at || grow.created_at}
                    progress={calculateGrowProgress(grow.start_date)}
                    imageUrl={photoMap[grow.id] || undefined}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Tasks</h2>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/app/tasks/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/app/tasks">View All</Link>
                </Button>
              </div>
            </div>
            {isLoadingTasks || isLoadingRecentTasks ? (
              <Card>
                <CardContent className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
              </Card>
            ) : !tasks?.length ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">No tasks yet. Add some tasks to track your grows!</p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link to="/app/tasks/new">Create Task</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description || undefined}
                    dueDate={task.due_date || new Date().toISOString()}
                    priority={task.priority}
                    isCompleted={task.completed}
                    relatedTo={task.grow_id && taskRelatedData?.grows.get(task.grow_id) ? {
                      type: "grow",
                      id: task.grow_id,
                      name: taskRelatedData.grows.get(task.grow_id)?.name || "Unnamed Grow"
                    } : undefined}
                    onToggle={(id, completed) => {
                      tasksService.toggleTaskCompletion(id).then(() => {
                        // Invalidate relevant queries
                        queryClient.invalidateQueries({ queryKey: ['tasks'] });
                        queryClient.invalidateQueries({ queryKey: ['activities'] });
                      });
                    }}
                  />
                ))}
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completed</span>
                        <span className="font-medium">{taskStats?.completed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Upcoming</span>
                        <span className="font-medium">{taskStats?.upcoming}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Overdue</span>
                        <span className="font-medium text-destructive">{taskStats?.overdue}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <QuickActions />
          
          {/* Plant Care Stats */}
          <PlantCareStats />
          
          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
} 