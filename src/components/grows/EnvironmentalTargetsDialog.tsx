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
        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Set Targets</span>
          <span className="sm:hidden">Targets</span>
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