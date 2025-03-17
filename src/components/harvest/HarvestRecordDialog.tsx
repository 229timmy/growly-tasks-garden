import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HarvestRecordForm } from './HarvestRecordForm';

interface HarvestRecordDialogProps {
  growId?: string;
  harvestRecordId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function HarvestRecordDialog({
  growId,
  harvestRecordId,
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: HarvestRecordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isDialogOpen = open !== undefined ? open : isOpen;
  const setIsDialogOpen = onOpenChange || setIsOpen;
  
  const handleSuccess = () => {
    setIsDialogOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            {harvestRecordId ? 'Edit Harvest Record' : 'Record Harvest'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {harvestRecordId ? 'Edit Harvest Record' : 'Record Harvest Metrics'}
          </DialogTitle>
          <DialogDescription>
            Record detailed metrics about your harvest to track quality and yield over time.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="p-1">
            <HarvestRecordForm
              growId={growId}
              harvestRecordId={harvestRecordId}
              onSuccess={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 