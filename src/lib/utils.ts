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

/**
 * Convert data to CSV format and trigger download
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV string
  const csvRows = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle special cases
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return value;
      }).join(',')
    )
  ];
  
  const csvString = csvRows.join('\n');
  
  // Create blob and download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Format date for export filenames
 */
export function getExportFilename(base: string): string {
  const date = new Date();
  const timestamp = date.toISOString().split('T')[0];
  return `${base}_${timestamp}.csv`;
}
