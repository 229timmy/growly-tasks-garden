import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { PlantMeasurementForm } from './PlantMeasurementForm';

interface BatchMeasurementDialogProps {
  growId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BatchMeasurementDialog({ 
  growId, 
  open, 
  onOpenChange 
}: BatchMeasurementDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isDialogOpen = open !== undefined ? open : isOpen;
  const setIsDialogOpen = onOpenChange || setIsOpen;

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
            Record measurements for multiple plants in this grow at once.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <PlantMeasurementForm
            growId={growId}
            onSuccess={() => setIsDialogOpen(false)}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 