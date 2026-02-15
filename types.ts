
export interface UserProfile {
  name: string;
  age: number;
  interests: string[];
  lastMemoryTopic?: string;
}

export interface MoodData {
  date: string;
  score: number;
  engagement: number;
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
  ROUTINE = 'ROUTINE'
}
