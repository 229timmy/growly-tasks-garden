
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  // Health indicator colors
  const healthColors = {
    good: "bg-grow-500",
    average: "bg-amber-500",
    poor: "bg-red-500",
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link to={`/plants/${id}`}>
      <Card
        className={cn(
          "overflow-hidden transition-all cursor-pointer card-hover h-full",
          className
        )}
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
            <div className="flex items-center justify-center h-full">
              <svg
                className="w-12 h-12 text-muted-foreground/50"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 18.5C12 18.5 17 13.5 17 8.5C17 4.63 14.5 2 12 2C9.5 2 7 4.63 7 8.5C7 13.5 12 18.5 12 18.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22V18.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 7.5H14.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 5V10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
          <div
            className={cn(
              "absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white",
              healthColors[health]
            )}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white py-1.5 px-3">
            <p className="text-sm font-medium truncate">{strain}</p>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-base mb-0.5">{name}</h3>
              <Link 
                to={`/grows/${growId}`}
                className="text-xs text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {growName}
              </Link>
            </div>
            <span className="tag bg-secondary text-secondary-foreground">
              {age} days
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
            {height && (
              <div>
                <p className="text-xs text-muted-foreground">Height</p>
                <p className="font-medium">{height} cm</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Last Watered</p>
              <p className="font-medium">{formatDate(lastWatered)}</p>
            </div>
            <div className="col-span-2 mt-1">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-grow-500 rounded-full"
                  style={{ width: `${(age / 120) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">Growth Progress</span>
                <span className="text-xs font-medium">{Math.round((age / 120) * 100)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default PlantCard;
