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
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          completed: boolean
          priority: string
          grow_id: string | null
          plant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          due_date?: string | null
          completed?: boolean
          priority?: string
          grow_id?: string | null
          plant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          completed?: boolean
          priority?: string
          grow_id?: string | null
          plant_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      grows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: string
          stage: 'seedling' | 'vegetative' | 'flowering' | 'harvesting'
          start_date: string
          end_date: string | null
          target_temperature: number | null
          target_humidity: number | null
          target_soil_moisture: number | null
          target_light_intensity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: string
          stage?: 'seedling' | 'vegetative' | 'flowering' | 'harvesting'
          start_date?: string
          end_date?: string | null
          target_temperature?: number | null
          target_humidity?: number | null
          target_soil_moisture?: number | null
          target_light_intensity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: string
          stage?: 'seedling' | 'vegetative' | 'flowering' | 'harvesting'
          start_date?: string
          end_date?: string | null
          target_temperature?: number | null
          target_humidity?: number | null
          target_soil_moisture?: number | null
          target_light_intensity?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      plants: {
        Row: {
          id: string
          user_id: string
          grow_id: string
          name: string
          species: string | null
          strain: string | null
          status: string
          planted_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          grow_id: string
          name: string
          species?: string | null
          strain?: string | null
          status?: string
          planted_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          grow_id?: string
          name?: string
          species?: string | null
          strain?: string | null
          status?: string
          planted_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plant_measurements: {
        Row: {
          id: string
          user_id: string
          plant_id: string
          height: number | null
          leaf_count: number | null
          health_score: number | null
          water_amount: number | null
          notes: string | null
          measured_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plant_id: string
          height?: number | null
          leaf_count?: number | null
          health_score?: number | null
          water_amount?: number | null
          notes?: string | null
          measured_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plant_id?: string
          height?: number | null
          leaf_count?: number | null
          health_score?: number | null
          water_amount?: number | null
          notes?: string | null
          measured_at?: string
          created_at?: string
        }
      }
      environmental_readings: {
        Row: {
          id: string
          grow_id: string
          temperature: number
          humidity: number
          soil_moisture: number | null
          light_intensity: number | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          grow_id: string
          temperature: number
          humidity: number
          soil_moisture?: number | null
          light_intensity?: number | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          grow_id?: string
          temperature?: number
          humidity?: number
          soil_moisture?: number | null
          light_intensity?: number | null
          timestamp?: string
          created_at?: string
        }
      }
    }
  }
} 