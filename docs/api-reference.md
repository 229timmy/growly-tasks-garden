# API Reference

## Authentication

All API endpoints require authentication using Supabase Auth. Include the session token in the Authorization header.

## Base URL

```
https://your-app-url.vercel.app/api
```

## Endpoints

### Grows

#### List Grows
- **GET** `/grows`
- **Query Parameters:**
  - `stage` (optional): Filter by grow stage
  - `limit` (optional): Number of records to return
  - `offset` (optional): Pagination offset
- **Response:** Array of Grow objects

#### Get Grow
- **GET** `/grows/{id}`
- **Response:** Single Grow object

### Plants

#### List Plants
- **GET** `/plants`
- **Query Parameters:**
  - `growId` (optional): Filter by grow ID
  - `limit` (optional): Number of records to return
  - `offset` (optional): Pagination offset
- **Response:** Array of Plant objects

#### Get Plant
- **GET** `/plants/{id}`
- **Response:** Single Plant object

### Tasks

#### List Tasks
- **GET** `/tasks`
- **Query Parameters:**
  - `growId` (optional): Filter by grow ID
  - `completed` (optional): Filter by completion status
  - `priority` (optional): Filter by priority
  - `limit` (optional): Number of records to return
  - `offset` (optional): Pagination offset
- **Response:** Array of Task objects

#### Get Task Stats
- **GET** `/tasks/stats`
- **Response:**
  ```json
  {
    "total": number,
    "completed": number,
    "upcoming": number,
    "overdue": number
  }
  ```

### Plant Measurements

#### List Measurements
- **GET** `/plants/{plantId}/measurements`
- **Query Parameters:**
  - `from` (optional): Start date
  - `to` (optional): End date
  - `limit` (optional): Number of records to return
  - `offset` (optional): Pagination offset
- **Response:** Array of PlantMeasurement objects

### Plant Care Activities

#### List Activities
- **GET** `/plant-care`
- **Query Parameters:**
  - `plantId` (optional): Filter by plant ID
  - `growId` (optional): Filter by grow ID
  - `activityType` (optional): Filter by activity type
  - `from` (optional): Start date
  - `to` (optional): End date
  - `limit` (optional): Number of records to return
  - `offset` (optional): Pagination offset
- **Response:** Array of PlantCareActivity objects

### Harvest Records

#### List Harvest Records
- **GET** `/harvests`
- **Query Parameters:**
  - `limit` (optional): Number of records to return
  - `offset` (optional): Pagination offset
- **Response:** Array of HarvestRecord objects

#### Get Harvest Stats
- **GET** `/harvests/stats`
- **Response:**
  ```json
  {
    "totalHarvests": number,
    "totalYield": number,
    "averageYield": number,
    "averageQuality": number
  }
  ```

### Notifications

#### List Notifications
- **GET** `/notifications`
- **Query Parameters:**
  - `unreadOnly` (optional): Filter unread notifications
  - `limit` (optional): Number of records to return
  - `type` (optional): Filter by notification type
- **Response:** Array of Notification objects

## Data Types

### Grow
```typescript
interface Grow {
  id: string;
  name: string;
  description: string | null;
  stage: 'planning' | 'active' | 'completed' | 'archived';
  start_date: string | null;
  end_date: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

### Plant
```typescript
interface Plant {
  id: string;
  name: string;
  strain: string;
  grow_id: string;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  grow_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

## Error Handling

All endpoints may return the following error responses:

- **401** - Unauthorized
- **403** - Forbidden
- **404** - Resource not found
- **422** - Validation error
- **500** - Server error

Error response format:
```json
{
  "error": {
    "message": string,
    "code": string
  }
}
``` 