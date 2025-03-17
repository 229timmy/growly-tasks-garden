import { supabase } from '@/lib/supabase';

export interface GrowthData {
  date: string;
  height: number;
  leafCount: number;
  healthScore: number;
  growthRate: number;
}

export class GrowthAnalyticsService {
  async getGrowthAnalytics() {
    const { data: measurements, error } = await supabase
      .from('plant_measurements')
      .select(`
        *,
        plants(name)
      `)
      .order('measured_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Process measurements into growth data
    const growthData: GrowthData[] = [];
    let prevHeight: { [key: string]: number } = {};
    let prevDate: { [key: string]: Date } = {};

    measurements.forEach((measurement) => {
      const plantId = measurement.plant_id;
      const currentHeight = measurement.height_cm;
      const currentDate = new Date(measurement.measured_at);
      
      // Calculate growth rate if we have previous measurements
      let growthRate = 0;
      if (prevHeight[plantId] && prevDate[plantId]) {
        const daysDiff = (currentDate.getTime() - prevDate[plantId].getTime()) / (1000 * 60 * 60 * 24);
        growthRate = daysDiff > 0 ? (currentHeight - prevHeight[plantId]) / daysDiff : 0;
      }

      growthData.push({
        date: measurement.measured_at,
        height: currentHeight,
        leafCount: measurement.leaf_count || 0,
        healthScore: measurement.health_score || 0,
        growthRate,
      });

      prevHeight[plantId] = currentHeight;
      prevDate[plantId] = currentDate;
    });

    return growthData;
  }

  async getGrowthStats() {
    const { data: measurements, error } = await supabase
      .from('plant_measurements')
      .select('*');

    if (error) {
      throw error;
    }

    const stats = {
      averageGrowthRate: 0,
      averageHealthScore: 0,
      totalMeasurements: measurements.length,
      healthyPlantsPercentage: 0,
    };

    if (measurements.length > 0) {
      const healthScores = measurements.map(m => m.health_score || 0);
      stats.averageHealthScore = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
      stats.healthyPlantsPercentage = (healthScores.filter(score => score >= 4).length / healthScores.length) * 100;
    }

    return stats;
  }
} 