import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sprout, Camera, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateGrowDialog } from '@/components/grows/CreateGrowDialog';
import { CreatePlantDialog } from '@/components/plants/CreatePlantDialog';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface QuickActionsProps {
  className?: string;
  plantId?: string;
  growId?: string;
}

export function QuickActions({ className, plantId, growId }: QuickActionsProps) {
  const [createGrowOpen, setCreateGrowOpen] = useState(false);
  const [createPlantOpen, setCreatePlantOpen] = useState(false);

  const getContextualActions = (): QuickAction[] => {
    const actions: QuickAction[] = [
      {
        label: 'New Grow',
        description: 'Start tracking a new grow',
        icon: <Plus className="h-4 w-4" />,
        onClick: () => setCreateGrowOpen(true),
      },
    ];

    if (growId) {
      actions.push({
        label: 'Add Plant',
        description: 'Add a plant to your grow',
        icon: <Sprout className="h-4 w-4" />,
        onClick: () => setCreatePlantOpen(true),
      });
    }

    // Add plant-specific actions if we have a plant ID
    if (plantId) {
      actions.push(
        {
          label: 'Add Photo',
          description: 'Take a photo of your plant',
          icon: <Camera className="h-4 w-4" />,
          onClick: () => window.location.href = `/app/plants/${plantId}/photos`,
        },
        {
          label: 'Record Measurement',
          description: 'Record plant measurements',
          icon: <Ruler className="h-4 w-4" />,
          onClick: () => window.location.href = `/app/plants/${plantId}/measurements`,
        }
      );
    }

    return actions;
  };

  const actions = getContextualActions();

  return (
    <>
      <Card className={cn('h-[400px]', className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={action.onClick}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary flex-shrink-0">
                    {action.icon}
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-medium truncate">{action.label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateGrowDialog
        open={createGrowOpen}
        onOpenChange={setCreateGrowOpen}
      />

      {growId && (
        <CreatePlantDialog
          open={createPlantOpen}
          onOpenChange={setCreatePlantOpen}
          growId={growId}
        />
      )}
    </>
  );
} 