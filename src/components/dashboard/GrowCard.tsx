import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Sprout, Thermometer, Image } from "lucide-react";

interface GrowCardProps {
  id: string;
  name: string;
  stage: "seedling" | "vegetation" | "flowering" | "harvested";
  startDate: string;
  daysActive: number;
  plantCount: number;
  temperature: number;
  humidity: number;
  lastUpdated: string;
  progress: number;
  imageUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function GrowCard({
  id,
  name,
  stage,
  startDate,
  daysActive,
  plantCount,
  temperature,
  humidity,
  lastUpdated,
  progress,
  imageUrl,
  className,
  style,
}: GrowCardProps) {
  // Log the imageUrl prop
  console.log(`GrowCard ${id} (${name}) imageUrl:`, imageUrl);

  // Stage colors
  const stageColors = {
    seedling: "bg-blue-500",
    vegetation: "bg-grow-500",
    flowering: "bg-purple-500",
    harvested: "bg-amber-500",
  };
  
  // Stage labels
  const stageLabels = {
    seedling: "Seedling",
    vegetation: "Vegetation",
    flowering: "Flowering",
    harvested: "Harvested",
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link to={`/app/grows/${id}`}>
      <Card 
        className={cn(
          "overflow-hidden transition-all cursor-pointer card-hover",
          className
        )}
        style={style}
      >
        <div className="h-2 bg-muted">
          <div 
            className={cn("h-full", stageColors[stage])} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        {imageUrl ? (
          <div className="h-32 w-full overflow-hidden bg-muted">
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.error(`Failed to load image for ${name}:`, e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="h-32 w-full overflow-hidden bg-muted flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">{name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className={cn(
                  "tag",
                  stage === "seedling" ? "bg-blue-100 text-blue-800" : 
                  stage === "vegetation" ? "bg-green-100 text-grow-800" : 
                  stage === "flowering" ? "bg-purple-100 text-purple-800" : 
                  "bg-amber-100 text-amber-800"
                )}>
                  {stageLabels[stage]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {daysActive} days
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>{formatDate(startDate)}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Sprout className="h-3.5 w-3.5 mr-1" />
                <span>{plantCount} plants</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 py-2 mt-2 border-t">
            <div className="flex items-center">
              <Thermometer className="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-medium">{temperature}°C</span>
                  <span className="text-xs text-muted-foreground">/ {humidity}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Temperature / Humidity</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Updated</p>
              <p className="text-sm">{formatDate(lastUpdated)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default GrowCard;
