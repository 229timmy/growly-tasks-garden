import { supabase } from '@/lib/supabase';

export interface EnvironmentalData {
  date: string;
  temperature: number;
  humidity: number;
  lightIntensity?: number;
  co2Level?: number;
  vpd?: number;
}

export interface EnvironmentalStats {
  averageTemperature: number;
  averageHumidity: number;
  optimalConditionsPercentage: number;
  stressEvents: number;
  averageLightIntensity?: number;
  averageCO2?: number;
  averageVPD?: number;
  totalReadings: number;
}

export interface EnvironmentalImpact {
  correlations: {
    temperatureGrowth: number;
    humidityGrowth: number;
    lightGrowth?: number;
    co2Growth?: number;
    vpdGrowth?: number;
  };
  optimalRanges: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    lightIntensity?: { min: number; max: number };
    co2?: { min: number; max: number };
    vpd?: { min: number; max: number };
  };
}

export class EnvironmentalAnalyticsService {
  async getEnvironmentalData(growId?: string, timeRange?: { from: Date; to: Date }) {
    let query = supabase
      .from('environmental_data')
      .select(`
        *,
        grows!inner(id, name)
      `)
      .order('timestamp', { ascending: true });

    if (growId) {
      query = query.eq('grow_id', growId);
    }

    if (timeRange) {
      query = query
        .gte('timestamp', timeRange.from.toISOString())
        .lte('timestamp', timeRange.to.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(record => ({
      date: record.timestamp,
      temperature: record.temperature,
      humidity: record.humidity,
      lightIntensity: record.light_intensity,
      co2Level: record.co2_level,
      vpd: record.vpd
    }));
  }

  async getEnvironmentalStats(growId?: string): Promise<EnvironmentalStats> {
    const { data, error } = await supabase
      .from('environmental_data')
      .select('*')
      .eq(growId ? 'grow_id' : 'timestamp', growId || new Date().toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        averageTemperature: 0,
        averageHumidity: 0,
        optimalConditionsPercentage: 0,
        stressEvents: 0,
        totalReadings: 0
      };
    }

    const stats = data.reduce(
      (acc, record) => {
        acc.tempSum += record.temperature;
        acc.humiditySum += record.humidity;
        acc.lightSum += record.light_intensity || 0;
        acc.co2Sum += record.co2_level || 0;
        acc.vpdSum += record.vpd || 0;
        acc.count += 1;

        // Count stress events (temperature or humidity outside optimal range)
        if (record.temperature < 20 || record.temperature > 30 ||
            record.humidity < 40 || record.humidity > 70) {
          acc.stressEvents += 1;
        }

        // Count optimal conditions
        if (record.temperature >= 22 && record.temperature <= 28 &&
            record.humidity >= 45 && record.humidity <= 65) {
          acc.optimalCount += 1;
        }

        return acc;
      },
      { tempSum: 0, humiditySum: 0, lightSum: 0, co2Sum: 0, vpdSum: 0, count: 0, stressEvents: 0, optimalCount: 0 }
    );

    return {
      averageTemperature: stats.tempSum / stats.count,
      averageHumidity: stats.humiditySum / stats.count,
      optimalConditionsPercentage: (stats.optimalCount / stats.count) * 100,
      stressEvents: stats.stressEvents,
      averageLightIntensity: stats.lightSum / stats.count || undefined,
      averageCO2: stats.co2Sum / stats.count || undefined,
      averageVPD: stats.vpdSum / stats.count || undefined,
      totalReadings: stats.count
    };
  }

  async getEnvironmentalImpact(growId?: string): Promise<EnvironmentalImpact> {
    // Fetch both environmental data and plant measurements
    const [envData, measurements] = await Promise.all([
      supabase
        .from('environmental_data')
        .select('*')
        .eq(growId ? 'grow_id' : 'timestamp', growId || new Date().toISOString()),
      supabase
        .from('plant_measurements')
        .select('*')
        .eq(growId ? 'grow_id' : 'measured_at', growId || new Date().toISOString())
    ]);

    if (envData.error || measurements.error) {
      throw envData.error || measurements.error;
    }

    // Calculate correlations between environmental factors and growth
    const correlations = this.calculateCorrelations(envData.data, measurements.data);

    // Determine optimal ranges based on best growth periods
    const optimalRanges = this.determineOptimalRanges(envData.data, measurements.data);

    return {
      correlations,
      optimalRanges
    };
  }

  private calculateCorrelations(envData: any[], measurements: any[]) {
    // Simple correlation calculation between environmental factors and growth rate
    const correlations = {
      temperatureGrowth: 0,
      humidityGrowth: 0,
      lightGrowth: undefined as number | undefined,
      co2Growth: undefined as number | undefined,
      vpdGrowth: undefined as number | undefined
    };

    if (envData.length === 0 || measurements.length === 0) {
      return correlations;
    }

    // Calculate correlations using a simple moving average approach
    measurements.forEach((measurement, index) => {
      if (index === 0) return;

      const prevMeasurement = measurements[index - 1];
      const growthRate = measurement.growth_rate;

      if (growthRate) {
        const envConditions = envData.find(e => 
          new Date(e.timestamp).getTime() <= new Date(measurement.measured_at).getTime()
        );

        if (envConditions) {
          correlations.temperatureGrowth += (envConditions.temperature * growthRate);
          correlations.humidityGrowth += (envConditions.humidity * growthRate);
          
          if (envConditions.light_intensity) {
            correlations.lightGrowth = (correlations.lightGrowth || 0) + 
              (envConditions.light_intensity * growthRate);
          }
          
          if (envConditions.co2_level) {
            correlations.co2Growth = (correlations.co2Growth || 0) + 
              (envConditions.co2_level * growthRate);
          }
          
          if (envConditions.vpd) {
            correlations.vpdGrowth = (correlations.vpdGrowth || 0) + 
              (envConditions.vpd * growthRate);
          }
        }
      }
    });

    // Normalize correlations
    const total = measurements.length - 1;
    correlations.temperatureGrowth /= total;
    correlations.humidityGrowth /= total;
    if (correlations.lightGrowth) correlations.lightGrowth /= total;
    if (correlations.co2Growth) correlations.co2Growth /= total;
    if (correlations.vpdGrowth) correlations.vpdGrowth /= total;

    return correlations;
  }

  private determineOptimalRanges(envData: any[], measurements: any[]) {
    // Find environmental conditions during periods of best growth
    const optimalRanges = {
      temperature: { min: 20, max: 30 },
      humidity: { min: 40, max: 70 },
      lightIntensity: undefined as { min: number; max: number } | undefined,
      co2: undefined as { min: number; max: number } | undefined,
      vpd: undefined as { min: number; max: number } | undefined
    };

    if (envData.length === 0 || measurements.length === 0) {
      return optimalRanges;
    }

    // Get periods of highest growth rate
    const sortedMeasurements = [...measurements]
      .sort((a, b) => (b.growth_rate || 0) - (a.growth_rate || 0))
      .slice(0, Math.ceil(measurements.length * 0.2)); // Top 20%

    // Find environmental conditions during these periods
    const optimalConditions = sortedMeasurements.map(measurement => {
      return envData.find(e => 
        new Date(e.timestamp).getTime() <= new Date(measurement.measured_at).getTime()
      );
    }).filter(Boolean);

    if (optimalConditions.length > 0) {
      // Calculate ranges from optimal conditions
      optimalRanges.temperature = {
        min: Math.min(...optimalConditions.map(c => c.temperature)),
        max: Math.max(...optimalConditions.map(c => c.temperature))
      };

      optimalRanges.humidity = {
        min: Math.min(...optimalConditions.map(c => c.humidity)),
        max: Math.max(...optimalConditions.map(c => c.humidity))
      };

      // Calculate optional ranges if data exists
      const lightValues = optimalConditions.map(c => c.light_intensity).filter(Boolean);
      if (lightValues.length > 0) {
        optimalRanges.lightIntensity = {
          min: Math.min(...lightValues),
          max: Math.max(...lightValues)
        };
      }

      const co2Values = optimalConditions.map(c => c.co2_level).filter(Boolean);
      if (co2Values.length > 0) {
        optimalRanges.co2 = {
          min: Math.min(...co2Values),
          max: Math.max(...co2Values)
        };
      }

      const vpdValues = optimalConditions.map(c => c.vpd).filter(Boolean);
      if (vpdValues.length > 0) {
        optimalRanges.vpd = {
          min: Math.min(...vpdValues),
          max: Math.max(...vpdValues)
        };
      }
    }

    return optimalRanges;
  }
} 