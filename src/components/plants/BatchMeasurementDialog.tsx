import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { PlantMeasurementForm } from './PlantMeasurementForm';
import { useUserTier } from '@/hooks/use-user-tier';
import { Checkbox } from '@/components/ui/checkbox';
import { PlantsService } from '@/lib/api/plants';
import { toast } from 'sonner';
import type { Plant } from '@/types/common';

interface BatchMeasurementDialogProps {
  growId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BatchMeasurementDialog({ 
  growId, 
  open, 
  onOpenChange,
  onSuccess
}: BatchMeasurementDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { canUseBatchMeasurements, tier, isLoading: tierLoading } = useUserTier();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Determine if the component is being used in controlled or uncontrolled mode
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isDialogOpen = isControlled ? open : internalOpen;
  const setIsDialogOpen = isControlled 
    ? onOpenChange 
    : setInternalOpen;
  
  // Load plants when the dialog opens
  useEffect(() => {
    // Attempt to load plants when the dialog opens
    if (isDialogOpen && !loading && !loadError && plants.length === 0) {
      loadPlantsForGrow();
    }
  }, [isDialogOpen, loading, loadError, plants.length]);

  // Function to load plants
  const loadPlantsForGrow = async () => {
    if (!canUseBatchMeasurements() || !growId || tierLoading) {
      return;
    }
    
    setLoading(true);
    setLoadError(null);
    
    try {
      const plantsService = new PlantsService();
      const loadedPlants = await plantsService.listPlants({ growId });
      setPlants(loadedPlants);
    } catch (error) {
      setLoadError('Failed to load plants. Please try again.');
      toast.error('Failed to load plants');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      // Reset form state when dialog is closed
      setSelectedPlants([]);
      setPlants([]);
    }
  }, [isDialogOpen]);

  // If still loading tier info, show loading state
  if (tierLoading) {
    return null;
  }

  // Check if user can use batch measurements
  if (!canUseBatchMeasurements()) {
    return null;
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPlants(plants.map(plant => plant.id));
    } else {
      setSelectedPlants([]);
    }
  };

  const handlePlantSelection = (plantId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlants(prev => [...prev, plantId]);
    } else {
      setSelectedPlants(prev => prev.filter(id => id !== plantId));
    }
  };

  const handleSuccess = () => {
    setSelectedPlants([]);
    setIsDialogOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Batch Measurements
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Batch Plant Measurements</DialogTitle>
          <DialogDescription>
            Select plants and record measurements for all of them at once.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 py-2">
              <Checkbox 
                id="select-all"
                checked={selectedPlants.length === plants.length && plants.length > 0}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All
              </label>
            </div>
            
            <div className="grid grid-cols-1 gap-2 bg-muted/50 rounded-lg p-2">
              {loading ? (
                <div className="p-4 text-center">Loading plants...</div>
              ) : loadError ? (
                <div className="p-4 text-center text-destructive">
                  {loadError}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={loadPlantsForGrow}
                  >
                    Retry
                  </Button>
                </div>
              ) : plants.length === 0 ? (
                <div className="p-4 text-center">
                  No plants found for this grow.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={loadPlantsForGrow}
                  >
                    Reload
                  </Button>
                </div>
              ) : (
                plants.map((plant) => (
                  <div key={plant.id} className="flex items-center space-x-2 p-2 bg-background rounded">
                    <Checkbox
                      id={`plant-${plant.id}`}
                      checked={selectedPlants.includes(plant.id)}
                      onCheckedChange={(checked) => handlePlantSelection(plant.id, checked as boolean)}
                    />
                    <label htmlFor={`plant-${plant.id}`} className="text-sm">
                      {plant.name || `Plant ${plant.id}`}
                    </label>
                  </div>
                ))
              )}
            </div>

            {selectedPlants.length > 0 && (
              <div className="pt-4">
                <PlantMeasurementForm
                  growId={growId}
                  selectedPlantIds={selectedPlants}
                  onSuccess={handleSuccess}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 