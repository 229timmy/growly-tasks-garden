
import React from "react";
import { Clock, Droplet, Plant } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  type: "water" | "feed" | "trim" | "other";
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
  type,
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
  
  // Task type icons
  const taskTypeIcon = {
    water: <Droplet className="h-4 w-4 text-blue-500" />,
    feed: <svg className="h-4 w-4 text-grow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 10L6.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.5 10L17.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>,
    trim: <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 22L15 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 12L18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 12L6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 5C3 3.34315 4.34315 2 6 2H18C19.6569 2 21 3.34315 21 5C21 6.65685 19.6569 8 18 8H6C4.34315 8 3 6.65685 3 5Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>,
    other: <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V16.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>,
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
          
          <span className="inline-flex items-center gap-1">
            {taskTypeIcon[type]}
            <span className="text-xs text-muted-foreground">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </span>
          
          {relatedTo && (
            <span className="inline-flex items-center gap-1">
              {relatedTo.type === "grow" ? (
                <svg className="h-3.5 w-3.5 text-grow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 15.31 7.58 20 12 22C16.42 20 20 15.31 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <Plant className="h-3.5 w-3.5 text-grow-500" />
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

export default TaskItem;
