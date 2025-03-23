import type { Database } from './database';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Export table types
export type Profile = Tables['profiles']['Row'];
export type ProfileUpdate = Tables['profiles']['Update'];

export type SubscriptionPlan = Tables['subscription_plans']['Row'];
export type SubscriptionPlanInsert = Tables['subscription_plans']['Insert'];
export type SubscriptionPlanUpdate = Tables['subscription_plans']['Update'];

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

export type PlantCareActivity = Tables['plant_care_activities']['Row'];
export type PlantCareActivityInsert = Tables['plant_care_activities']['Insert'];
export type PlantCareActivityUpdate = Tables['plant_care_activities']['Update'];

export type EnvironmentalData = Tables['environmental_data']['Row'];
export type EnvironmentalDataInsert = Tables['environmental_data']['Insert'];
export type EnvironmentalDataUpdate = Tables['environmental_data']['Update'];

export type HarvestRecord = Tables['harvest_records']['Row'];
export type HarvestRecordInsert = Tables['harvest_records']['Insert'];
export type HarvestRecordUpdate = Tables['harvest_records']['Update'];

export type Activity = Tables['activities']['Row'];
export type ActivityInsert = Tables['activities']['Insert'];
export type ActivityUpdate = Tables['activities']['Update'];

export type Notification = Tables['notifications']['Row'];
export type NotificationInsert = Tables['notifications']['Insert'];
export type NotificationUpdate = Tables['notifications']['Update'];

export type ContactMessage = Tables['contact_messages']['Row'];
export type ContactMessageInsert = Tables['contact_messages']['Insert'];
export type ContactMessageUpdate = Tables['contact_messages']['Update'];

// Export enum types
export type UserTier = Enums['user_tier'];
export type GrowStage = Enums['grow_stage'];
export type PlantCareActivityType = Enums['plant_care_activity_type'];
export type GrowingMedium = Enums['growing_medium'];
export type EnvironmentType = Enums['environment_type'];

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