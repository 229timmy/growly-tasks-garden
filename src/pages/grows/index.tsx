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
import { calculateGrowProgress } from '@/lib/utils';

const growsService = new GrowsService();
const environmentalService = new EnvironmentalService();

// Helper function to map database stage to GrowCard stage
function mapStage(stage: 'seedling' | 'vegetative' | 'flowering'): 'seedling' | 'vegetation' | 'flowering' | 'harvested' {
  if (stage === 'vegetative') return 'vegetation';
  return stage;
}

// Helper function to calculate days active
function calculateDaysActive(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
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
        <Link to="/app/grows/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Grow
          </Button>
        </Link>
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
    queryKey: ["grows"],
    queryFn: () => growsService.listGrows(),
  });

  // Fetch stats for each grow
  const growStatsQueries = useQueries({
    queries: (grows || []).map(grow => ({
      queryKey: ["grow-stats", grow.id],
      queryFn: () => growsService.getGrowStats(grow.id),
      enabled: !!grows,
    })),
  });

  // Fetch environmental data for each grow
  const envDataQueries = useQueries({
    queries: (grows || []).map(grow => ({
      queryKey: ["env-data", grow.id],
      queryFn: () => environmentalService.getLatestEnvironmentalData(grow.id),
      enabled: !!grows,
    })),
  });

  // Fetch latest photo for each grow
  const photoQueries = useQueries({
    queries: (grows || []).map(grow => ({
      queryKey: ["grow-photo", grow.id],
      queryFn: () => growsService.getLatestGrowPhoto(grow.id),
      enabled: !!grows,
    })),
  });

  // Check if any queries are loading
  const isLoading = isLoadingGrows || 
    growStatsQueries.some(query => query.isLoading) || 
    envDataQueries.some(query => query.isLoading) ||
    photoQueries.some(query => query.isLoading);

  // Create a map of grow IDs to stats for easier lookup
  const statsMap = (grows || []).reduce((acc, grow, index) => {
    acc[grow.id] = growStatsQueries[index]?.data || null;
    return acc;
  }, {} as Record<string, { plantCount: number; activeTasks: number; completedTasks: number } | null>);

  // Create a map of grow IDs to environmental data for easier lookup
  const envMap = (grows || []).reduce((acc, grow, index) => {
    acc[grow.id] = envDataQueries[index]?.data || null;
    return acc;
  }, {} as Record<string, any>);

  // Create a map of grow IDs to photo URLs for easier lookup
  const photoMap = (grows || []).reduce((acc, grow, index) => {
    acc[grow.id] = photoQueries[index]?.data || null;
    return acc;
  }, {} as Record<string, string | null>);

  // Filter grows based on search term
  const filteredGrows = grows?.filter(
    (grow) =>
      grow.name.toLowerCase().includes(search.toLowerCase()) ||
      grow.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Separate active and completed grows
  const activeGrows = filteredGrows?.filter((grow) => !grow.end_date);
  const completedGrows = filteredGrows?.filter((grow) => !!grow.end_date);

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

  // Helper function to get the latest photo URL for a grow
  const getPhotoUrl = (growId: string) => {
    const photoUrl = photoMap[growId] || null;
    console.log(`Photo URL for grow ${growId}:`, photoUrl);
    return photoUrl;
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
        progress={grow.end_date ? 100 : calculateGrowProgress(grow.start_date || new Date().toISOString())}
        imageUrl={getPhotoUrl(grow.id)}
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