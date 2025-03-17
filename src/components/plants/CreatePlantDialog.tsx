import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlantsService } from '@/lib/api/plants';
import { GrowsService } from '@/lib/api/grows';
import type { PlantInsert, PlantUpdate } from '@/types/common';

const plantsService = new PlantsService();
const growsService = new GrowsService();

type CreatePlantData = Omit<PlantInsert, 'user_id'>;
type UpdatePlantData = Omit<PlantUpdate, 'user_id'>;

const createPlantSchema = z.object({
  name: z.string().optional(),
  strain: z.string().min(1, 'Strain is required'),
  grow_id: z.string().min(1, 'Grow is required'),
  notes: z.string().optional(),
}).transform((data) => ({
  ...data,
  name: data.name || `Plant ${Date.now()}`, // Generate a default name if not provided
  grow_id: data.grow_id,
}));

type CreatePlantForm = z.infer<typeof createPlantSchema>;

interface CreatePlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  growId: string;
  plantId?: string; // Optional for editing mode
  isEditing?: boolean; // Flag to indicate if we're editing
}

export function CreatePlantDialog({ 
  open, 
  onOpenChange, 
  growId, 
  plantId, 
  isEditing = false 
}: CreatePlantDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch grow details to get available strains
  const { data: grow } = useQuery({
    queryKey: ['grows', growId],
    queryFn: () => growsService.getGrow(growId),
    enabled: !!growId,
  });

  // Fetch plant details if in editing mode
  const { data: plant } = useQuery({
    queryKey: ['plants', plantId],
    queryFn: () => plantsService.getPlant(plantId as string),
    enabled: !!plantId && isEditing,
  });

  const form = useForm<CreatePlantForm>({
    resolver: zodResolver(createPlantSchema),
    defaultValues: {
      name: "",
      strain: "",
      notes: "",
      grow_id: growId,
    },
  });

  // Update form values when plant data is loaded in edit mode
  useEffect(() => {
    if (isEditing && plant) {
      form.reset({
        name: plant.name,
        strain: plant.strain || "",
        notes: plant.notes || "",
        grow_id: plant.grow_id,
      });
    }
  }, [form, plant, isEditing]);

  async function onSubmit(data: CreatePlantForm) {
    try {
      setIsSubmitting(true);
      
      if (isEditing && plantId) {
        // Update existing plant
        const plantData: UpdatePlantData = {
          name: data.name,
          strain: data.strain,
          notes: data.notes,
        };
        await plantsService.updatePlant(plantId, plantData);
        toast.success("Plant updated successfully!");
      } else {
        // Create new plant
        const plantData: CreatePlantData = {
          ...data,
          grow_id: growId,
        };
        await plantsService.createPlant(plantData);
        toast.success("Plant created successfully!");
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['plants'] });
      await queryClient.invalidateQueries({ queryKey: ['plants', growId] });
      if (plantId) {
        await queryClient.invalidateQueries({ queryKey: ['plants', plantId] });
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(isEditing ? "Failed to update plant" : "Failed to create plant");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Plant' : 'Add New Plant'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your plant details.' 
              : 'Add a new plant to your grow. Name is optional and will be auto-generated if not provided.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name {!isEditing && '(Optional)'}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={!isEditing ? "Leave empty for auto-generated name" : "Plant name"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="strain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strain</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {grow?.strains.map((strain) => (
                        <SelectItem 
                          key={strain} 
                          value={strain}
                        >
                          {strain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any notes about this plant" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Adding...') 
                  : (isEditing ? 'Update Plant' : 'Add Plant')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 