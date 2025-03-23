import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { PlantMeasurementsService } from '@/lib/api/plant-measurements';
import { PlantsService } from '@/lib/api/plants';
import { useUserTier } from '@/hooks/use-user-tier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const measurementSchema = z.object({
  plant_id: z.string().min(1, 'Plant is required'),
  height: z.number().min(0, 'Height must be a positive number').nullable(),
  health_score: z.number().min(1, 'Health score must be at least 1').max(10, 'Health score cannot exceed 10').nullable(),
  leaf_count: z.number().min(0).nullable(),
  ph_level: z.number().min(0).max(14).nullable(),
  notes: z.string().optional().default(''),
  measured_at: z.string().default(() => new Date().toISOString()),
});

type MeasurementFormData = z.infer<typeof measurementSchema>;

interface PlantMeasurementFormProps {
  plantId?: string; // Made optional to support batch mode
  growId: string; // Added to fetch plants from the same grow
  selectedPlantIds?: string[]; // Added to support batch mode with pre-selected plants
  onSuccess?: () => void;
}

const plantsService = new PlantsService();
const measurementsService = new PlantMeasurementsService();

export function PlantMeasurementForm({ plantId, growId, selectedPlantIds, onSuccess }: PlantMeasurementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchMeasurements, setBatchMeasurements] = useState<MeasurementFormData[]>([]);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { canUseBatchMeasurements, getBatchSizeLimit } = useUserTier();
  const batchSizeLimit = getBatchSizeLimit();

  // Fetch plants from the same grow
  const { data: plants } = useQuery({
    queryKey: ['plants', growId],
    queryFn: () => plantsService.listPlants({ growId }),
    enabled: canUseBatchMeasurements() && !plantId, // Only fetch if in batch mode
  });

  // Initialize form with default values
  const form = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      plant_id: plantId || '',
      height: null,
      health_score: null,
      leaf_count: null,
      ph_level: null,
      notes: '',
      measured_at: new Date().toISOString(),
    },
  });

  // If selectedPlantIds is provided, initialize batch measurements for all selected plants
  useEffect(() => {
    if (selectedPlantIds?.length) {
      const initialBatch = selectedPlantIds.map(id => ({
        plant_id: id,
        height: null,
        health_score: null,
        leaf_count: null,
        ph_level: null,
        notes: '',
        measured_at: new Date().toISOString(),
      }));
      setBatchMeasurements(initialBatch);
    }
  }, [selectedPlantIds]);

  const addMeasurementMutation = useMutation({
    mutationFn: async (data: MeasurementFormData | MeasurementFormData[]) => {
      if (Array.isArray(data)) {
        // Batch measurements
        return Promise.all(
          data.map(measurement =>
            measurementsService.addMeasurement({
              ...measurement,
              plant_id: measurement.plant_id,
            })
          )
        );
      } else {
        // Single measurement
        return measurementsService.addMeasurement({
          ...data,
          plant_id: data.plant_id,
        });
      }
    },
    onSuccess: () => {
      // Invalidate queries for all affected plants
      const affectedPlants = new Set([
        ...(plantId ? [plantId] : []),
        ...batchMeasurements.map(m => m.plant_id),
      ]);
      affectedPlants.forEach(pid => {
        queryClient.invalidateQueries({ queryKey: ['plant-measurements', pid] });
      });

      toast.success(
        batchMeasurements.length > 0 
          ? 'Batch measurements recorded successfully'
          : 'Measurement recorded successfully'
      );
      form.reset();
      setBatchMeasurements([]);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to record measurement. Please try again.');
      console.error('Failed to add measurement:', error);
    },
  });

  const onSubmit = async (data: MeasurementFormData) => {
    setIsSubmitting(true);
    try {
      if (batchMeasurements.length > 0) {
        // If we have batch measurements, submit those
        // Only include the current form data if it has both plant_id and height
        const hasCurrentFormData = data.plant_id && data.height;
        const measurementsToSubmit = hasCurrentFormData 
          ? [...batchMeasurements, data]
          : batchMeasurements;
          
        await addMeasurementMutation.mutateAsync(measurementsToSubmit);
      } else {
        // For single measurement, require the data as before
        await addMeasurementMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToBatch = (data: MeasurementFormData) => {
    if (batchMeasurements.length >= batchSizeLimit) {
      toast.error(`You can add up to ${batchSizeLimit} measurements in a batch. Please submit the current batch first.`);
      return;
    }
    setBatchMeasurements([...batchMeasurements, data]);
    form.reset({
      ...form.getValues(),
      plant_id: '', // Reset plant selection
      height: undefined, // Reset height
      health_score: undefined, // Reset health score
      leaf_count: undefined, // Reset leaf count
      ph_level: undefined, // Reset pH
      notes: '', // Reset notes
    });
  };

  const removeBatchItem = (index: number) => {
    setBatchMeasurements(batchMeasurements.filter((_, i) => i !== index));
  };

  const submitBatchMeasurements = async () => {
    if (batchMeasurements.length === 0) {
      toast.error('No measurements to submit');
      return;
    }

    setIsBatchSubmitting(true);
    try {
      const service = new PlantMeasurementsService();
      await addMeasurementMutation.mutateAsync(batchMeasurements);
      
      // Clear the batch after successful submission
      setBatchMeasurements([]);
      form.reset();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['plant-measurements'] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      
      toast.success('Batch measurements recorded successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit batch measurements:', error);
      toast.error('Failed to record batch measurements');
    } finally {
      setIsBatchSubmitting(false);
    }
  };

  // If we have selectedPlantIds, render the batch measurement form
  if (selectedPlantIds?.length) {
    return (
      <div className="space-y-4">
        <Form {...form}>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="height"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number" 
                        step="0.1" 
                        value={value ?? ''}
                        onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="health_score"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Health Score
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Rate plant health from 1-10</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number" 
                        min="1" 
                        max="10" 
                        step="1" 
                        value={value ?? ''}
                        onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leaf_count"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Leaf Count</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number" 
                        value={value ?? ''}
                        onChange={e => onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ph_level"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>pH Level</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number" 
                        min="0" 
                        max="14" 
                        step="0.1" 
                        value={value ?? ''}
                        onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setBatchMeasurements([]);
              onSuccess?.();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              const formData = form.getValues();
              // Apply the form values to all selected plants
              const updatedBatch = selectedPlantIds.map(plantId => ({
                ...formData,
                plant_id: plantId,
                measured_at: new Date().toISOString(),
              }));
              setBatchMeasurements(updatedBatch);
              submitBatchMeasurements();
            }}
            disabled={isBatchSubmitting}
          >
            {isBatchSubmitting ? 'Recording...' : `Record for ${selectedPlantIds.length} Plants`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canUseBatchMeasurements() && !plantId && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Premium Feature: Batch Measurements
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add up to {batchSizeLimit} measurements for multiple plants at once.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {canUseBatchMeasurements() && !plantId && (
        <div className="text-sm text-muted-foreground mb-4">
          <p>1. Select a plant and enter measurements</p>
          <p>2. Click "Add to Batch" for each plant</p>
          <p>3. When finished, click "Record Measurements" to save all at once</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!plantId && (
            <FormField
              control={form.control}
              name="plant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plants?.map((plant) => (
                        <SelectItem key={plant.id} value={plant.id}>
                          {plant.name} ({plant.strain})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="height"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormDescription>
                  Measure from the base of the stem to the highest point
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.1"
                    placeholder="Enter plant height"
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="health_score"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Health Score (1-10)</FormLabel>
                  <FormDescription>
                    Rate the overall health of the plant
                  </FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="1"
                      min="1"
                      max="10"
                      placeholder="Enter health score"
                      value={value ?? ''}
                      onChange={e => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leaf_count"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Leaf Count</FormLabel>
                  <FormDescription>
                    Count the total number of leaves
                  </FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Enter leaf count"
                      value={value ?? ''}
                      onChange={e => onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="ph_level"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>pH Level (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.1"
                    placeholder="Enter pH level"
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Add any additional notes about the measurement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-2">
            {canUseBatchMeasurements() && !plantId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const values = form.getValues();
                  if (values.height && values.plant_id) {
                    addToBatch(values);
                  } else {
                    toast.error('Please select a plant and enter a height measurement');
                  }
                }}
                disabled={batchMeasurements.length >= batchSizeLimit}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add to Batch ({batchMeasurements.length}/{batchSizeLimit})
              </Button>
            )}
            {batchMeasurements.length > 0 ? (
              <Button 
                type="button" 
                onClick={submitBatchMeasurements}
                disabled={isBatchSubmitting}
                className="w-full sm:w-auto"
              >
                {isBatchSubmitting ? 'Recording...' : `Record ${batchMeasurements.length} Measurements`}
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Recording...' : 'Record Measurement'}
              </Button>
            )}
          </div>
        </form>
      </Form>

      {canUseBatchMeasurements() && !plantId && batchMeasurements.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-2">Batch Measurements</h3>
          <div className="space-y-2">
            {batchMeasurements.map((measurement, index) => {
              const plant = plants?.find(p => p.id === measurement.plant_id);
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="space-y-1">
                    <div className="font-medium">{plant?.name} ({plant?.strain})</div>
                    <div className="text-sm text-muted-foreground">
                      Height: {measurement.height}cm
                      {measurement.ph_level && ` • pH: ${measurement.ph_level}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBatchItem(index)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
} 