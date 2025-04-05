import { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { PlantsService } from '@/lib/api/plants';
import { useUserTier } from '@/hooks/use-user-tier';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PlantInsert } from '@/types/common';

const plantsService = new PlantsService();

const plantSchema = z.object({
  strain: z.string().min(1, 'Strain is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

type PlantFormData = z.infer<typeof plantSchema>;

interface BatchCreatePlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  growId: string;
  onSuccess?: () => void;
}

export function BatchCreatePlantDialog({
  open,
  onOpenChange,
  growId,
  onSuccess,
}: BatchCreatePlantDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasRequiredTier } = useUserTier();
  const [batches, setBatches] = useState<PlantFormData[]>([]);

  const form = useForm<PlantFormData>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      strain: '',
      quantity: 1,
    },
  });

  const addToBatch = (data: PlantFormData) => {
    setBatches([...batches, data]);
    form.reset();
  };

  const removeBatch = (index: number) => {
    setBatches(batches.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    if (!hasRequiredTier('premium')) {
      toast.error('Batch plant creation requires Premium or Enterprise tier');
      return;
    }

    if (batches.length === 0) {
      toast.error('Please add at least one batch of plants');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create array of plants from batches
      const plants: Omit<PlantInsert, 'user_id'>[] = batches.flatMap(batch => 
        Array(batch.quantity).fill(null).map((_, i) => ({
          strain: batch.strain,
          name: `${batch.strain} #${i + 1}`,
          grow_id: growId,
        }))
      );

      await plantsService.createBatchPlants(plants);
      toast.success('Plants created successfully!');
      setBatches([]);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating plants:', error);
      toast.error('Failed to create plants');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if user doesn't have required tier
  if (!hasRequiredTier('premium')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Batch Add Plants
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Batch Add Plants</DialogTitle>
          <DialogDescription>
            Add multiple plants at once by specifying strain and quantity.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(addToBatch)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="strain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strain</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter strain name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Batch
                </Button>
              </form>
            </Form>

            {batches.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="font-medium">Batches to Create</h3>
                <div className="space-y-2">
                  {batches.map((batch, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div>
                        <p className="font-medium">{batch.strain}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {batch.quantity}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBatch(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Creating Plants...'
                    : `Create ${batches.reduce((sum, b) => sum + b.quantity, 0)} Plants`}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 