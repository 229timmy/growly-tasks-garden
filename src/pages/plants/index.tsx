import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlantsService } from '@/lib/api/plants';
import { GrowsService } from '@/lib/api/grows';
import { Plant, Grow } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QueryErrorBoundary } from '@/components/ui/query-error-boundary';
import { Loader2, Plus, Search, Filter } from 'lucide-react';
import { CreatePlantDialog } from '@/components/plants/CreatePlantDialog';
import { PlantCard } from '@/components/plants/PlantCard';
import { toast } from 'sonner';

const plantsService = new PlantsService();
const growsService = new GrowsService();

export default function Plants() {
  const [search, setSearch] = useState('');
  const [selectedGrowId, setSelectedGrowId] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Plants</h1>
          <p className="text-muted-foreground">
            Monitor and track individual plants in your grows
          </p>
        </div>
        <Button 
          onClick={() => {
            if (selectedGrowId === 'all') {
              toast.error('Please select a grow first before adding a plant');
            } else {
              setCreateDialogOpen(true);
            }
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Plant</span>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plants..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <QueryErrorBoundary>
          <GrowFilter 
            selectedGrowId={selectedGrowId} 
            onSelectGrow={setSelectedGrowId} 
          />
        </QueryErrorBoundary>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Plants</TabsTrigger>
          <TabsTrigger value="recent">Recently Updated</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <QueryErrorBoundary>
            <PlantsGrid 
              search={search} 
              growId={selectedGrowId === 'all' ? undefined : selectedGrowId} 
            />
          </QueryErrorBoundary>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-6">
          <QueryErrorBoundary>
            <PlantsGrid 
              search={search} 
              growId={selectedGrowId === 'all' ? undefined : selectedGrowId}
              limit={12}
            />
          </QueryErrorBoundary>
        </TabsContent>
      </Tabs>
      
      {/* Create Plant Dialog - Always render it but only open when a grow is selected */}
      <CreatePlantDialog
        open={createDialogOpen && selectedGrowId !== 'all'}
        onOpenChange={setCreateDialogOpen}
        growId={selectedGrowId !== 'all' ? selectedGrowId : ''}
      />
    </div>
  );
}

function GrowFilter({ 
  selectedGrowId, 
  onSelectGrow 
}: { 
  selectedGrowId: string; 
  onSelectGrow: (growId: string) => void;
}) {
  const { data: grows, isLoading } = useQuery({
    queryKey: ['grows'],
    queryFn: () => growsService.listGrows(),
  });
  
  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </SelectValue>
        </SelectTrigger>
      </Select>
    );
  }
  
  return (
    <Select value={selectedGrowId} onValueChange={onSelectGrow}>
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {selectedGrowId === 'all' 
              ? 'All Grows' 
              : grows?.find(g => g.id === selectedGrowId)?.name || 'Select Grow'}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Grows</SelectItem>
        {grows?.map((grow) => (
          <SelectItem key={grow.id} value={grow.id}>
            {grow.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PlantsGrid({ 
  search, 
  growId,
  limit
}: { 
  search: string; 
  growId?: string;
  limit?: number;
}) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: plants, isLoading } = useQuery({
    queryKey: ['plants', { growId }],
    queryFn: () => plantsService.listPlants({ growId, limit }),
  });
  
  const { data: grows } = useQuery({
    queryKey: ['grows'],
    queryFn: () => growsService.listGrows(),
  });
  
  // Filter plants by search term
  const filteredPlants = plants?.filter(plant => 
    plant.name.toLowerCase().includes(search.toLowerCase()) ||
    (plant.strain?.toLowerCase() || '').includes(search.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!filteredPlants?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No plants found</p>
          {growId ? (
            <>
              <Button onClick={() => setCreateDialogOpen(true)}>
                Add Plant to this Grow
              </Button>
              <CreatePlantDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                growId={growId}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a grow to add plants
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Helper function to get grow name
  const getGrowName = (growId: string) => {
    return grows?.find(g => g.id === growId)?.name || 'Unknown Grow';
  };
  
  // Calculate plant age in days
  const calculateAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Determine plant health status
  const getPlantHealth = (plant: Plant): 'good' | 'average' | 'poor' => {
    // This is a placeholder logic - in a real app, you'd have more sophisticated health checks
    if (!plant.last_watered) return 'average';
    
    const lastWatered = new Date(plant.last_watered);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) return 'poor';
    if (diffDays > 3) return 'average';
    return 'good';
  };
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlants.map((plant) => (
          <PlantCard
            key={plant.id}
            id={plant.id}
            name={plant.name}
            strain={plant.strain || 'Unknown Strain'}
            age={calculateAge(plant.created_at)}
            growName={getGrowName(plant.grow_id)}
            growId={plant.grow_id}
            health={getPlantHealth(plant)}
            imageUrl={plant.last_photo_url || undefined}
            height={plant.height || undefined}
            lastWatered={plant.last_watered || plant.created_at}
          />
        ))}
      </div>
      
      {growId && (
        <>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => setCreateDialogOpen(true)}>
              Add Another Plant to this Grow
            </Button>
          </div>
          <CreatePlantDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            growId={growId}
          />
        </>
      )}
    </>
  );
} 