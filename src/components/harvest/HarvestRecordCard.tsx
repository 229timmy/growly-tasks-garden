import { format } from 'date-fns';
import { 
  Scale, 
  Droplets, 
  Thermometer, 
  Leaf, 
  Calendar, 
  Star, 
  Flower, 
  Sparkles 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HarvestRecordDialog } from './HarvestRecordDialog';
import { HarvestRecord } from '@/types/common';

interface HarvestRecordCardProps {
  record: HarvestRecord;
  growName: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function HarvestRecordCard({
  record,
  growName,
  onEdit,
  onDelete,
}: HarvestRecordCardProps) {
  // Helper function to render rating stars
  const renderRating = (rating: number, max: number = 5) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm">{rating}/{max}</span>
      </div>
    );
  };

  // Helper function to get color class for a color name
  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'green': 'bg-green-100 text-green-800',
      'dark-green': 'bg-green-700 text-white',
      'light-green': 'bg-green-50 text-green-600',
      'purple': 'bg-purple-100 text-purple-800',
      'deep-purple': 'bg-purple-700 text-white',
      'blue': 'bg-blue-100 text-blue-800',
      'orange': 'bg-orange-100 text-orange-800',
      'red': 'bg-red-100 text-red-800',
      'pink': 'bg-pink-100 text-pink-800',
      'yellow': 'bg-yellow-100 text-yellow-800',
      'gold': 'bg-amber-100 text-amber-800',
      'white': 'bg-gray-50 text-gray-800',
      'black': 'bg-gray-800 text-white',
      'brown': 'bg-amber-800 text-white',
    };
    
    return colorMap[colorName] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{growName}</CardTitle>
            <CardDescription>
              Harvested on {format(new Date(record.harvest_date), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Harvested
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Yield Information */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <Scale className="h-4 w-4" /> Yield Information
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded-md p-2">
              <div className="text-xs text-muted-foreground">Total Yield</div>
              <div className="font-medium">
                {record.total_yield_grams ? `${record.total_yield_grams}g` : 'Not recorded'}
              </div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-xs text-muted-foreground">Per Plant</div>
              <div className="font-medium">
                {record.yield_per_plant ? `${record.yield_per_plant}g` : 'Not recorded'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Cannabinoid Content */}
        {(record.thc_percentage || record.cbd_percentage) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1">
              <Leaf className="h-4 w-4" /> Cannabinoid Content
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {record.thc_percentage !== null && (
                <div className="bg-muted rounded-md p-2">
                  <div className="text-xs text-muted-foreground">THC</div>
                  <div className="font-medium">{record.thc_percentage}%</div>
                </div>
              )}
              {record.cbd_percentage !== null && (
                <div className="bg-muted rounded-md p-2">
                  <div className="text-xs text-muted-foreground">CBD</div>
                  <div className="font-medium">{record.cbd_percentage}%</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Grow Information */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Grow Information
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {record.grow_duration_days && (
              <div className="bg-muted rounded-md p-2">
                <div className="text-xs text-muted-foreground">Duration</div>
                <div className="font-medium">{record.grow_duration_days} days</div>
              </div>
            )}
            {record.cure_time_days && (
              <div className="bg-muted rounded-md p-2">
                <div className="text-xs text-muted-foreground">Cure Time</div>
                <div className="font-medium">{record.cure_time_days} days</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quality Ratings */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <Star className="h-4 w-4" /> Quality Ratings
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {record.bud_density_rating && (
              <div className="bg-muted rounded-md p-2">
                <div className="text-xs text-muted-foreground">Bud Density</div>
                <div>{renderRating(record.bud_density_rating)}</div>
              </div>
            )}
            {record.aroma_intensity_rating && (
              <div className="bg-muted rounded-md p-2">
                <div className="text-xs text-muted-foreground">Aroma Intensity</div>
                <div>{renderRating(record.aroma_intensity_rating)}</div>
              </div>
            )}
            {record.trichome_coverage_rating && (
              <div className="bg-muted rounded-md p-2">
                <div className="text-xs text-muted-foreground">Trichome Coverage</div>
                <div>{renderRating(record.trichome_coverage_rating)}</div>
              </div>
            )}
            {record.overall_quality_rating && (
              <div className="bg-muted rounded-md p-2">
                <div className="text-xs text-muted-foreground">Overall Quality</div>
                <div>{renderRating(record.overall_quality_rating, 10)}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Colors and Aromas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Colors */}
          {record.primary_color && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Flower className="h-4 w-4" /> Colors
              </h3>
              <div className="flex flex-wrap gap-1">
                <Badge className={getColorClass(record.primary_color)}>
                  {record.primary_color.replace('-', ' ')}
                </Badge>
                {record.secondary_color && (
                  <Badge className={getColorClass(record.secondary_color)}>
                    {record.secondary_color.replace('-', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Aromas */}
          {record.aroma_profile && record.aroma_profile.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Droplets className="h-4 w-4" /> Aromas
              </h3>
              <div className="flex flex-wrap gap-1">
                {record.aroma_profile.slice(0, 3).map((aroma) => (
                  <Badge key={aroma} variant="outline">
                    {aroma}
                  </Badge>
                ))}
                {record.aroma_profile.length > 3 && (
                  <Badge variant="outline">
                    +{record.aroma_profile.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Notes Preview */}
        {(record.flavor_notes || record.effect_notes) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> Notes
            </h3>
            {record.flavor_notes && (
              <div className="text-sm">
                <span className="font-medium">Flavor:</span> {record.flavor_notes.length > 100 
                  ? `${record.flavor_notes.substring(0, 100)}...` 
                  : record.flavor_notes}
              </div>
            )}
            {record.effect_notes && (
              <div className="text-sm">
                <span className="font-medium">Effects:</span> {record.effect_notes.length > 100 
                  ? `${record.effect_notes.substring(0, 100)}...` 
                  : record.effect_notes}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <HarvestRecordDialog
          harvestRecordId={record.id}
          onSuccess={onEdit}
          trigger={<Button variant="outline" size="sm">Edit</Button>}
        />
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 