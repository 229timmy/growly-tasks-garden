import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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

const formSchema = z.object({
  plant_id: z.string().optional(),
  grow_id: z.string(),
  activity_type: z.enum(['watering', 'feeding', 'top_dressing', 'other']),
  amount: z.coerce.number().optional(),
  unit: z.string().optional(),
  product_name: z.string().optional(),
  notes: z.string().optional(),
  performed_at: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface PlantCareActivityFormProps {
  growId: string;
  plantId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isBatchMode?: boolean;
  onAddToBatch?: (activity: Omit<PlantCareActivityInsert, 'user_id'>) => void;
}

export function PlantCareActivityForm({
  growId,
  plantId,
  onSuccess,
  onCancel,
  isBatchMode = false,
  onAddToBatch,
}: PlantCareActivityFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grow_id: growId,
      plant_id: plantId,
      activity_type: 'watering',
      amount: undefined,
      unit: '',
      product_name: '',
      notes: '',
      performed_at: new Date(),
    },
  });

  const activityType = form.watch('activity_type');

  // Load plants for the grow if in batch mode or no plantId is provided
  useEffect(() => {
    if (!plantId || isBatchMode) {
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
      loadPlants();
    }
  }, [plantId, isBatchMode, growId]);

  const onSubmit = async (values: FormValues) => {
    if (isBatchMode && onAddToBatch) {
      // Create activity data with required fields
      const activityData = {
        grow_id: values.grow_id,
        activity_type: values.activity_type,
        performed_at: values.performed_at.toISOString(),
      } as Omit<PlantCareActivityInsert, 'user_id'>;
      
      // Add optional fields if they exist
      if (values.plant_id) activityData.plant_id = values.plant_id;
      if (values.amount !== undefined) activityData.amount = values.amount;
      if (values.unit) activityData.unit = values.unit;
      if (values.product_name) activityData.product_name = values.product_name;
      if (values.notes) activityData.notes = values.notes;
      
      onAddToBatch(activityData);
      form.reset({
        ...form.getValues(),
        plant_id: undefined,
        notes: '',
      });
      toast.success('Activity added to batch');
      return;
    }

    setIsSubmitting(true);
    try {
      const plantCareService = new PlantCareService();
      const activitiesService = new ActivitiesService();
      
      // Create activity data with required fields
      const activityData = {
        grow_id: values.grow_id,
        activity_type: values.activity_type,
        performed_at: values.performed_at.toISOString(),
      } as Omit<PlantCareActivityInsert, 'user_id'>;
      
      // Add optional fields if they exist
      if (values.plant_id) activityData.plant_id = values.plant_id;
      if (values.amount !== undefined) activityData.amount = values.amount;
      if (values.unit) activityData.unit = values.unit;
      if (values.product_name) activityData.product_name = values.product_name;
      if (values.notes) activityData.notes = values.notes;
      
      // Add the plant care activity
      await plantCareService.addActivity(activityData);
      
      // Track this activity in the main activity feed
      const activityTitle = getActivityTitle(values.activity_type);
      
      // If we have a plant ID, get the plant name for a better description
      let plantName = "a plant";
      if (values.plant_id) {
        try {
          const plantsService = new PlantsService();
          const plant = await plantsService.getPlant(values.plant_id);
          plantName = plant.name || `Plant ${plant.id.substring(0, 8)}`;
        } catch (error) {
          console.error('Failed to fetch plant details:', error);
        }
      }
      
      // Add an activity entry
      await activitiesService.addActivity({
        type: 'plant_updated',
        title: activityTitle,
        description: `${values.activity_type} recorded for ${plantName}`,
        related_grow_id: values.grow_id,
        related_plant_id: values.plant_id,
        timestamp: values.performed_at.toISOString(),
      });
      
      toast.success('Plant care activity recorded successfully');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/grows/${growId}`);
      }
    } catch (error) {
      console.error('Failed to record plant care activity:', error);
      toast.error('Failed to record plant care activity');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to get a human-readable activity title
  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'watering':
        return 'Plant Watered';
      case 'feeding':
        return 'Plant Fed';
      case 'top_dressing':
        return 'Top Dressing Applied';
      default:
        return 'Plant Care Activity';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {(!plantId || isBatchMode) && (
          <FormField
            control={form.control}
            name="plant_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plant</FormLabel>
                <Select
                  disabled={isLoadingPlants}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id}>
                        {plant.name || `Plant ${plant.id.substring(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the plant for this care activity
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="activity_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="watering">Watering</SelectItem>
                  <SelectItem value="feeding">Feeding</SelectItem>
                  <SelectItem value="top_dressing">Top Dressing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The type of care activity performed
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter amount"
                    {...field}
                    value={field.value === undefined ? '' : field.value}
                  />
                </FormControl>
                <FormDescription>
                  {activityType === 'watering'
                    ? 'Amount of water'
                    : activityType === 'feeding'
                    ? 'Amount of nutrients'
                    : activityType === 'top_dressing'
                    ? 'Amount of soil/amendments'
                    : 'Quantity (if applicable)'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ml, g, cups" {...field} />
                </FormControl>
                <FormDescription>Unit of measurement</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(activityType === 'feeding' || activityType === 'top_dressing') && (
          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormDescription>
                  {activityType === 'feeding'
                    ? 'Name of the nutrient product used'
                    : 'Name of the soil amendment used'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about this activity"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional details about the care activity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="performed_at"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date Performed</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When was this care activity performed?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {isBatchMode && onAddToBatch ? (
            <Button type="submit" disabled={isSubmitting}>
              Add to Batch
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Activity'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
} 