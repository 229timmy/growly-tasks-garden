import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EnvironmentalTargetsForm } from './EnvironmentalTargetsForm';

interface EnvironmentalTargetsDialogProps {
  growId: string;
  currentTargets: {
    tempLow: number;
    tempHigh: number;
    humidityLow: number;
    humidityHigh: number;
  };
  onSuccess?: () => void;
}

export function EnvironmentalTargetsDialog({ 
  growId, 
  currentTargets,
  onSuccess 
}: EnvironmentalTargetsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Set Targets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Environmental Targets</DialogTitle>
          <DialogDescription>
            Set the ideal temperature and humidity ranges for this grow.
          </DialogDescription>
        </DialogHeader>
        <EnvironmentalTargetsForm 
          growId={growId} 
          currentTargets={currentTargets}
          onSuccess={onSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
} 