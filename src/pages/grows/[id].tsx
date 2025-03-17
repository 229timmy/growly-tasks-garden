import { useState, useEffect } from 'react';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
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
import { RecordEnvironmentalDataDialog } from '@/components/grows/RecordEnvironmentalDataDialog';
import { EnvironmentalDataHistory } from '@/components/grows/EnvironmentalDataHistory';
import { EnvironmentalTargetsDialog } from '@/components/grows/EnvironmentalTargetsDialog';
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
  const [activeTab, setActiveTab] = useState('chart');
  const queryClient = useQueryClient();

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

  // Function to calculate the current growth stage based on days since start
  const calculateGrowthStage = (startDate: string): {
    stage: 'seedling' | 'vegetative' | 'flowering';
    daysSinceStart: number;
    daysInStage: number;
    totalDaysInStage: number;
    progressPercent: number;
  } => {
    const start = new Date(startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Define growth stage thresholds in days
    const seedlingEnd = 21; // 3 weeks
    const vegetativeEnd = seedlingEnd + 56; // 3 weeks + 8 weeks
    const preFloweringEnd = vegetativeEnd + 14; // + 2 weeks
    
    let stage: 'seedling' | 'vegetative' | 'flowering' = 'seedling';
    let daysInStage = 0;
    let totalDaysInStage = 0;
    let progressPercent = 0;
    
    if (daysSinceStart > preFloweringEnd) {
      stage = 'flowering';
      daysInStage = daysSinceStart - preFloweringEnd;
      totalDaysInStage = 56; // 8 weeks
      progressPercent = Math.min(100, (daysInStage / totalDaysInStage) * 100);
    } else if (daysSinceStart > vegetativeEnd) {
      // Pre-flowering is part of the flowering stage in the database
      stage = 'flowering';
      daysInStage = daysSinceStart - vegetativeEnd;
      totalDaysInStage = 14; // 2 weeks
      progressPercent = (daysInStage / totalDaysInStage) * 100;
    } else if (daysSinceStart > seedlingEnd) {
      stage = 'vegetative';
      daysInStage = daysSinceStart - seedlingEnd;
      totalDaysInStage = 56; // 8 weeks
      progressPercent = (daysInStage / totalDaysInStage) * 100;
    } else {
      daysInStage = daysSinceStart;
      totalDaysInStage = 21; // 3 weeks
      progressPercent = (daysInStage / totalDaysInStage) * 100;
    }
    
    return {
      stage,
      daysSinceStart,
      daysInStage,
      totalDaysInStage,
      progressPercent
    };
  };

  // Function to update the grow stage in the database if it has changed
  const updateGrowStage = async () => {
    if (!grow || !grow.start_date) return;
    
    const { stage } = calculateGrowthStage(grow.start_date);
    
    // Only update if the stage has changed
    if (grow.stage !== stage) {
      try {
        await growsService.updateGrow(grow.id, { stage });
        // Refresh the grow data
        queryClient.invalidateQueries({ queryKey: ["grow", id] });
      } catch (error) {
        console.error('Error updating grow stage:', error);
      }
    }
  };

  // Update the grow stage when the component loads
  useEffect(() => {
    if (grow && grow.start_date) {
      updateGrowStage();
    }
  }, [grow?.id, grow?.start_date]);

  const handleDeleteGrow = async () => {
    try {
      await growsService.deleteGrow(id as string);
      toast.success("Grow deleted successfully");
      navigate("/app/grows");
    } catch (error) {
      toast.error("Failed to delete grow");
    }
  };

  // Function to refresh environmental data
  const refreshEnvironmentalData = () => {
    queryClient.invalidateQueries({ queryKey: ["environment", id] });
  };

  // Function to refresh grow data
  const refreshGrowData = () => {
    queryClient.invalidateQueries({ queryKey: ["grow", id] });
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
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
            <CardTitle>Environment Monitoring</CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <EnvironmentalTargetsDialog 
                growId={id as string}
                currentTargets={{
                  tempLow: grow.target_temp_low || 20,
                  tempHigh: grow.target_temp_high || 28,
                  humidityLow: grow.target_humidity_low || 40,
                  humidityHigh: grow.target_humidity_high || 60,
                }}
                onSuccess={refreshGrowData}
              />
              <RecordEnvironmentalDataDialog 
                growId={id as string} 
                onSuccess={refreshEnvironmentalData}
              />
            </div>
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
                  <div className="text-xs text-muted-foreground">
                    Target: {grow.target_temp_low || 20}°C - {grow.target_temp_high || 28}°C
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
                  <div className="text-xs text-muted-foreground">
                    Target: {grow.target_humidity_low || 40}% - {grow.target_humidity_high || 60}%
                  </div>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground text-right">
                  Last updated: {new Date(currentEnvironment.timestamp).toLocaleString()}
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
            {(() => {
              if (!grow || !grow.start_date) {
                return (
                  <div className="text-muted-foreground">
                    No start date available
                  </div>
                );
              }
              
              // Calculate growth stage
              const { 
                daysSinceStart, 
                daysInStage, 
                totalDaysInStage, 
                progressPercent 
              } = calculateGrowthStage(grow.start_date);
              
              // Map database stage to display stage
              let displayStage: string;
              if (grow.stage === 'flowering' && daysInStage <= 14 && daysSinceStart > 21 + 56) {
                displayStage = 'Pre-Flowering';
              } else if (grow.stage === 'vegetative') {
                displayStage = 'Vegetative';
              } else if (grow.stage === 'seedling') {
                displayStage = 'Seedling';
              } else if (grow.stage === 'flowering') {
                displayStage = 'Flowering';
              } else {
                displayStage = grow.stage;
              }
              
              // Get appropriate color for each stage
              const stageColors: Record<string, string> = {
                "Seedling": "bg-blue-100 text-blue-800",
                "Vegetative": "bg-green-100 text-green-800",
                "Pre-Flowering": "bg-yellow-100 text-yellow-800",
                "Flowering": "bg-purple-100 text-purple-800"
              };
              
              return (
                <div className="space-y-4">
                  <Badge variant="secondary" className={`text-lg capitalize ${stageColors[displayStage as keyof typeof stageColors]}`}>
                    {displayStage}
                  </Badge>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Day {daysInStage} of {totalDaysInStage}</span>
                      <span>{Math.round(progressPercent)}% complete</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full bg-primary" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="w-4 h-4" />
                    Started {new Date(grow.start_date).toLocaleDateString()}
                    <span className="ml-auto">Day {daysSinceStart} overall</span>
                  </div>
                </div>
              );
            })()}
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Environmental History</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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
            <>
              {activeTab === 'chart' && (
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
              
              {activeTab === 'table' && (
                <EnvironmentalDataHistory 
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
            </>
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