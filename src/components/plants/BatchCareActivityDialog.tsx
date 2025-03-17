import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DropletIcon, LeafIcon, Shovel, MoreHorizontalIcon } from 'lucide-react';

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
import { Plant, PlantCareActivityInsert } from '@/types/common';

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
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [activityType, setActivityType] = useState<'watering' | 'feeding' | 'top_dressing' | 'other'>('watering');
  const [amount, setAmount] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [performedAt, setPerformedAt] = useState<Date>(new Date());
  const [selectAll, setSelectAll] = useState(false);

  // Load plants for the grow
  useEffect(() => {
    const loadPlants = async () => {
      setIsLoadingPlants(true);
      try {
        const plantsService = new PlantsService();
        const fetchedPlants = await plantsService.listPlants({ growId });
        setPlants(fetchedPlants);
      } catch (error) {
        console.error('Failed to load plants:', error);
        toast.error('Failed to load plants');
      } finally {
        setIsLoadingPlants(false);
      }
    };
    
    if (growId) {
      loadPlants();
    }
  }, [growId]);

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
        const selectedPlants = plants.filter(plant => selectedPlantIds.includes(plant.id));
        for (const plant of selectedPlants) {
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
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to record batch activities:', error);
      toast.error('Failed to record batch activities');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isControlled = open !== undefined && onOpenChange !== undefined;

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

  return (
    <Dialog open={isControlled ? open : undefined} onOpenChange={isControlled ? onOpenChange : undefined}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">Batch Care Activities</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Multiple Care Activities</DialogTitle>
          <DialogDescription>
            Select plants and record the same care activity for all of them at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plant Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Select Plants</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all" 
                  checked={selectAll} 
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all">Select All</Label>
              </div>
            </div>
            
            {isLoadingPlants ? (
              <div className="text-center py-4">Loading plants...</div>
            ) : plants.length === 0 ? (
              <div className="text-center py-4">No plants found in this grow</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                {plants.map(plant => (
                  <div key={plant.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                    <Checkbox 
                      id={`plant-${plant.id}`} 
                      checked={selectedPlantIds.includes(plant.id)}
                      onCheckedChange={(checked) => handlePlantSelection(plant.id, checked === true)}
                    />
                    <Label htmlFor={`plant-${plant.id}`} className="flex-1 cursor-pointer">
                      {plant.name || `Plant ${plant.id.substring(0, 8)}`}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              {selectedPlantIds.length} of {plants.length} plants selected
            </div>
          </div>

          {/* Activity Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Activity Details</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity-type">Activity Type</Label>
                <Select 
                  value={activityType} 
                  onValueChange={(value) => setActivityType(value as any)}
                >
                  <SelectTrigger id="activity-type">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="watering" className="flex items-center">
                      <div className="flex items-center gap-2">
                        <DropletIcon className="h-4 w-4 text-blue-500" />
                        <span>Watering</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="feeding">
                      <div className="flex items-center gap-2">
                        <LeafIcon className="h-4 w-4 text-green-500" />
                        <span>Feeding</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="top_dressing">
                      <div className="flex items-center gap-2">
                        <Shovel className="h-4 w-4 text-amber-500" />
                        <span>Top Dressing</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <MoreHorizontalIcon className="h-4 w-4 text-gray-500" />
                        <span>Other</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.1"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., ml, g, cups"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
              </div>

              {(activityType === 'feeding' || activityType === 'top_dressing') && (
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this activity"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="performed-at">Date Performed</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="performed-at"
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !performedAt && 'text-muted-foreground'
                      )}
                    >
                      {performedAt ? (
                        format(performedAt, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={performedAt}
                      onSelect={(date) => date && setPerformedAt(date)}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedPlantIds([]);
              setSelectAll(false);
            }}
            disabled={selectedPlantIds.length === 0 || isSubmitting}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Clear Selection
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedPlantIds.length === 0 || isSubmitting}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isSubmitting ? 'Submitting...' : `Record for ${selectedPlantIds.length} Plants`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 