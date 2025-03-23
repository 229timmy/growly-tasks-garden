import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EnvironmentalDataForm } from './EnvironmentalDataForm';

interface RecordEnvironmentalDataDialogProps {
  growId: string;
  onSuccess?: () => void;
}

export function RecordEnvironmentalDataDialog({ 
  growId, 
  onSuccess 
}: RecordEnvironmentalDataDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Record Environment</span>
          <span className="sm:hidden">Record</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Environmental Data</DialogTitle>
          <DialogDescription>
            Record the current temperature and humidity for this grow.
          </DialogDescription>
        </DialogHeader>
        <EnvironmentalDataForm 
          growId={growId} 
          onSuccess={onSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
} 