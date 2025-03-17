import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, Loader2 } from 'lucide-react';

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
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { HarvestRecordsService } from '@/lib/api/harvest-records';
import { GrowsService } from '@/lib/api/grows';
import { PlantsService } from '@/lib/api/plants';

// Define the form schema
const harvestRecordSchema = z.object({
  grow_id: z.string().min(1, 'Grow is required'),
  harvest_date: z.date({
    required_error: 'Harvest date is required',
  }),
  total_yield_grams: z.number().min(0, 'Yield must be a positive number').optional(),
  yield_per_plant: z.number().min(0, 'Yield per plant must be a positive number').optional(),
  thc_percentage: z.number().min(0, 'THC percentage must be a positive number').max(100, 'THC percentage cannot exceed 100').optional(),
  cbd_percentage: z.number().min(0, 'CBD percentage must be a positive number').max(100, 'CBD percentage cannot exceed 100').optional(),
  grow_duration_days: z.number().int().min(1, 'Grow duration must be at least 1 day').optional(),
  cure_time_days: z.number().int().min(0, 'Cure time must be a positive number').optional(),
  bud_density_rating: z.number().int().min(1).max(5).optional(),
  aroma_intensity_rating: z.number().int().min(1).max(5).optional(),
  aroma_profile: z.array(z.string()).optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  trichome_coverage_rating: z.number().int().min(1).max(5).optional(),
  overall_quality_rating: z.number().int().min(1).max(10).optional(),
  flavor_notes: z.string().optional(),
  effect_notes: z.string().optional(),
  special_characteristics: z.string().optional(),
  improvement_notes: z.string().optional(),
});

type HarvestRecordFormValues = z.infer<typeof harvestRecordSchema>;

// Aroma profile options
const aromaOptions = [
  { id: 'earthy', label: 'Earthy' },
  { id: 'woody', label: 'Woody' },
  { id: 'pine', label: 'Pine' },
  { id: 'citrus', label: 'Citrus' },
  { id: 'lemon', label: 'Lemon' },
  { id: 'orange', label: 'Orange' },
  { id: 'sweet', label: 'Sweet' },
  { id: 'floral', label: 'Floral' },
  { id: 'spicy', label: 'Spicy' },
  { id: 'herbal', label: 'Herbal' },
  { id: 'pungent', label: 'Pungent' },
  { id: 'skunky', label: 'Skunky' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'cheese', label: 'Cheese' },
  { id: 'berry', label: 'Berry' },
  { id: 'grape', label: 'Grape' },
  { id: 'tropical', label: 'Tropical' },
  { id: 'mango', label: 'Mango' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'chocolate', label: 'Chocolate' },
];

// Color options
const colorOptions = [
  { value: 'green', label: 'Green' },
  { value: 'dark-green', label: 'Dark Green' },
  { value: 'light-green', label: 'Light Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'deep-purple', label: 'Deep Purple' },
  { value: 'blue', label: 'Blue' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
  { value: 'pink', label: 'Pink' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'gold', label: 'Gold' },
  { value: 'white', label: 'White' },
  { value: 'black', label: 'Black' },
  { value: 'brown', label: 'Brown' },
];

interface HarvestRecordFormProps {
  growId?: string;
  harvestRecordId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HarvestRecordForm({
  growId,
  harvestRecordId,
  onSuccess,
  onCancel,
}: HarvestRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGrows, setIsLoadingGrows] = useState(false);
  const [grows, setGrows] = useState<{ id: string; name: string }[]>([]);
  const [plantCount, setPlantCount] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState(!!harvestRecordId);
  
  const harvestRecordsService = new HarvestRecordsService();
  const growsService = new GrowsService();
  const plantsService = new PlantsService();
  
  // Initialize form with default values
  const form = useForm<HarvestRecordFormValues>({
    resolver: zodResolver(harvestRecordSchema),
    defaultValues: {
      grow_id: growId || '',
      harvest_date: new Date(),
      total_yield_grams: undefined,
      yield_per_plant: undefined,
      thc_percentage: undefined,
      cbd_percentage: undefined,
      grow_duration_days: undefined,
      cure_time_days: undefined,
      bud_density_rating: 3,
      aroma_intensity_rating: 3,
      aroma_profile: [],
      primary_color: 'green',
      secondary_color: undefined,
      trichome_coverage_rating: 3,
      overall_quality_rating: 5,
      flavor_notes: '',
      effect_notes: '',
      special_characteristics: '',
      improvement_notes: '',
    },
  });
  
  // Load grows for selection
  useEffect(() => {
    const loadGrows = async () => {
      setIsLoadingGrows(true);
      try {
        console.log('Starting to fetch grows...');
        const fetchedGrows = await growsService.listGrows();
        console.log('All grows:', fetchedGrows);
        
        if (!fetchedGrows || fetchedGrows.length === 0) {
          console.log('No grows found. Make sure you have created some grows first.');
          toast.info('No grows found. Create a grow first before recording a harvest.');
          setGrows([]);
          return;
        }
        
        // Show all grows for now to ensure the dropdown is populated
        console.log('All grows:', fetchedGrows);
        setGrows(fetchedGrows.map(grow => ({ 
          id: grow.id, 
          name: grow.name || `Grow ${grow.id.substring(0, 8)}`,
        })));
        
        // Uncomment this filter once the database issue is fixed
        // const harvestReadyGrows = fetchedGrows.filter(grow => 
        //   grow.stage === 'harvesting' || grow.stage === 'curing' || grow.stage === 'completed' || grow.end_date
        // );
        // console.log('Harvest-ready grows:', harvestReadyGrows);
        // setGrows(harvestReadyGrows.map(grow => ({ id: grow.id, name: grow.name })));
      } catch (error) {
        console.error('Error loading grows:', error);
        toast.error('Failed to load grows: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsLoadingGrows(false);
      }
    };
    
    loadGrows();
    
    // Load existing harvest record if in edit mode
    if (harvestRecordId) {
      loadHarvestRecord();
    } else if (growId) {
      loadPlantCount(growId);
    }
  }, [growId, harvestRecordId, form]);
  
  // Load plant count when grow is selected
  const loadPlantCount = async (selectedGrowId: string) => {
    try {
      const plants = await plantsService.listPlants({ growId: selectedGrowId });
      setPlantCount(plants.length);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };
  
  // Handle grow selection change
  const handleGrowChange = (selectedGrowId: string) => {
    form.setValue('grow_id', selectedGrowId);
    loadPlantCount(selectedGrowId);
  };
  
  // Calculate yield per plant when total yield changes
  const handleTotalYieldChange = (value: number) => {
    form.setValue('total_yield_grams', value);
    
    if (plantCount > 0) {
      const yieldPerPlant = value / plantCount;
      form.setValue('yield_per_plant', parseFloat(yieldPerPlant.toFixed(2)));
    }
  };
  
  // Handle form submission
  const onSubmit = async (values: HarvestRecordFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditMode && harvestRecordId) {
        await harvestRecordsService.updateHarvestRecord(harvestRecordId, values);
        toast.success('Harvest record updated successfully');
      } else {
        await harvestRecordsService.addHarvestRecord(values);
        toast.success('Harvest record added successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error saving harvest record:', error);
      
      // Handle specific error cases
      if (error.message?.includes('invalid input value for enum grow_stage')) {
        console.error('Enum error details:', error);
        toast.error(
          'There is a database configuration issue with grow stages. Please run the SQL fix script and try again.',
          { duration: 6000 }
        );
      } else if (error.code === '22P02') {
        console.error('Type error details:', error);
        toast.error(
          'There is a data type mismatch in the database. Please check the console for details.',
          { duration: 6000 }
        );
      } else {
        toast.error(`Failed to save harvest record: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Load existing harvest record
  const loadHarvestRecord = async () => {
    if (!harvestRecordId) return;
    
    try {
      const record = await harvestRecordsService.getHarvestRecord(harvestRecordId);
      
      // Load the existing harvest record
      form.reset({
        grow_id: record.grow_id,
        harvest_date: new Date(record.harvest_date),
        total_yield_grams: record.total_yield_grams || undefined,
        yield_per_plant: record.yield_per_plant || undefined,
        thc_percentage: record.thc_percentage || undefined,
        cbd_percentage: record.cbd_percentage || undefined,
        grow_duration_days: record.grow_duration_days || undefined,
        cure_time_days: record.cure_time_days || undefined,
        bud_density_rating: record.bud_density_rating || 3,
        aroma_intensity_rating: record.aroma_intensity_rating || 3,
        aroma_profile: record.aroma_profile || [],
        primary_color: record.primary_color || 'green',
        secondary_color: record.secondary_color || undefined,
        trichome_coverage_rating: record.trichome_coverage_rating || 3,
        overall_quality_rating: record.overall_quality_rating || 5,
        flavor_notes: record.flavor_notes || '',
        effect_notes: record.effect_notes || '',
        special_characteristics: record.special_characteristics || '',
        improvement_notes: record.improvement_notes || '',
      });
      
      // Load plant count for the grow
      if (record.grow_id) {
        loadPlantCount(record.grow_id);
      }
    } catch (error) {
      console.error('Error loading harvest record:', error);
      toast.error('Failed to load harvest record');
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Grow Selection */}
        <FormField
          control={form.control}
          name="grow_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grow</FormLabel>
              {growId ? (
                <FormControl>
                  <Input value={grows.find(g => g.id === growId)?.name || growId} disabled />
                </FormControl>
              ) : (
                <Select
                  disabled={isLoadingGrows || isEditMode}
                  onValueChange={handleGrowChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a grow" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {grows.map((grow) => (
                      <SelectItem key={grow.id} value={grow.id}>
                        {grow.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormDescription>
                Select the grow you want to record harvest data for
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Harvest Date */}
        <FormField
          control={form.control}
          name="harvest_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Harvest Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
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
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                The date when the grow was harvested
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Yield Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Yield Information</h3>
          
          {/* Total Yield */}
          <FormField
            control={form.control}
            name="total_yield_grams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Yield (grams)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter total yield"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleTotalYieldChange(value === '' ? undefined : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The total dry weight of your harvest in grams
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Yield Per Plant */}
          <FormField
            control={form.control}
            name="yield_per_plant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yield Per Plant (grams)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter yield per plant"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {plantCount > 0 
                    ? `Average yield per plant (${plantCount} plants in this grow)`
                    : 'Average yield per plant'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* THC Percentage */}
          <FormField
            control={form.control}
            name="thc_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>THC Percentage (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter THC percentage"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  THC content if tested (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* CBD Percentage */}
          <FormField
            control={form.control}
            name="cbd_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CBD Percentage (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter CBD percentage"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  CBD content if tested (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Grow Duration */}
          <FormField
            control={form.control}
            name="grow_duration_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grow Duration (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter grow duration in days"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : parseInt(value, 10));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Total number of days from start to harvest
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Cure Time */}
          <FormField
            control={form.control}
            name="cure_time_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cure Time (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter cure time in days"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : parseInt(value, 10));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  How long the harvest was cured (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Quality Ratings Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quality Ratings</h3>
          
          {/* Bud Density Rating */}
          <FormField
            control={form.control}
            name="bud_density_rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bud Density (1-5)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value || 3]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Fluffy (1)</span>
                      <span>Medium (3)</span>
                      <span>Dense (5)</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Rate how dense the buds are
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Aroma Intensity Rating */}
          <FormField
            control={form.control}
            name="aroma_intensity_rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aroma Intensity (1-5)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value || 3]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Mild (1)</span>
                      <span>Medium (3)</span>
                      <span>Strong (5)</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Rate how strong the aroma is
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Aroma Profile */}
          <FormField
            control={form.control}
            name="aroma_profile"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Aroma Profile</FormLabel>
                  <FormDescription>
                    Select all aromas that apply to this harvest
                  </FormDescription>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {aromaOptions.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name="aroma_profile"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValue, option.id]);
                                  } else {
                                    field.onChange(
                                      currentValue.filter((value) => value !== option.id)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Primary Color */}
          <FormField
            control={form.control}
            name="primary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Color</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || 'green'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The dominant color of the buds
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Secondary Color */}
          <FormField
            control={form.control}
            name="secondary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Color (optional)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                  value={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select secondary color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Any secondary color present in the buds
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Trichome Coverage Rating */}
          <FormField
            control={form.control}
            name="trichome_coverage_rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trichome Coverage (1-5)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value || 3]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sparse (1)</span>
                      <span>Medium (3)</span>
                      <span>Frosty (5)</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Rate the trichome (crystal) coverage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Overall Quality Rating */}
          <FormField
            control={form.control}
            name="overall_quality_rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overall Quality (1-10)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value || 5]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Poor (1)</span>
                      <span>Average (5)</span>
                      <span>Excellent (10)</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Your overall rating of this harvest
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Notes Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notes</h3>
          
          {/* Flavor Notes */}
          <FormField
            control={form.control}
            name="flavor_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flavor Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the flavor profile"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe how the harvest tastes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Effect Notes */}
          <FormField
            control={form.control}
            name="effect_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effect Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the effects"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe the effects of this harvest
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Special Characteristics */}
          <FormField
            control={form.control}
            name="special_characteristics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Characteristics</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Note any special or unique characteristics"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Any unique or notable characteristics of this harvest
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Improvement Notes */}
          <FormField
            control={form.control}
            name="improvement_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Improvement Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Notes for improving future grows"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  What would you do differently next time?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              isEditMode ? 'Update Harvest Record' : 'Save Harvest Record'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 