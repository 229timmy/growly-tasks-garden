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
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Record Environment
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