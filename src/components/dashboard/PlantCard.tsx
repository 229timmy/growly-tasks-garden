import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sprout, Droplets, Ruler } from "lucide-react";

interface PlantCardProps {
  id: string;
  name: string;
  strain: string;
  age: number;
  growName: string;
  growId: string;
  health: "good" | "average" | "poor";
  imageUrl?: string;
  height?: number;
  lastWatered: string;
  className?: string;
}

export function PlantCard({
  id,
  name,
  strain,
  age,
  growName,
  growId,
  health,
  imageUrl,
  height,
  lastWatered,
  className,
}: PlantCardProps) {
  const navigate = useNavigate();
  
  // Health indicator colors
  const healthColors = {
    good: "bg-grow-500",
    average: "bg-amber-500",
    poor: "bg-red-500",
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleGrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/app/grows/${growId}`);
  };

  const handleCardClick = () => {
    navigate(`/app/plants/${id}`);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="relative h-40 bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/5 to-primary/10">
            <Sprout className="w-12 h-12 text-primary/40" />
          </div>
        )}
        <div
          className={cn(
            "absolute top-3 right-3 w-2 h-2 rounded-full ring-2 ring-background",
            healthColors[health]
          )}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-background/0 backdrop-blur-[2px] p-3">
          <p className="text-sm font-medium truncate">{strain}</p>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-base mb-1">{name}</h3>
            <button 
              onClick={handleGrowClick}
              className="text-xs text-primary hover:underline"
            >
              {growName}
            </button>
          </div>
          <Badge variant="secondary" className="text-xs">
            {age}d
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {height && (
            <div className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm">{height}cm</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm">{formatDate(lastWatered)}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                health === "good" ? "bg-grow-500" :
                health === "average" ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${(age / 120) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">Growth</span>
            <span className="text-xs font-medium">{Math.min(Math.round((age / 120) * 100), 100)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PlantCard;
