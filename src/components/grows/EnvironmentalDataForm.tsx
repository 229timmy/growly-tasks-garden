import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Thermometer, Droplets } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { EnvironmentalService } from '@/lib/api/environmental';

interface EnvironmentalDataFormProps {
  growId: string;
  onSuccess?: () => void;
}

interface FormValues {
  temperature: number;
  humidity: number;
}

const environmentalService = new EnvironmentalService();

export function EnvironmentalDataForm({ growId, onSuccess }: EnvironmentalDataFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      temperature: 24,
      humidity: 50
    }
  });
  
  const temperature = watch('temperature');
  const humidity = watch('humidity');
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await environmentalService.addEnvironmentalData({
        grow_id: growId,
        temperature: data.temperature,
        humidity: data.humidity
      });
      
      toast.success('Environmental data recorded successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error recording environmental data:', error);
      toast.error('Failed to record environmental data');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Environmental Data</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperature (°C)
              </Label>
              <span className="text-sm font-medium">{temperature}°C</span>
            </div>
            <Slider
              id="temperature"
              min={10}
              max={40}
              step={0.5}
              value={[temperature]}
              onValueChange={(value) => setValue('temperature', value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10°C</span>
              <span>25°C</span>
              <span>40°C</span>
            </div>
            {errors.temperature && (
              <p className="text-sm text-destructive">{errors.temperature.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="humidity" className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Humidity (%)
              </Label>
              <span className="text-sm font-medium">{humidity}%</span>
            </div>
            <Slider
              id="humidity"
              min={0}
              max={100}
              step={1}
              value={[humidity]}
              onValueChange={(value) => setValue('humidity', value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            {errors.humidity && (
              <p className="text-sm text-destructive">{errors.humidity.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature-input">Temperature</Label>
              <Input
                id="temperature-input"
                type="number"
                step="0.1"
                min="10"
                max="40"
                {...register('temperature', {
                  required: 'Temperature is required',
                  min: { value: 10, message: 'Minimum temperature is 10°C' },
                  max: { value: 40, message: 'Maximum temperature is 40°C' }
                })}
                onChange={(e) => setValue('temperature', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="humidity-input">Humidity</Label>
              <Input
                id="humidity-input"
                type="number"
                step="1"
                min="0"
                max="100"
                {...register('humidity', {
                  required: 'Humidity is required',
                  min: { value: 0, message: 'Minimum humidity is 0%' },
                  max: { value: 100, message: 'Maximum humidity is 100%' }
                })}
                onChange={(e) => setValue('humidity', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Recording...' : 'Record Data'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 