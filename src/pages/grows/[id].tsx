import { useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Thermometer, Droplets, FlowerIcon, Timer, Plus, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreatePlantDialog } from '@/components/plants/CreatePlantDialog';
import { CreateGrowDialog } from '@/components/grows/CreateGrowDialog';
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { BatchMeasurementDialog } from '@/components/plants/BatchMeasurementDialog';
import { GrowsService } from '@/lib/api/grows';
import { PlantsService } from '@/lib/api/plants';
import { EnvironmentalService } from '@/lib/api/environmental';
import { PlantCard } from "@/components/dashboard/PlantCard";
import { EnvironmentalChart } from '@/components/grows/EnvironmentalChart';
import type { Plant } from '@/types/common';
import type { EnvironmentalData } from "@/lib/api/environmental";

const growsService = new GrowsService();
const plantsService = new PlantsService();
const environmentalService = new EnvironmentalService();

// Helper function to map plant status to health
const mapStatusToHealth = (status: "healthy" | "warning" | "critical"): "good" | "average" | "poor" => {
  switch (status) {
    case "healthy":
      return "good";
    case "warning":
      return "average";
    case "critical":
      return "poor";
    default:
      return "average";
  }
};

export default function GrowDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const [createPlantOpen, setCreatePlantOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: grow, isLoading: isLoadingGrow } = useQuery({
    queryKey: ["grow", id],
    queryFn: () => growsService.getGrow(id as string),
    enabled: !!id && id !== 'new',
  });

  const { data: plants = [], isLoading: isLoadingPlants } = useQuery({
    queryKey: ["plants", id],
    queryFn: () => plantsService.listPlants({ growId: id as string }),
    enabled: !!id && id !== 'new',
  });

  const { data: environmentData = [], isLoading: isLoadingEnvironment } = useQuery<EnvironmentalData[]>({
    queryKey: ["environment", id],
    queryFn: () => environmentalService.getEnvironmentalData(id as string),
    enabled: !!id && id !== 'new',
  });

  // Get the most recent environmental data point
  const currentEnvironment = environmentData.length > 0 
    ? environmentData[environmentData.length - 1] 
    : null;

  // Add query for plant photos
  const plantPhotoQueries = useQueries({
    queries: (plants || []).map(plant => ({
      queryKey: ['plant-photo', plant.id],
      queryFn: () => plantsService.getPlantPhoto(plant.id),
      enabled: !!plants && plants.length > 0,
    })),
    combine: (results) => {
      return {
        data: results.map(result => result.data),
        pending: results.some(result => result.isPending),
      };
    },
  });

  // Create a map of plant ID to photo URL
  const photoMap: Record<string, string | null> = {};
  if (plants && plantPhotoQueries.data) {
    plants.forEach((plant, index) => {
      photoMap[plant.id] = plantPhotoQueries.data[index];
    });
  }

  const handleDeleteGrow = async () => {
    try {
      await growsService.deleteGrow(id as string);
      toast.success("Grow deleted successfully");
      navigate("/app/grows");
    } catch (error) {
      toast.error("Failed to delete grow");
    }
  };

  // If we're on the "new" route, show the create dialog
  if (id === 'new') {
    return (
      <CreateGrowDialog
        open={true}
        onOpenChange={(open) => {
          if (!open) navigate('/app/grows');
        }}
      />
    );
  }

  if (isLoadingGrow) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!grow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Found</CardTitle>
          <CardDescription>This grow could not be found.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/app/grows")}>Back to Grows</Button>
        </CardContent>
      </Card>
    );
  }

  const filteredPlants = plants.filter(
    (plant) =>
      plant.name.toLowerCase().includes(search.toLowerCase()) ||
      plant.strain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{grow.name}</h1>
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Grow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEnvironment ? (
              <div className="flex items-center justify-center h-[100px]">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : !currentEnvironment ? (
              <div className="text-muted-foreground">No environment data available</div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Temperature</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {currentEnvironment.temperature}°C
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Humidity</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {currentEnvironment.humidity}%
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge variant="secondary" className="text-lg capitalize">
                {grow.stage}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="w-4 h-4" />
                Started {new Date(grow.start_date).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Plants</CardTitle>
          <div className="flex gap-2">
            <BatchMeasurementDialog growId={id as string} />
            <Button onClick={() => setCreatePlantOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Plant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search plants by name or strain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </div>

          {isLoadingPlants ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? "No plants match your search" : "No plants found"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  id={plant.id}
                  name={plant.name}
                  strain={plant.strain || "Unknown"}
                  age={Math.floor(
                    (Date.now() - new Date(plant.created_at).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                  growName={grow.name}
                  growId={grow.id}
                  health={mapStatusToHealth(plant.status)}
                  height={plant.height}
                  lastWatered={plant.last_watered || plant.created_at}
                  imageUrl={photoMap[plant.id] || undefined}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environmental History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEnvironment ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : environmentData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No historical data available
            </div>
          ) : (
            <EnvironmentalChart 
              data={environmentData}
              targetTemp={{
                low: grow.target_temp_low || 20,
                high: grow.target_temp_high || 28,
              }}
              targetHumidity={{
                low: grow.target_humidity_low || 40,
                high: grow.target_humidity_high || 60,
              }}
            />
          )}
        </CardContent>
      </Card>

      <CreatePlantDialog
        open={createPlantOpen}
        onOpenChange={setCreatePlantOpen}
        growId={id as string}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Grow"
        description="Are you sure you want to delete this grow? This action cannot be undone."
        onConfirm={handleDeleteGrow}
      />
    </div>
  );
} 