import { supabase } from '@/lib/supabase';

export interface GrowthData {
  date: string;
  growId: string;
  growName: string;
  height: number;
  leafCount: number;
  healthScore: number;
  growthRate: number;
}

interface MeasurementData {
  heights: number[];
  leafCounts: number[];
  healthScores: number[];
  growName: string;
}

interface MeasurementsByDate {
  [date: string]: MeasurementData;
}

interface MeasurementsByGrow {
  [growId: string]: MeasurementsByDate;
}

export class GrowthAnalyticsService {
  async getGrowthAnalytics() {
    const { data: measurements, error } = await supabase
      .from('plant_measurements')
      .select(`
        *,
        plants!inner(
          id,
          name,
          grow_id,
          grows(
            id,
            name
          )
        )
      `)
      .order('measured_at', { ascending: true });

    if (error) {
      throw error;
    }

    const measurementsByGrowAndDate: MeasurementsByGrow = {};

    // Group measurements by grow and date
    measurements.forEach((m) => {
      const growId = m.plants.grow_id;
      const date = m.measured_at.split('T')[0];
      const growName = m.plants.grows.name;

      if (!measurementsByGrowAndDate[growId]) {
        measurementsByGrowAndDate[growId] = {};
      }

      if (!measurementsByGrowAndDate[growId][date]) {
        measurementsByGrowAndDate[growId][date] = {
          heights: [],
          leafCounts: [],
          healthScores: [],
          growName: m.plants.grows.name
        };
      }

      measurementsByGrowAndDate[growId][date].heights.push(m.height_cm);
      measurementsByGrowAndDate[growId][date].leafCounts.push(m.leaf_count || 0);
      measurementsByGrowAndDate[growId][date].healthScores.push(m.health_score || 0);
    });

    // Now convert to the final format with averages and growth rates
    const growthByGrow: { [growId: string]: GrowthData[] } = {};
    
    Object.entries(measurementsByGrowAndDate).forEach(([growId, dateData]) => {
      const sortedDates = Object.keys(dateData).sort();
      let prevHeight: number | null = null;
      let prevDate: Date | null = null;

      growthByGrow[growId] = sortedDates.map((date) => {
        const measurements = dateData[date];
        const avgHeight = measurements.heights.reduce((sum, h) => sum + h, 0) / measurements.heights.length;
        const avgLeafCount = measurements.leafCounts.reduce((sum, c) => sum + c, 0) / measurements.leafCounts.length;
        const avgHealthScore = measurements.healthScores.reduce((sum, s) => sum + s, 0) / measurements.healthScores.length;

        const currentDate = new Date(date);
        let growthRate = 0;

        if (prevHeight !== null && prevDate !== null) {
          const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          growthRate = daysDiff > 0 ? (avgHeight - prevHeight) / daysDiff : 0;
        }

        prevHeight = avgHeight;
        prevDate = currentDate;

        return {
          date: `${date}T00:00:00Z`,
          growId,
          growName: measurements.growName,
          height: avgHeight,
          leafCount: Math.round(avgLeafCount),
          healthScore: Math.round(avgHealthScore * 100) / 100,
          growthRate: Math.round(growthRate * 100) / 100
        };
      });
    });

    return growthByGrow;
  }

  async getGrowthStats() {
    const { data: measurements, error } = await supabase
      .from('plant_measurements')
      .select(`
        *,
        plants!inner(
          grow_id,
          grows(name)
        )
      `);

    if (error) {
      throw error;
    }

    // Group stats by grow
    const statsByGrow: { 
      [growId: string]: {
        growId: string;
        growName: string;
        averageGrowthRate: number;
        averageHealthScore: number;
        totalMeasurements: number;
        healthyPlantsPercentage: number;
      }
    } = {};

    // Process measurements by grow
    measurements.forEach((measurement) => {
      const growId = measurement.plants.grow_id;
      const growName = measurement.plants.grows.name;

      if (!statsByGrow[growId]) {
        statsByGrow[growId] = {
          growId,
          growName,
          averageGrowthRate: 0,
          averageHealthScore: 0,
          totalMeasurements: 0,
          healthyPlantsPercentage: 0,
        };
      }

      statsByGrow[growId].totalMeasurements++;
      statsByGrow[growId].averageHealthScore += measurement.health_score || 0;
    });

    // Calculate averages and percentages
    Object.values(statsByGrow).forEach(stats => {
      if (stats.totalMeasurements > 0) {
        stats.averageHealthScore /= stats.totalMeasurements;
        stats.healthyPlantsPercentage = 
          (measurements
            .filter(m => m.plants.grow_id === stats.growId && (m.health_score || 0) >= 7)
            .length / stats.totalMeasurements) * 100;
      }
    });

    return statsByGrow;
  }
} 