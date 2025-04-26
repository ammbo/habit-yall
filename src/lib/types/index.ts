// Enums that match the database enums
export enum HabitStatus {
  ACTIVE = 1,
  BROKEN = 2,
  COMPLETED = 3
}

export enum NotificationType {
  YOUR_TURN = 'your_turn',
  STREAK_BROKEN = 'streak_broken',
  CREDITS_RECEIVED = 'credits_received',
  PARTNER_REQUEST = 'partner_request'
}

// Base types that mirror the database structure
export interface User {
  id: number;
  uuid: string;
  email: string;
  name: string;
  password: string; // Hashed password 
  deleted_at: string | null;
  date_created: string;
  date_updated: string | null;
}

export interface Habit {
  id: number;
  uuid: string;
  name: string;
  creator_user_id: number;
  partner_user_id: number;
  credits_pledged: number;
  minimum_delay_hours: number;
  maximum_window_hours: number;
  status: HabitStatus;
  current_streak_count: number;
  date_created: string;
  date_updated: string | null;
}

export interface HabitVolley {
  id: number;
  uuid: string;
  habit_id: number;
  user_id: number;
  completed_at: string;
  deadline: string;
  date_created: string;
  date_updated: string | null;
}

export interface Notification {
  id: number;
  uuid: string;
  user_id: number;
  type: NotificationType;
  content: string;
  related_habit_id: number;
  read_status: boolean;
  date_created: string;
  date_updated: string | null;
}

// Input types for creating records
export interface UserInput {
  email: string;
  name: string;
  password: string;
  deleted_at?: string | null;
}

export interface HabitInput {
  name: string;
  creator_user_id: number;
  partner_user_id: number;
  credits_pledged: number;
  minimum_delay_hours: number;
  maximum_window_hours: number;
  status: number;
  current_streak_count: number;
}

export interface HabitVolleyInput {
  habit_id: number;
  user_id: number;
  completed_at: string;
  deadline: string;
}

export interface NotificationInput {
  user_id: number;
  type: NotificationType;
  content: string;
  related_habit_id: number;
  read_status: boolean;
}

// Session types
export interface SessionData {
  userId: number;
  userUuid: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Extended types with relationships
export interface HabitWithUsers extends Habit {
  creator?: User;
  partner?: User;
}

export interface HabitWithVolleys extends Habit {
  volleys?: HabitVolley[];
}

export interface UserWithHabits extends User {
  created_habits?: Habit[];
  partnered_habits?: Habit[];
} 