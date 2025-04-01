import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DropletIcon, LeafIcon, Shovel, MoreHorizontalIcon, Plus, AlertCircle } from 'lucide-react';
import { useUserTier } from '@/hooks/use-user-tier';
import type { Plant } from '@/types/common';
import { NoPlantState } from './NoPlantState';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlantCareService } from '@/lib/api/plant-care';
import { PlantsService } from '@/lib/api/plants';
import { ActivitiesService } from '@/lib/api/activities';
import { PlantCareActivityInsert } from '@/types/common';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlantCareActivityForm } from './PlantCareActivityForm';
import { CreatePlantDialog } from './CreatePlantDialog';

interface BatchCareActivityDialogProps {
  growId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BatchCareActivityDialog({
  growId,
  open,
  onOpenChange,
  onSuccess,
}: BatchCareActivityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [activityType, setActivityType] = useState<'watering' | 'feeding' | 'top_dressing' | 'other'>('watering');
  const [amount, setAmount] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [performedAt, setPerformedAt] = useState<Date>(new Date());
  const [selectAll, setSelectAll] = useState(false);
  const { canUseBatchMeasurements, tier, isLoading: tierLoading } = useUserTier();
  const [internalOpen, setInternalOpen] = useState(false);
  const [createPlantOpen, setCreatePlantOpen] = useState(false);

  // Determine if the component is being used in controlled or uncontrolled mode
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isDialogOpen = isControlled ? open : internalOpen;
  const setIsDialogOpen = isControlled 
    ? onOpenChange 
    : setInternalOpen;

  // Load plants when the dialog opens
  useEffect(() => {
    if (isDialogOpen && !isLoadingPlants && !hasAttemptedLoad && canUseBatchMeasurements()) {
      loadPlantsForGrow();
    }
  }, [isDialogOpen, isLoadingPlants, hasAttemptedLoad, canUseBatchMeasurements]);

  // Function to load plants
  const loadPlantsForGrow = async () => {
    if (!canUseBatchMeasurements() || !growId || tierLoading) {
      return;
    }
    
    setIsLoadingPlants(true);
    setLoadError(null);
    
    try {
      const plantsService = new PlantsService();
      const fetchedPlants = await plantsService.listPlants({ growId });
      setPlants(fetchedPlants);
    } catch (error) {
      setLoadError('Failed to load plants. Please try again.');
      toast.error('Failed to load plants');
    } finally {
      setIsLoadingPlants(false);
      setHasAttemptedLoad(true);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPlantIds(plants.map(plant => plant.id));
    } else {
      setSelectedPlantIds([]);
    }
  };

  // Handle individual plant selection
  const handlePlantSelection = (plantId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlantIds(prev => [...prev, plantId]);
    } else {
      setSelectedPlantIds(prev => prev.filter(id => id !== plantId));
      setSelectAll(false);
    }
  };

  // Update selectAll state when all plants are individually selected
  useEffect(() => {
    if (plants.length > 0 && selectedPlantIds.length === plants.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedPlantIds, plants]);

  // Reset states when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedPlantIds([]);
      setPlants([]);
      setHasAttemptedLoad(false);
      setSelectAll(false);
      setAmount('');
      setUnit('');
      setProductName('');
      setNotes('');
      setPerformedAt(new Date());
      setActivityType('watering');
    }
  }, [isDialogOpen]);

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedPlantIds.length === 0) {
      toast.error('Please select at least one plant');
      return;
    }

    setIsSubmitting(true);
    try {
      const plantCareService = new PlantCareService();
      const activitiesService = new ActivitiesService();
      
      // Create an activity for each selected plant
      const activities: Omit<PlantCareActivityInsert, 'user_id'>[] = selectedPlantIds.map(plantId => ({
        grow_id: growId,
        plant_id: plantId,
        activity_type: activityType,
        amount: amount ? parseFloat(amount) : undefined,
        unit: unit || undefined,
        product_name: productName || undefined,
        notes: notes || undefined,
        performed_at: performedAt.toISOString(),
      }));

      // Also create an activity for the entire grow if needed
      if (selectedPlantIds.length === plants.length) {
        activities.push({
          grow_id: growId,
          activity_type: activityType,
          amount: amount ? parseFloat(amount) : undefined,
          unit: unit || undefined,
          product_name: productName || undefined,
          notes: `Batch ${activityType} for all plants in grow`,
          performed_at: performedAt.toISOString(),
        });
      }
      
      // Add the plant care activities
      await plantCareService.addBatchActivities(activities);
      
      // Track these activities in the main activity feed
      const activityTitle = getActivityTitle(activityType);
      const activityDescription = `Batch ${activityType} for ${selectedPlantIds.length} plants`;
      
      // Add an activity entry for the batch operation
      await activitiesService.addActivity({
        type: 'plant_updated',
        title: activityTitle,
        description: activityDescription,
        related_grow_id: growId,
        timestamp: performedAt.toISOString(),
      });
      
      // Also add individual activities for each plant if needed
      if (selectedPlantIds.length <= 5) {  // Limit individual entries to avoid flooding the feed
        const selectedPlantsData = plants.filter(plant => selectedPlantIds.includes(plant.id));
        for (const plant of selectedPlantsData) {
          await activitiesService.addActivity({
            type: 'plant_updated',
            title: `${activityTitle}: ${plant.name}`,
            description: `${activityType} recorded for ${plant.name}`,
            related_grow_id: growId,
            related_plant_id: plant.id,
            timestamp: performedAt.toISOString(),
          });
        }
      }
      
      toast.success(`${activities.length} activities recorded successfully`);
      
      // Reset form
      setSelectedPlantIds([]);
      setSelectAll(false);
      setAmount('');
      setUnit('');
      setProductName('');
      setNotes('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to record batch activities:', error);
      toast.error('Failed to record batch activities');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watering':
        return <DropletIcon className="h-4 w-4 text-blue-500" />;
      case 'feeding':
        return <LeafIcon className="h-4 w-4 text-green-500" />;
      case 'top_dressing':
        return <Shovel className="h-4 w-4 text-amber-500" />;
      default:
        return <MoreHorizontalIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper function to get a human-readable activity title
  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'watering':
        return 'Plants Watered';
      case 'feeding':
        return 'Plants Fed';
      case 'top_dressing':
        return 'Top Dressing Applied';
      default:
        return 'Plant Care Activity';
    }
  };

  const handleCreatePlantSuccess = () => {
    setCreatePlantOpen(false);
    loadPlantsForGrow();
  };

  // Don't render anything if user can't use batch features or tier is still loading
  if (tierLoading) {
    return null;
  }
  
  if (!canUseBatchMeasurements()) {
    return null;
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Batch Care Activities
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Batch Plant Care Activities</DialogTitle>
            <DialogDescription>
              Select plants and record care activities for all of them at once.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <div className="space-y-4">
              {isLoadingPlants ? (
                <div className="p-4 text-center">Loading plants...</div>
              ) : (hasAttemptedLoad && plants.length === 0) || loadError ? (
                <NoPlantState onAddPlant={() => setCreatePlantOpen(true)} />
              ) : plants.length > 0 && (
                <>
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox 
                      id="select-all"
                      checked={selectedPlantIds.length === plants.length && plants.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 bg-muted/50 rounded-lg p-2">
                    {plants.map((plant) => (
                      <div key={plant.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                        <Checkbox
                          id={`plant-${plant.id}`}
                          checked={selectedPlantIds.includes(plant.id)}
                          onCheckedChange={(checked) => handlePlantSelection(plant.id, checked as boolean)}
                        />
                        <label htmlFor={`plant-${plant.id}`} className="text-sm">
                          {plant.name || `Plant ${plant.id}`}
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedPlantIds.length > 0 && (
                    <div className="pt-4">
                      <PlantCareActivityForm
                        growId={growId}
                        plantId={selectedPlantIds[0]}
                        onSuccess={handleSubmit}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <CreatePlantDialog
        open={createPlantOpen}
        onOpenChange={setCreatePlantOpen}
        growId={growId}
      />
    </>
  );
} 