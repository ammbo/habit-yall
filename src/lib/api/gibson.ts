import { 
  User, 
  UserInput,
  Habit,
  HabitInput,
  HabitVolley,
  HabitVolleyInput,
  Notification,
  NotificationInput,
  ApiResponse
} from '../types';

// Constants
const API_BASE_URL = 'https://api.gibsonai.com/v1/-';
const DEV_API_KEY = process.env.GIBSON_API_KEY_DEV;
const PROD_API_KEY = process.env.GIBSON_API_KEY_PROD;

// Helper to determine which API key to use (development or production)
const getApiKey = () => {
  if (process.env.NODE_ENV === 'production') {
    return PROD_API_KEY;
  }
  return DEV_API_KEY;
};

// Generic API client for GibsonAI
class GibsonApiClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Gibson-API-Key': getApiKey() || '',
    };
  }

  // Generic fetch method with error handling
  private async fetcher<T>(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to parse error response' }));
        throw new Error(typeof errorData === 'object' ? JSON.stringify(errorData) : errorData.detail || 'An error occurred');
      }

      if (response.status === 204) {
        // No content - successful DELETE
        return { data: undefined };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Generic CRUD methods
  async getAll<T>(resource: string, queryParams?: Record<string, string>): Promise<ApiResponse<T[]>> {
    let url = resource;
    
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, value);
      });
      url = `${resource}?${params.toString()}`;
    }
    
    return this.fetcher<T[]>(url, 'GET');
  }

  async getById<T>(resource: string, id: string | number): Promise<ApiResponse<T>> {
    return this.fetcher<T>(`${resource}/${id}`, 'GET');
  }

  async create<T, Input>(resource: string, data: Input): Promise<ApiResponse<T>> {
    return this.fetcher<T>(resource, 'POST', data);
  }

  async update<T, Input>(resource: string, id: string | number, data: Partial<Input>): Promise<ApiResponse<T>> {
    return this.fetcher<T>(`${resource}/${id}`, 'PATCH', data);
  }

  async delete(resource: string, id: string | number): Promise<ApiResponse<void>> {
    return this.fetcher<void>(`${resource}/${id}`, 'DELETE');
  }
}

// Create a singleton instance
const gibsonApi = new GibsonApiClient();

// Specific API methods for each resource
export const userApi = {
  getAll: (params?: Record<string, string>) => gibsonApi.getAll<User>('user', params),
  getById: (id: string | number) => gibsonApi.getById<User>('user', id),
  create: (data: UserInput) => gibsonApi.create<User, UserInput>('user', data),
  update: (id: string | number, data: Partial<UserInput>) => 
    gibsonApi.update<User, UserInput>('user', id, data),
  delete: (id: string | number) => gibsonApi.delete('user', id),
  
  // Custom queries
  getByEmail: async (email: string): Promise<ApiResponse<User[]>> => {
    return gibsonApi.getAll<User>('user', { where: `[email=${email}]` });
  },
};

export const habitApi = {
  getAll: (params?: Record<string, string>) => gibsonApi.getAll<Habit>('habit', params),
  getById: (id: string | number) => gibsonApi.getById<Habit>('habit', id),
  create: (data: HabitInput) => gibsonApi.create<Habit, HabitInput>('habit', data),
  update: (id: string | number, data: Partial<HabitInput>) => 
    gibsonApi.update<Habit, HabitInput>('habit', id, data),
  delete: (id: string | number) => gibsonApi.delete('habit', id),
  
  // Custom queries
  getByCreator: (userId: number) => 
    gibsonApi.getAll<Habit>('habit', { where: `[creator_user_id=${userId}]` }),
  getByPartner: (userId: number) => 
    gibsonApi.getAll<Habit>('habit', { where: `[partner_user_id=${userId}]` }),
  getUserHabits: async (userId: number): Promise<ApiResponse<Habit[]>> => {
    const [creatorResponse, partnerResponse] = await Promise.all([
      gibsonApi.getAll<Habit>('habit', { where: `[creator_user_id=${userId}]` }),
      gibsonApi.getAll<Habit>('habit', { where: `[partner_user_id=${userId}]` })
    ]);
    
    if (creatorResponse.error || partnerResponse.error) {
      return { 
        error: creatorResponse.error || partnerResponse.error 
      };
    }
    
    return { 
      data: [...(creatorResponse.data || []), ...(partnerResponse.data || [])]
    };
  },
};

export const volleyApi = {
  getAll: (params?: Record<string, string>) => gibsonApi.getAll<HabitVolley>('habit-volley', params),
  getById: (id: string | number) => gibsonApi.getById<HabitVolley>('habit-volley', id),
  create: (data: HabitVolleyInput) => gibsonApi.create<HabitVolley, HabitVolleyInput>('habit-volley', data),
  update: (id: string | number, data: Partial<HabitVolleyInput>) => 
    gibsonApi.update<HabitVolley, HabitVolleyInput>('habit-volley', id, data),
  delete: (id: string | number) => gibsonApi.delete('habit-volley', id),
  
  // Custom queries
  getByHabit: (habitId: number) => 
    gibsonApi.getAll<HabitVolley>('habit-volley', { 
      where: `[habit_id=${habitId}]`,
      order_by: '[completed_at:desc]'
    }),
  
  getLatestByHabit: async (habitId: number): Promise<ApiResponse<HabitVolley>> => {
    const response = await gibsonApi.getAll<HabitVolley>('habit-volley', { 
      where: `[habit_id=${habitId}]`,
      order_by: '[completed_at:desc]',
      limit: '1'
    });
    
    if (response.error) {
      return { error: response.error };
    }
    
    if (!response.data || response.data.length === 0) {
      return { error: 'No volleys found for this habit' };
    }
    
    return { data: response.data[0] };
  },
};

export const notificationApi = {
  getAll: (params?: Record<string, string>) => gibsonApi.getAll<Notification>('habit-notification', params),
  getById: (id: string | number) => gibsonApi.getById<Notification>('habit-notification', id),
  create: (data: NotificationInput) => 
    gibsonApi.create<Notification, NotificationInput>('habit-notification', data),
  update: (id: string | number, data: Partial<NotificationInput>) => 
    gibsonApi.update<Notification, NotificationInput>('habit-notification', id, data),
  delete: (id: string | number) => gibsonApi.delete('habit-notification', id),
  
  // Custom queries
  getByUser: (userId: number, readStatus?: boolean) => {
    const whereClause = readStatus !== undefined 
      ? `[user_id=${userId} AND read_status=${readStatus}]` 
      : `[user_id=${userId}]`;
      
    return gibsonApi.getAll<Notification>('habit-notification', { 
      where: whereClause,
      order_by: '[date_created:desc]' 
    });
  },
  
  markAsRead: (id: string | number) => 
    gibsonApi.update<Notification, NotificationInput>('habit-notification', id, { read_status: true }),
}; 