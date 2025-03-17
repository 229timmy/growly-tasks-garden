import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Thermometer, Droplets } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { GrowsService } from '@/lib/api/grows';

interface EnvironmentalTargetsFormProps {
  growId: string;
  currentTargets: {
    tempLow: number;
    tempHigh: number;
    humidityLow: number;
    humidityHigh: number;
  };
  onSuccess?: () => void;
}

interface FormValues {
  targetTempLow: number;
  targetTempHigh: number;
  targetHumidityLow: number;
  targetHumidityHigh: number;
}

const growsService = new GrowsService();

export function EnvironmentalTargetsForm({ 
  growId, 
  currentTargets,
  onSuccess 
}: EnvironmentalTargetsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      targetTempLow: currentTargets.tempLow,
      targetTempHigh: currentTargets.tempHigh,
      targetHumidityLow: currentTargets.humidityLow,
      targetHumidityHigh: currentTargets.humidityHigh
    }
  });
  
  const targetTempLow = watch('targetTempLow');
  const targetTempHigh = watch('targetTempHigh');
  const targetHumidityLow = watch('targetHumidityLow');
  const targetHumidityHigh = watch('targetHumidityHigh');
  
  const onSubmit = async (data: FormValues) => {
    if (data.targetTempLow >= data.targetTempHigh) {
      toast.error('Minimum temperature must be lower than maximum temperature');
      return;
    }
    
    if (data.targetHumidityLow >= data.targetHumidityHigh) {
      toast.error('Minimum humidity must be lower than maximum humidity');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await growsService.updateGrow(growId, {
        target_temp_low: data.targetTempLow,
        target_temp_high: data.targetTempHigh,
        target_humidity_low: data.targetHumidityLow,
        target_humidity_high: data.targetHumidityHigh
      });
      
      toast.success('Environmental targets updated successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating environmental targets:', error);
      toast.error('Failed to update environmental targets');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Environmental Targets</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature Range (°C)
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetTempLow">Minimum</Label>
                <Input
                  id="targetTempLow"
                  type="number"
                  step="0.5"
                  min="10"
                  max="35"
                  {...register('targetTempLow', {
                    required: 'Minimum temperature is required',
                    min: { value: 10, message: 'Minimum temperature is 10°C' },
                    max: { value: 35, message: 'Maximum temperature is 35°C' }
                  })}
                  onChange={(e) => setValue('targetTempLow', parseFloat(e.target.value))}
                />
                {errors.targetTempLow && (
                  <p className="text-sm text-destructive mt-1">{errors.targetTempLow.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="targetTempHigh">Maximum</Label>
                <Input
                  id="targetTempHigh"
                  type="number"
                  step="0.5"
                  min="15"
                  max="40"
                  {...register('targetTempHigh', {
                    required: 'Maximum temperature is required',
                    min: { value: 15, message: 'Minimum temperature is 15°C' },
                    max: { value: 40, message: 'Maximum temperature is 40°C' }
                  })}
                  onChange={(e) => setValue('targetTempHigh', parseFloat(e.target.value))}
                />
                {errors.targetTempHigh && (
                  <p className="text-sm text-destructive mt-1">{errors.targetTempHigh.message}</p>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Current range: {targetTempLow}°C - {targetTempHigh}°C
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Humidity Range (%)
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetHumidityLow">Minimum</Label>
                <Input
                  id="targetHumidityLow"
                  type="number"
                  step="1"
                  min="20"
                  max="80"
                  {...register('targetHumidityLow', {
                    required: 'Minimum humidity is required',
                    min: { value: 20, message: 'Minimum humidity is 20%' },
                    max: { value: 80, message: 'Maximum humidity is 80%' }
                  })}
                  onChange={(e) => setValue('targetHumidityLow', parseFloat(e.target.value))}
                />
                {errors.targetHumidityLow && (
                  <p className="text-sm text-destructive mt-1">{errors.targetHumidityLow.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="targetHumidityHigh">Maximum</Label>
                <Input
                  id="targetHumidityHigh"
                  type="number"
                  step="1"
                  min="30"
                  max="90"
                  {...register('targetHumidityHigh', {
                    required: 'Maximum humidity is required',
                    min: { value: 30, message: 'Minimum humidity is 30%' },
                    max: { value: 90, message: 'Maximum humidity is 90%' }
                  })}
                  onChange={(e) => setValue('targetHumidityHigh', parseFloat(e.target.value))}
                />
                {errors.targetHumidityHigh && (
                  <p className="text-sm text-destructive mt-1">{errors.targetHumidityHigh.message}</p>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Current range: {targetHumidityLow}% - {targetHumidityHigh}%
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Updating...' : 'Update Targets'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 