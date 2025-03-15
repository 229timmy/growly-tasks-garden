import React from "react";
import { Clock, Sprout } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  relatedTo?: {
    type: "grow" | "plant";
    name: string;
    id: string;
  };
  onToggle: (id: string, completed: boolean) => void;
  className?: string;
}

export function TaskItem({
  id,
  title,
  description,
  dueDate,
  priority,
  isCompleted,
  relatedTo,
  onToggle,
  className,
}: TaskItemProps) {
  // Priority classes
  const priorityClasses = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-amber-100 text-amber-800",
    high: "bg-red-100 text-red-800",
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueDate = new Date(dateString);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return dueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };
  
  // Check if task is overdue
  const isOverdue = () => {
    const today = new Date();
    const due = new Date(dueDate);
    return !isCompleted && due < today;
  };
  
  return (
    <div 
      className={cn(
        "flex items-start p-4 rounded-lg border transition-all",
        isCompleted ? "bg-muted/50" : "bg-card hover:shadow-subtle",
        isOverdue() && "border-red-200 bg-red-50/50",
        className
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) => onToggle(id, checked as boolean)}
        className={cn(
          "mt-1 mr-3",
          isCompleted ? "" : "border-2"
        )}
      />
      
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-medium text-base mb-1",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {title}
        </h4>
        
        {description && (
          <p className={cn(
            "text-sm text-muted-foreground mb-2",
            isCompleted && "line-through"
          )}>
            {description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span className={cn(
              "text-xs",
              isOverdue() ? "text-red-500 font-medium" : "text-muted-foreground"
            )}>
              {formatDate(dueDate)}
            </span>
          </div>
          
          <span className={cn(
            "tag",
            priorityClasses[priority]
          )}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
          
          {relatedTo && (
            <span className="inline-flex items-center gap-1">
              {relatedTo.type === "grow" ? (
                <svg className="h-3.5 w-3.5 text-grow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 15.31 7.58 20 12 22C16.42 20 20 15.31 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <Sprout className="h-3.5 w-3.5 text-grow-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {relatedTo.name}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 