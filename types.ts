import type { ComponentType } from 'react';

export type Category = 'Work' | 'Home' | 'Life';
export type Criticality = 'urgent' | 'high' | 'medium' | 'low';
export type Repeat = 'none' | 'daily' | 'weekly' | 'monthly';
export type View = 'dashboard' | 'daily' | 'monthly' | 'reports' | 'rewards' | 'notes' | 'settings';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  dueDate: string; // ISO string representing the start time
  duration: number; // Duration in minutes
  criticality: Criticality;
  repeat: Repeat;
  completedDates: string[]; // 'YYYY-MM-DD'
}

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface UserProfile {
  name: string;
  points: number;
  streak: number;
  lastCompletedDate?: string; // ISO string
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  // Fix: Use ComponentType from react to resolve 'Cannot find namespace 'React'' error.
  icon: ComponentType<{ className?: string }>;
  threshold: (tasks: Task[], profile: UserProfile) => boolean;
}

export interface CustomReward {
  id: string;
  name: string;
  cost: number;
}
