/**
 * Environmental Data Seed Script
 * 
 * This script generates realistic environmental data for existing grows.
 * It creates temperature and humidity readings for each grow based on their
 * target ranges, with natural variations to simulate real-world conditions.
 * 
 * Usage:
 * 1. Make sure you have the required environment variables for Supabase
 * 2. Run with: npx tsx scripts/seed-environmental-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

type Grow = Database['public']['Tables']['grows']['Row'];
type EnvironmentalDataInsert = {
  grow_id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
  user_id: string;
};

// Configuration for data generation
const CONFIG = {
  // How many days of historical data to generate for each grow
  historyDays: 14,
  
  // How many readings per day (24 = hourly readings)
  readingsPerDay: 24,
  
  // Maximum random deviation from target values (in %)
  maxDeviation: 15,
  
  // Default values if targets aren't set
  defaults: {
    tempLow: 20,
    tempHigh: 26,
    humidityLow: 40,
    humidityHigh: 60
  },
  
  // Stage-specific adjustments
  stageAdjustments: {
    seedling: { tempOffset: 2, humidityOffset: 10 },    // Warmer and more humid
    vegetative: { tempOffset: 0, humidityOffset: 0 },   // Standard conditions
    flowering: { tempOffset: -2, humidityOffset: -10 }  // Cooler and less humid
  }
};

/**
 * Generate a random number within a range with normal distribution
 * (values cluster around the mean)
 */
function normalRandom(min: number, max: number): number {
  // Use Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  
  // Convert from standard normal to our range
  const mean = (min + max) / 2;
  const stdDev = (max - min) / 6; // 99.7% of values within range
  
  // Clamp the value to our range
  return Math.min(Math.max(z0 * stdDev + mean, min), max);
}

/**
 * Create daily patterns with realistic variations
 * (e.g., temperature peaks during the day, humidity increases at night)
 */
function getDailyPattern(hour: number, isTemperature: boolean): number {
  if (isTemperature) {
    // Temperature peaks in the afternoon (around 2-4pm)
    return Math.sin((hour - 2) * Math.PI / 24) * 1.5;
  } else {
    // Humidity is higher at night, lower during the day (inverse of temperature)
    return -Math.sin((hour - 2) * Math.PI / 24) * 2;
  }
}

/**
 * Generate synthetic environmental data for a grow
 */
function generateEnvironmentalData(
  grow: Grow,
  startDate: Date,
  endDate: Date
): EnvironmentalDataInsert[] {
  const data: EnvironmentalDataInsert[] = [];
  
  // Use grow's target values or defaults
  const tempLow = grow.target_temp_low || CONFIG.defaults.tempLow;
  const tempHigh = grow.target_temp_high || CONFIG.defaults.tempHigh;
  const humidityLow = grow.target_humidity_low || CONFIG.defaults.humidityLow;
  const humidityHigh = grow.target_humidity_high || CONFIG.defaults.humidityHigh;
  
  // Get stage adjustments
  const adjustments = CONFIG.stageAdjustments[grow.stage as keyof typeof CONFIG.stageAdjustments] || 
                     { tempOffset: 0, humidityOffset: 0 };
  
  // Generate hourly readings between start and end dates
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const hour = currentDate.getHours();
    
    // Calculate base values (middle of the target range)
    const baseTemp = (tempLow + tempHigh) / 2 + adjustments.tempOffset;
    const baseHumidity = (humidityLow + humidityHigh) / 2 + adjustments.humidityOffset;
    
    // Add daily patterns
    const tempPattern = getDailyPattern(hour, true);
    const humidityPattern = getDailyPattern(hour, false);
    
    // Calculate range for random variations
    const tempRange = (tempHigh - tempLow) * (CONFIG.maxDeviation / 100);
    const humidityRange = (humidityHigh - humidityLow) * (CONFIG.maxDeviation / 100);
    
    // Generate reading with daily pattern and random variation
    const temperature = baseTemp + tempPattern + normalRandom(-tempRange, tempRange);
    const humidity = baseHumidity + humidityPattern + normalRandom(-humidityRange, humidityRange);
    
    // Create the data point
    data.push({
      grow_id: grow.id,
      temperature: Number(temperature.toFixed(1)),
      humidity: Number(humidity.toFixed(1)),
      timestamp: currentDate.toISOString(),
      user_id: grow.user_id
    });
    
    // Advance to the next interval
    currentDate.setTime(currentDate.getTime() + (24 / CONFIG.readingsPerDay) * 60 * 60 * 1000);
  }
  
  return data;
}

/**
 * Main function to seed environmental data
 */
async function seedEnvironmentalData() {
  try {
    console.log('Starting environmental data seeding...');
    
    // Fetch all grows from the database
    const { data: grows, error: growsError } = await supabase
      .from('grows')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (growsError) {
      throw new Error(`Error fetching grows: ${growsError.message}`);
    }
    
    if (!grows || grows.length === 0) {
      console.log('No grows found to seed environmental data for.');
      return;
    }
    
    console.log(`Found ${grows.length} grows. Generating environmental data...`);
    
    // Process each grow
    for (const grow of grows) {
      // Calculate date range for generating data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - CONFIG.historyDays);
      
      // Generate data for this grow
      const environmentalData = generateEnvironmentalData(grow, startDate, endDate);
      
      console.log(`Generated ${environmentalData.length} readings for grow "${grow.name}"`);
      
      // Insert data in batches to avoid hitting request size limits
      const batchSize = 100;
      for (let i = 0; i < environmentalData.length; i += batchSize) {
        const batch = environmentalData.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('environmental_data')
          .insert(batch);
        
        if (error) {
          console.error(`Error inserting batch for grow ${grow.name}:`, error);
          continue;
        }
        
        console.log(`Inserted ${batch.length} readings for grow "${grow.name}" (batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(environmentalData.length/batchSize)})`);
      }
    }
    
    console.log('Environmental data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding environmental data:', error);
  }
}

// Run the seed function
seedEnvironmentalData(); 