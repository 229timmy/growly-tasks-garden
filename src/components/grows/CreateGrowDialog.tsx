import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
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
import { GrowsService } from '@/lib/api/grows';
import type { GrowStage, GrowInsert, Grow } from '@/types/common';

const growsService = new GrowsService();

type CreateGrowData = Omit<GrowInsert, 'user_id'>;

const createGrowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  stage: z.enum(['seedling', 'vegetative', 'flowering']),
  start_date: z.string(),
  end_date: z.string().optional(),
  growing_medium: z.enum(['soil', 'coco', 'hydro', 'aero', 'other']),
  environment: z.enum(['indoor', 'outdoor', 'greenhouse']),
  strains: z.array(z.string()).min(1, 'At least one strain is required'),
  target_temp_low: z.number().min(0).max(40).optional(),
  target_temp_high: z.number().min(0).max(40).optional(),
  target_humidity_low: z.number().min(0).max(100).optional(),
  target_humidity_high: z.number().min(0).max(100).optional(),
  nutrients: z.array(z.string()).optional(),
}) as z.ZodType<CreateGrowData>;

type CreateGrowForm = z.infer<typeof createGrowSchema>;

interface CreateGrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGrowDialog({ open, onOpenChange }: CreateGrowDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const form = useForm<CreateGrowForm>({
    resolver: zodResolver(createGrowSchema),
    defaultValues: {
      name: '',
      description: '',
      stage: 'seedling',
      start_date: new Date().toISOString().split('T')[0],
      growing_medium: 'soil',
      environment: 'indoor',
      strains: [''] as string[],
      target_temp_low: 20,
      target_temp_high: 30,
      target_humidity_low: 40,
      target_humidity_high: 60,
      nutrients: [] as string[],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'strains',
    keyName: 'id',
  });

  const onSubmit = async (data: CreateGrowForm) => {
    try {
      setIsSubmitting(true);
      
      // Filter out empty strains
      const cleanedData = {
        ...data,
        strains: data.strains.filter(strain => strain.trim() !== ''),
      };

      const grow = await growsService.createGrow(cleanedData);
      
      // Invalidate the grows query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['grows'] });
      
      toast.success('Grow created successfully');
      onOpenChange(false);
      navigate(`/app/grows/${grow.id}`);
    } catch (error) {
      console.error('Failed to create grow:', error);
      toast.error('Failed to create grow');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stages: GrowStage[] = [
    'seedling',
    'vegetative',
    'flowering',
  ];

  const growingMediums = [
    'soil',
    'coco',
    'hydro',
    'aero',
    'other',
  ];

  const environments = [
    'indoor',
    'outdoor',
    'greenhouse',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Grow</DialogTitle>
          <DialogDescription>
            Add a new grow to track your plants and progress.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter grow name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter grow description (optional)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Strains Array */}
                <div className="space-y-2">
                  <FormLabel>Strains</FormLabel>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`strains.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Enter strain name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append("" as const)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Strain
                  </Button>
                </div>
              </div>

              {/* Environment Settings */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {environments.map((env) => (
                            <SelectItem 
                              key={env} 
                              value={env}
                              className="capitalize"
                            >
                              {env}
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
                  name="growing_medium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Growing Medium</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select growing medium" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {growingMediums.map((medium) => (
                            <SelectItem 
                              key={medium} 
                              value={medium}
                              className="capitalize"
                            >
                              {medium}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 p-4 rounded-lg border bg-card">
                  <h3 className="font-medium">Environmental Targets</h3>
                  
                  {/* Temperature Range */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <FormField
                        control={form.control}
                        name="target_temp_low"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Min Temperature (°C)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                max={40} 
                                step={0.5}
                                placeholder="20"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="target_temp_high"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Max Temperature (°C)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                max={40} 
                                step={0.5}
                                placeholder="30"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Recommended: 20-30°C for most plants
                    </div>
                  </div>

                  {/* Humidity Range */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <FormField
                        control={form.control}
                        name="target_humidity_low"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Min Humidity (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                max={100} 
                                step={1}
                                placeholder="40"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="target_humidity_high"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Max Humidity (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                max={100} 
                                step={1}
                                placeholder="60"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Recommended: 40-60% for vegetative growth
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Targets */}
              <div className="space-y-4 md:col-span-2">
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem 
                              key={stage} 
                              value={stage}
                              className="capitalize"
                            >
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Grow'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 