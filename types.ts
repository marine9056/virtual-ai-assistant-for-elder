
export interface UserProfile {
  name: string;
  age: number;
  interests: string[];
  lastMemoryTopic?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface Settings {
  fontSize: 'standard' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
}

export interface MoodData {
  date: string;
  score: number;
  engagement: number;
  energy?: number;
}

export interface MemoryEntry {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  timestamp: number;
}

export interface RoutineTask {
  id: string;
  time: string;
  title: string;
  description: string;
  completed: boolean;
  type: 'medication' | 'activity' | 'meal';
}

export enum AppState {
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  COMPANION = 'COMPANION',
  REMINISCENCE = 'REMINISCENCE',
  ROUTINE = 'ROUTINE',
  HISTORY = 'HISTORY',
  EMERGENCY = 'EMERGENCY',
  SETTINGS = 'SETTINGS'
}
