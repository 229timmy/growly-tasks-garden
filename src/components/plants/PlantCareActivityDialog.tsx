import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlantCareActivityForm } from '@/components/plants/PlantCareActivityForm';
import { PlantsService } from '@/lib/api/plants';
import { toast } from 'sonner';
import { NoPlantState } from './NoPlantState';
import { CreatePlantDialog } from './CreatePlantDialog';
import type { Plant } from '@/types/common';

interface PlantCareActivityDialogProps {
  growId: string;
  plantId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function PlantCareActivityDialog({
  growId,
  plantId,
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: PlantCareActivityDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [createPlantOpen, setCreatePlantOpen] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isDialogOpen = isControlled ? open : internalOpen;
  const setIsDialogOpen = isControlled ? onOpenChange : setInternalOpen;
  
  // Load plants when the dialog opens
  useEffect(() => {
    if (isDialogOpen && !loading && !hasAttemptedLoad) {
      loadPlantsForGrow();
    }
  }, [isDialogOpen, loading, hasAttemptedLoad]);

  // Reset states when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      setPlants([]);
      setHasAttemptedLoad(false);
    }
  }, [isDialogOpen]);

  const loadPlantsForGrow = async () => {
    if (!growId) return;
    
    setLoading(true);
    try {
      const plantsService = new PlantsService();
      const loadedPlants = await plantsService.listPlants({ growId });
      setPlants(loadedPlants);
    } catch (error) {
      console.error('Failed to load plants:', error);
      toast.error('Failed to load plants');
    } finally {
      setLoading(false);
      setHasAttemptedLoad(true);
    }
  };
  
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    setIsDialogOpen(false);
  };

  const handleCreatePlantOpenChange = (open: boolean) => {
    setCreatePlantOpen(open);
    if (!open) {
      // Refresh plants list when the create dialog closes
      loadPlantsForGrow();
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="outline">Record Care Activity</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Plant Care Activity</DialogTitle>
            <DialogDescription>
              Record a care activity such as watering, feeding, or top dressing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loading ? (
              <div className="text-center py-4">Loading plants...</div>
            ) : hasAttemptedLoad && plants.length === 0 ? (
              <NoPlantState 
                onAddPlant={() => setCreatePlantOpen(true)}
                message="No plants found. Add a plant to record care activities."
              />
            ) : (
              <PlantCareActivityForm
                growId={growId}
                plantId={plantId}
                onSuccess={handleSuccess}
                onCancel={() => setIsDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreatePlantDialog
        open={createPlantOpen}
        onOpenChange={handleCreatePlantOpenChange}
        growId={growId}
      />
    </>
  );
} 