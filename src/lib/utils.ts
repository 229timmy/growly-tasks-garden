import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate the overall progress of a grow based on its start date
 * Uses the cannabis growth timeline:
 * - Seedling: 0-3 weeks (21 days)
 * - Vegetative: 3-11 weeks (21-77 days)
 * - Pre-Flowering: 11-13 weeks (77-91 days)
 * - Flowering: 13+ weeks (91+ days)
 * 
 * @param startDate The start date of the grow
 * @returns A number between 0 and 100 representing the overall progress
 */
export function calculateGrowProgress(startDate: string): number {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Define growth stage thresholds in days
  const seedlingEnd = 21; // 3 weeks
  const vegetativeEnd = seedlingEnd + 56; // 3 weeks + 8 weeks
  const preFloweringEnd = vegetativeEnd + 14; // + 2 weeks
  const floweringEnd = preFloweringEnd + 56; // + 8 weeks
  
  // Total expected grow duration
  const totalDuration = floweringEnd; // 147 days (21 weeks)
  
  // Calculate overall progress
  const progress = Math.min(100, (daysSinceStart / totalDuration) * 100);
  
  return progress;
}
