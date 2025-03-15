import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { GrowsService } from '@/lib/api/grows';
import { EnvironmentalService } from '@/lib/api/environmental';
import type { Grow } from '@/types/common';
import { GrowCard } from '@/components/dashboard/GrowCard';
import { CreateGrowDialog } from '@/components/grows/CreateGrowDialog';
import { QueryErrorBoundary } from '@/components/ui/query-error-boundary';

const growsService = new GrowsService();
const environmentalService = new EnvironmentalService();

// Helper function to map database stage to GrowCard stage
function mapStage(stage: 'seedling' | 'vegetative' | 'flowering'): 'seedling' | 'vegetation' | 'flowering' | 'harvested' {
  if (stage === 'vegetative') return 'vegetation';
  return stage;
}

// Helper function to calculate progress based on stage and days
function calculateProgress(stage: 'seedling' | 'vegetative' | 'flowering', daysActive: number): number {
  // Approximate durations for each stage
  const stageDurations = {
    seedling: 14, // 2 weeks
    vegetative: 28, // 4 weeks
    flowering: 56, // 8 weeks
  };

  const stageProgress = Math.min(100, (daysActive / stageDurations[stage]) * 100);
  
  // Add base progress for previous stages
  switch (stage) {
    case 'flowering':
      return 66.67 + (stageProgress * 0.3333);
    case 'vegetative':
      return 33.33 + (stageProgress * 0.3333);
    case 'seedling':
      return stageProgress * 0.3333;
    default:
      return 0;
  }
}

// Helper function to get environmental data from targets
function getEnvironmentalData(grow: Grow) {
  return {
    temperature: grow.target_temp_high || 0,
    humidity: grow.target_humidity_high || 0,
  };
}

export default function Grows() {
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Development message about environmental data
  console.info(
    "Note: Environmental data is currently using target values from grow settings. " +
    "Real-time environmental data will be implemented in a future update."
  );

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Grows</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>New Grow</Button>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search grows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <QueryErrorBoundary
        title="Grow Data Error"
        description="We couldn't load your grows. Please try again."
      >
        <GrowsContent search={search} />
      </QueryErrorBoundary>

      <CreateGrowDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

// Separated component to handle data fetching and rendering
function GrowsContent({ search }: { search: string }) {
  const { data: grows, isLoading: isLoadingGrows } = useQuery({
    queryKey: ['grows'],
    queryFn: () => growsService.listGrows(),
  });

  // Fetch stats for each grow
  const growStats = useQueries({
    queries: (grows || []).map((grow) => ({
      queryKey: ['grow-stats', grow.id],
      queryFn: () => growsService.getGrowStats(grow.id),
      enabled: !!grow.id,
    })),
  });

  // Fetch latest environmental data for each grow
  const environmentalData = useQueries({
    queries: (grows || []).map((grow) => ({
      queryKey: ['environmental-latest', grow.id],
      queryFn: async () => {
        try {
          return await environmentalService.getLatestEnvironmentalData(grow.id);
        } catch (error) {
          console.log(`No environmental data for grow ${grow.id}`);
          return null;
        }
      },
      enabled: !!grow.id,
      retry: false, // Don't retry if it fails - missing data is expected
      staleTime: 1000 * 60 * 5, // 5 minutes
    })),
  });

  const isLoading = isLoadingGrows || 
    growStats.some((query) => query.isLoading) || 
    environmentalData.some((query) => query.isLoading && !query.isError);  // Don't consider error states as loading

  // Create maps for easier lookup
  const statsMap = Object.fromEntries(
    growStats
      .filter((stat) => stat.data)
      .map((stat, index) => [grows?.[index].id, stat.data])
  );

  const envMap = Object.fromEntries(
    environmentalData
      .filter((env) => env.data)
      .map((env, index) => [grows?.[index].id, env.data])
  );

  const filteredGrows = grows?.filter((grow) =>
    grow.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeGrows = filteredGrows?.filter((grow) => !grow.end_date);
  const completedGrows = filteredGrows?.filter((grow) => grow.end_date);

  // Helper function to get plant count for a grow
  const getPlantCount = (growId: string) => {
    return statsMap[growId]?.plantCount || 0;
  };

  // Helper function to get environmental data for a grow
  const getEnvironmentalData = (growId: string) => {
    const envData = envMap[growId];
    const grow = grows?.find(g => g.id === growId);
    
    // Use real environmental data if available, otherwise fall back to target values
    return {
      temperature: envData?.temperature || grow?.target_temp_high || 0,
      humidity: envData?.humidity || grow?.target_humidity_high || 0,
    };
  };

  // Helper function to calculate days active
  const calculateDaysActive = (startDate: string) => {
    return Math.ceil(
      (new Date().getTime() - new Date(startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
  };

  const renderGrowCard = (grow: Grow) => {
    const envData = getEnvironmentalData(grow.id);
    const daysActive = calculateDaysActive(grow.start_date || new Date().toISOString());
    return (
      <GrowCard
        key={grow.id}
        id={grow.id}
        name={grow.name}
        stage={grow.end_date ? "harvested" : mapStage(grow.stage)}
        startDate={grow.start_date || new Date().toISOString()}
        daysActive={daysActive}
        plantCount={getPlantCount(grow.id)}
        temperature={envData.temperature}
        humidity={envData.humidity}
        lastUpdated={grow.updated_at}
        progress={grow.end_date ? 100 : calculateProgress(grow.stage, daysActive)}
      />
    );
  };

  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-4">
        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        ) : activeGrows?.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No active grows found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create a new grow to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGrows?.map(renderGrowCard)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        ) : completedGrows?.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No completed grows found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Complete a grow to see it here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGrows?.map(renderGrowCard)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="all" className="space-y-4">
        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        ) : filteredGrows?.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No grows found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create a new grow to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrows?.map(renderGrowCard)}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
} 