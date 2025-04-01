import React from 'react';
import { useUserTier } from '@/hooks/use-user-tier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function TierChecker() {
  const { tier, isLoading, canUseBatchMeasurements, getBatchSizeLimit, setDebugTier } = useUserTier();

  if (isLoading) {
    return <div>Loading tier information...</div>;
  }
  
  const handleSetTier = async (newTier: 'free' | 'premium' | 'enterprise') => {
    try {
      await setDebugTier(newTier);
      toast.success(`Tier set to ${newTier}`);
      // Force a page reload to ensure all components pick up the new tier
      window.location.reload();
    } catch (error) {
      toast.error('Failed to set tier');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Tier Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-sm mb-1">Current Tier</div>
            <Badge variant={tier === 'premium' ? 'default' : tier === 'enterprise' ? 'destructive' : 'outline'}>
              {tier || 'Unknown'}
            </Badge>
          </div>
          <div>
            <div className="text-muted-foreground text-sm mb-1">Batch Features</div>
            <Badge variant={canUseBatchMeasurements() ? 'default' : 'outline'}>
              {canUseBatchMeasurements() ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div>
            <div className="text-muted-foreground text-sm mb-1">Batch Size Limit</div>
            <div>{getBatchSizeLimit()} plants</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm mb-1">Tier Info</div>
            <div>{JSON.stringify(tier)}</div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium mb-2">Debug Controls</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSetTier('free')}
              className={tier === 'free' ? 'border-primary' : ''}
            >
              Set Free
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSetTier('premium')}
              className={tier === 'premium' ? 'border-primary' : ''}
            >
              Set Premium
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSetTier('enterprise')}
              className={tier === 'enterprise' ? 'border-primary' : ''}
            >
              Set Enterprise
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 