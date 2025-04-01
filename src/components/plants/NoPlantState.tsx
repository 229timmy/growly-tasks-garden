import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoPlantStateProps {
  onAddPlant: () => void;
  message?: string;
}

export function NoPlantState({ 
  onAddPlant,
  message = "No plants found in this grow."
}: NoPlantStateProps) {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="flex flex-col items-center gap-2">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">{message}</p>
      </div>
      <Button 
        onClick={onAddPlant}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Plant
      </Button>
    </div>
  );
} 