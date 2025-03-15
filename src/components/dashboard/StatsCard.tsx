
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
    text?: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  change,
  className,
}: StatsCardProps) {
  const trendIcon = {
    up: <ChevronUp className="h-4 w-4 text-grow-600" />,
    down: <ChevronDown className="h-4 w-4 text-red-600" />,
    neutral: <Minus className="h-4 w-4 text-muted-foreground" />,
  };
  
  const trendClass = {
    up: "text-grow-600",
    down: "text-red-600",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className={cn("transition-all hover:border-primary/20", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || change) && (
          <div className="mt-1 flex items-center text-xs">
            {change && (
              <div className="flex items-center mr-2">
                {trendIcon[change.trend]}
                <span className={trendClass[change.trend]}>
                  {Math.abs(change.value)}%
                </span>
              </div>
            )}
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
            {change && change.text && (
              <span className="text-muted-foreground">
                {change.text}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatsCard;
