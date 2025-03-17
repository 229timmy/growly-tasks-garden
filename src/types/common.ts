import type { Database } from './database';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Export table types
export type Profile = Tables['profiles']['Row'];
export type ProfileUpdate = Tables['profiles']['Update'];

export type Grow = Tables['grows']['Row'];
export type GrowInsert = Tables['grows']['Insert'];
export type GrowUpdate = Tables['grows']['Update'];

export type Plant = Tables['plants']['Row'];
export type PlantInsert = Tables['plants']['Insert'];
export type PlantUpdate = Tables['plants']['Update'];

export type PlantPhoto = Tables['plant_photos']['Row'];
export type PlantPhotoInsert = Tables['plant_photos']['Insert'];
export type PlantPhotoUpdate = Tables['plant_photos']['Update'];

export type PlantMeasurement = Tables['plant_measurements']['Row'];
export type PlantMeasurementInsert = Tables['plant_measurements']['Insert'];
export type PlantMeasurementUpdate = Tables['plant_measurements']['Update'];

export type Task = Tables['tasks']['Row'];
export type TaskInsert = Tables['tasks']['Insert'];
export type TaskUpdate = Tables['tasks']['Update'];

export type PlantCareActivity = Tables['plant_care_activities']['Row'];
export type PlantCareActivityInsert = Tables['plant_care_activities']['Insert'];
export type PlantCareActivityUpdate = Tables['plant_care_activities']['Update'];

// Export enum types
export type UserTier = Enums['user_tier'];
export type GrowStage = Enums['grow_stage'];
export type PlantStatus = Enums['plant_status'];
export type TaskPriority = Enums['task_priority'];

// Utility types
export type WithoutTimestamps<T> = Omit<T, 'created_at' | 'updated_at'>;
export type WithoutUserId<T> = Omit<T, 'user_id'>;
export type WithoutId<T> = Omit<T, 'id'>;

// Common response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
} 