import { supabase } from '@/lib/supabase';

export class HarvestAnalyticsService {
  async getHarvestAnalytics() {
    const { data: records, error } = await supabase
      .from('harvest_records')
      .select('*')
      .order('harvest_date', { ascending: true });

    if (error) {
      throw error;
    }

    return records.map((record) => ({
      date: record.harvest_date,
      totalYield: record.total_yield_grams,
      quality: record.quality_rating,
      thcPercentage: record.thc_percentage,
      budDensity: record.bud_density_rating * 20, // Convert 0-5 rating to 0-100 scale
    }));
  }

  async getHarvestTrends() {
    const { data: records, error } = await supabase
      .from('harvest_records')
      .select('*')
      .order('harvest_date', { ascending: true });

    if (error) {
      throw error;
    }

    // Calculate trends
    const trends = {
      yieldTrend: 0,
      qualityTrend: 0,
      thcTrend: 0,
      densityTrend: 0,
    };

    if (records.length >= 2) {
      const last = records[records.length - 1];
      const prev = records[records.length - 2];

      trends.yieldTrend = ((last.total_yield_grams - prev.total_yield_grams) / prev.total_yield_grams) * 100;
      trends.qualityTrend = ((last.quality_rating - prev.quality_rating) / prev.quality_rating) * 100;
      
      if (last.thc_percentage && prev.thc_percentage) {
        trends.thcTrend = ((last.thc_percentage - prev.thc_percentage) / prev.thc_percentage) * 100;
      }
      
      if (last.bud_density_rating && prev.bud_density_rating) {
        trends.densityTrend = ((last.bud_density_rating - prev.bud_density_rating) / prev.bud_density_rating) * 100;
      }
    }

    return trends;
  }
} 