export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          description: string | null
          timestamp: string
          related_task_id: string | null
          related_grow_id: string | null
          related_plant_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          description?: string | null
          timestamp?: string
          related_task_id?: string | null
          related_grow_id?: string | null
          related_plant_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          description?: string | null
          timestamp?: string
          related_task_id?: string | null
          related_grow_id?: string | null
          related_plant_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      grows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          stage: 'planning' | 'germination' | 'vegetation' | 'flowering' | 'harvesting' | 'curing' | 'completed'
          start_date: string | null
          end_date: string | null
          plant_count: number
          growing_medium: 'soil' | 'coco' | 'hydro' | 'aero' | 'other'
          environment: 'indoor' | 'outdoor' | 'greenhouse'
          strains: string[]
          target_temp_low: number | null
          target_temp_high: number | null
          target_humidity_low: number | null
          target_humidity_high: number | null
          light_schedule: string | null
          nutrients: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          stage?: 'planning' | 'germination' | 'vegetation' | 'flowering' | 'harvesting' | 'curing' | 'completed'
          start_date?: string | null
          end_date?: string | null
          plant_count?: number
          growing_medium?: 'soil' | 'coco' | 'hydro' | 'aero' | 'other'
          environment?: 'indoor' | 'outdoor' | 'greenhouse'
          strains?: string[]
          target_temp_low?: number | null
          target_temp_high?: number | null
          target_humidity_low?: number | null
          target_humidity_high?: number | null
          light_schedule?: string | null
          nutrients?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          stage?: 'planning' | 'germination' | 'vegetation' | 'flowering' | 'harvesting' | 'curing' | 'completed'
          start_date?: string | null
          end_date?: string | null
          plant_count?: number
          growing_medium?: 'soil' | 'coco' | 'hydro' | 'aero' | 'other'
          environment?: 'indoor' | 'outdoor' | 'greenhouse'
          strains?: string[]
          target_temp_low?: number | null
          target_temp_high?: number | null
          target_humidity_low?: number | null
          target_humidity_high?: number | null
          light_schedule?: string | null
          nutrients?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      plants: {
        Row: {
          id: string
          user_id: string
          grow_id: string
          name: string | null
          strain: string | null
          height: number | null
          last_watered: string | null
          last_photo_url: string | null
          photo_count: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          grow_id: string
          name?: string | null
          strain?: string | null
          height?: number | null
          last_watered?: string | null
          last_photo_url?: string | null
          photo_count?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          grow_id?: string
          name?: string | null
          strain?: string | null
          height?: number | null
          last_watered?: string | null
          last_photo_url?: string | null
          photo_count?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plant_photos: {
        Row: {
          id: string
          plant_id: string
          file_name: string
          content_type: string
          size: number
          url: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          plant_id: string
          file_name: string
          content_type: string
          size: number
          url: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          plant_id?: string
          file_name?: string
          content_type?: string
          size?: number
          url?: string
          user_id?: string
          created_at?: string
        }
      }
      plant_measurements: {
        Row: {
          id: string
          plant_id: string
          height: number | null
          ph_level: number | null
          notes: string | null
          measured_at: string
          user_id: string
          created_at: string
          health_score: number | null
          leaf_count: number | null
          growth_rate: number | null
        }
        Insert: {
          id?: string
          plant_id: string
          height?: number | null
          ph_level?: number | null
          notes?: string | null
          measured_at?: string
          user_id: string
          created_at?: string
          health_score?: number | null
          leaf_count?: number | null
          growth_rate?: number | null
        }
        Update: {
          id?: string
          plant_id?: string
          height?: number | null
          ph_level?: number | null
          notes?: string | null
          measured_at?: string
          user_id?: string
          created_at?: string
          health_score?: number | null
          leaf_count?: number | null
          growth_rate?: number | null
        }
      }
      plant_care_activities: {
        Row: {
          id: string
          plant_id: string | null
          grow_id: string
          activity_type: 'watering' | 'feeding' | 'top_dressing' | 'other'
          amount: number | null
          unit: string | null
          product_name: string | null
          notes: string | null
          performed_at: string
          user_id: string
          created_at: string
          days_since_last_watering: number | null
          days_since_last_feeding: number | null
          moisture_level: number | null
          nutrient_level: number | null
          health_score: number | null
          growth_rate: number | null
        }
        Insert: {
          id?: string
          plant_id?: string | null
          grow_id: string
          activity_type: 'watering' | 'feeding' | 'top_dressing' | 'other'
          amount?: number | null
          unit?: string | null
          product_name?: string | null
          notes?: string | null
          performed_at?: string
          user_id: string
          created_at?: string
          days_since_last_watering?: number | null
          days_since_last_feeding?: number | null
          moisture_level?: number | null
          nutrient_level?: number | null
          health_score?: number | null
          growth_rate?: number | null
        }
        Update: {
          id?: string
          plant_id?: string | null
          grow_id?: string
          activity_type?: 'watering' | 'feeding' | 'top_dressing' | 'other'
          amount?: number | null
          unit?: string | null
          product_name?: string | null
          notes?: string | null
          performed_at?: string
          user_id?: string
          created_at?: string
          days_since_last_watering?: number | null
          days_since_last_feeding?: number | null
          moisture_level?: number | null
          nutrient_level?: number | null
          health_score?: number | null
          growth_rate?: number | null
        }
      }
      environmental_data: {
        Row: {
          id: string
          grow_id: string
          temperature: number
          humidity: number
          timestamp: string
          user_id: string
          created_at: string
          light_intensity: number | null
          co2_level: number | null
          vpd: number | null
        }
        Insert: {
          id?: string
          grow_id: string
          temperature: number
          humidity: number
          timestamp?: string
          user_id: string
          created_at?: string
          light_intensity?: number | null
          co2_level?: number | null
          vpd?: number | null
        }
        Update: {
          id?: string
          grow_id?: string
          temperature?: number
          humidity?: number
          timestamp?: string
          user_id?: string
          created_at?: string
          light_intensity?: number | null
          co2_level?: number | null
          vpd?: number | null
        }
      }
      harvest_records: {
        Row: {
          id: string
          grow_id: string
          harvest_date: string
          total_yield_grams: number | null
          yield_per_plant: number | null
          thc_percentage: number | null
          cbd_percentage: number | null
          grow_duration_days: number | null
          cure_time_days: number | null
          bud_density_rating: number | null
          aroma_intensity_rating: number | null
          aroma_profile: string[]
          primary_color: string | null
          secondary_color: string | null
          trichome_coverage_rating: number | null
          overall_quality_rating: number | null
          flavor_notes: string | null
          effect_notes: string | null
          special_characteristics: string | null
          improvement_notes: string | null
          user_id: string
          created_at: string
          updated_at: string
          efficiency_score: number | null
          resource_usage: Json | null
          environmental_factors: Json | null
        }
        Insert: {
          id?: string
          grow_id: string
          harvest_date: string
          total_yield_grams?: number | null
          yield_per_plant?: number | null
          thc_percentage?: number | null
          cbd_percentage?: number | null
          grow_duration_days?: number | null
          cure_time_days?: number | null
          bud_density_rating?: number | null
          aroma_intensity_rating?: number | null
          aroma_profile?: string[]
          primary_color?: string | null
          secondary_color?: string | null
          trichome_coverage_rating?: number | null
          overall_quality_rating?: number | null
          flavor_notes?: string | null
          effect_notes?: string | null
          special_characteristics?: string | null
          improvement_notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
          efficiency_score?: number | null
          resource_usage?: Json | null
          environmental_factors?: Json | null
        }
        Update: {
          id?: string
          grow_id?: string
          harvest_date?: string
          total_yield_grams?: number | null
          yield_per_plant?: number | null
          thc_percentage?: number | null
          cbd_percentage?: number | null
          grow_duration_days?: number | null
          cure_time_days?: number | null
          bud_density_rating?: number | null
          aroma_intensity_rating?: number | null
          aroma_profile?: string[]
          primary_color?: string | null
          secondary_color?: string | null
          trichome_coverage_rating?: number | null
          overall_quality_rating?: number | null
          flavor_notes?: string | null
          effect_notes?: string | null
          special_characteristics?: string | null
          improvement_notes?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          efficiency_score?: number | null
          resource_usage?: Json | null
          environmental_factors?: Json | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          link: string | null
          read: boolean
          created_at: string
          expires_at: string | null
          metadata: Json | null
          priority: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          link?: string | null
          read?: boolean
          created_at?: string
          expires_at?: string | null
          metadata?: Json | null
          priority?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          created_at?: string
          expires_at?: string | null
          metadata?: Json | null
          priority?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          user_id: string
          user_email: string
          subject: string
          message: string
          priority: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          subject: string
          message: string
          priority: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          subject?: string
          message?: string
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          tier: 'free' | 'premium' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          stripe_price_id: string
          max_grows: number
          max_plants_per_grow: number
          features: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          stripe_price_id: string
          max_grows: number
          max_plants_per_grow: number
          features?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          stripe_price_id?: string
          max_grows?: number
          max_plants_per_grow?: number
          features?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      user_tier: 'free' | 'premium' | 'enterprise'
      grow_stage: 'planning' | 'germination' | 'vegetation' | 'flowering' | 'harvesting' | 'curing' | 'completed'
      plant_care_activity_type: 'watering' | 'feeding' | 'top_dressing' | 'other'
      growing_medium: 'soil' | 'coco' | 'hydro' | 'aero' | 'other'
      environment_type: 'indoor' | 'outdoor' | 'greenhouse'
    }
  }
} 