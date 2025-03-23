import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Check } from 'lucide-react';
import { PlantMeasurementForm } from './PlantMeasurementForm';
import { useUserTier } from '@/hooks/use-user-tier';
import { Checkbox } from '@/components/ui/checkbox';
import { PlantsService } from '@/lib/api/plants';
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
  const [isOpen, setIsOpen] = useState(false);
  const { canUseBatchMeasurements } = useUserTier();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Don't render anything if user can't use batch measurements
  if (!canUseBatchMeasurements()) {
    return null;
  }
  
  // Use controlled state if provided, otherwise use internal state
  const isDialogOpen = open !== undefined ? open : isOpen;
  const setIsDialogOpen = onOpenChange || setIsOpen;

  // Load plants when dialog opens
  useEffect(() => {
    const loadPlants = async () => {
      if (isDialogOpen) {
        setLoading(true);
        try {
          const plantsService = new PlantsService();
          const loadedPlants = await plantsService.listPlants({ growId });
          setPlants(loadedPlants);
        } catch (error) {
          console.error('Failed to load plants:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPlants();
  }, [isDialogOpen, growId]);

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
                checked={selectedPlants.length === plants.length}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All
              </label>
            </div>
            
            <div className="grid grid-cols-1 gap-2 bg-muted/50 rounded-lg p-2">
              {plants.map((plant) => (
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
              ))}
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