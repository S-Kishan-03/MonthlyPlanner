import { Task, UserProfile, CustomReward, Category, Criticality, Repeat, Badge, Note } from './types';
import { StarIcon, FireIcon, CheckBadgeIcon, TrophyIcon, RocketLaunchIcon, CalendarDaysIcon } from './components/Icon';

export const CATEGORIES: Category[] = ['Work', 'Home', 'Life'];
export const CRITICALITY_LEVELS: Criticality[] = ['urgent', 'high', 'medium', 'low'];
export const REPEAT_OPTIONS: Repeat[] = ['none', 'daily', 'weekly', 'monthly'];

export const CRITICALITY_COLORS: Record<Criticality, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-400',
  low: 'bg-green-500',
};

export const CATEGORY_COLORS: Record<Category, string> = {
    Work: 'bg-blue-100 text-blue-800',
    Home: 'bg-purple-100 text-purple-800',
    Life: 'bg-teal-100 text-teal-800',
};

const now = new Date();
const yesterday = new Date();
yesterday.setDate(now.getDate() - 1);
const yesterdayYYYYMMDD = yesterday.toISOString().split('T')[0];

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Client Meeting Prep',
    description: 'Finalize the presentation for the Johnson project.',
    category: 'Work',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0).toISOString(),
    duration: 60,
    criticality: 'urgent',
    repeat: 'none',
    completedDates: [],
  },
  {
    id: '2',
    title: 'Grocery Shopping',
    category: 'Home',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    duration: 45,
    criticality: 'medium',
    repeat: 'weekly',
    completedDates: [],
  },
  {
    id: '3',
    title: 'Morning Yoga',
    category: 'Life',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30, 0).toISOString(),
    duration: 30,
    criticality: 'low',
    repeat: 'daily',
    completedDates: [yesterdayYYYYMMDD],
  },
];

export const INITIAL_NOTES: Note[] = [
    {
        id: 'n1',
        title: 'Project Zenith Ideas',
        content: 'Consider adding a feature for tracking long-term goals. Maybe a separate view for yearly or quarterly objectives.',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'n2',
        title: 'Book Recommendations',
        content: '1. "Atomic Habits" by James Clear\n2. "Deep Work" by Cal Newport\n3. "The Pragmatic Programmer" by Andrew Hunt',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    }
];

export const INITIAL_PROFILE: UserProfile = {
  name: 'Jessica',
  points: 1250,
  streak: 5,
  lastCompletedDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
};

export const INITIAL_REWARDS: CustomReward[] = [
    { id: '1', name: 'Coffee Shop Treat', cost: 250 },
    { id: '2', name: '30-min Uninterrupted Reading', cost: 400 },
];

export const BADGES: Badge[] = [
    {
        id: 'b1',
        name: 'Task Starter',
        description: 'Complete your first task.',
        icon: StarIcon,
        threshold: (tasks) => tasks.filter(t => t.completedDates.length > 0).length >= 1,
    },
    {
        id: 'b2',
        name: 'On Fire',
        description: 'Maintain a 3-day streak.',
        icon: FireIcon,
        threshold: (tasks, profile) => profile.streak >= 3,
    },
    {
        id: 'b3',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak.',
        icon: TrophyIcon,
        threshold: (tasks, profile) => profile.streak >= 7,
    },
    {
        id: 'b4',
        name: 'Productivity Pro',
        description: 'Complete 25 tasks.',
        icon: CheckBadgeIcon,
        threshold: (tasks) => tasks.reduce((acc, t) => acc + t.completedDates.length, 0) >= 25,
    },
    {
        id: 'b5',
        name: 'Goal Getter',
        description: 'Earn 1000 points.',
        icon: RocketLaunchIcon,
        threshold: (tasks, profile) => profile.points >= 1000,
    },
     {
        id: 'b6',
        name: 'Planner Extraordinaire',
        description: 'Plan tasks for a full month.',
        icon: CalendarDaysIcon,
        threshold: (tasks) => {
            const taskDates = new Set(tasks.map(t => new Date(t.dueDate).getMonth()));
            return taskDates.size > 0; // Simplified check
        },
    },
];