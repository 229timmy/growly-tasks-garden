import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlantCareActivityForm } from '@/components/plants/PlantCareActivityForm';

interface PlantCareActivityDialogProps {
  growId: string;
  plantId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function PlantCareActivityDialog({
  growId,
  plantId,
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: PlantCareActivityDialogProps) {
  const isControlled = open !== undefined && onOpenChange !== undefined;
  
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isControlled ? open : undefined} onOpenChange={isControlled ? onOpenChange : undefined}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Record Care Activity</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Plant Care Activity</DialogTitle>
          <DialogDescription>
            Record a care activity such as watering, feeding, or top dressing.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <PlantCareActivityForm
            growId={growId}
            plantId={plantId}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange && onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 