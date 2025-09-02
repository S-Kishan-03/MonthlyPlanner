import React from 'react';
import { View, UserProfile } from '../types';
import { HomeIcon, CalendarDaysIcon, ChartBarIcon, GiftIcon, StarIcon, FireIcon, ClockIcon, DocumentTextIcon, SunIcon, MoonIcon, Cog6ToothIcon } from './Icon';

type Theme = 'light' | 'dark';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  userProfile: UserProfile;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
    }`}
  >
    <Icon className="h-5 w-5 mb-1 sm:mb-0" />
    <span className="text-xs sm:text-sm">{label}</span>
  </button>
);

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, userProfile, theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 dark:bg-gray-800 dark:shadow-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4 sm:gap-0">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">Zenith Planner</h1>
          </div>
          
          <nav className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            <NavItem label="Dashboard" icon={HomeIcon} isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            <NavItem label="Daily" icon={ClockIcon} isActive={activeView === 'daily'} onClick={() => setActiveView('daily')} />
            <NavItem label="Monthly" icon={CalendarDaysIcon} isActive={activeView === 'monthly'} onClick={() => setActiveView('monthly')} />
            <NavItem label="Notes" icon={DocumentTextIcon} isActive={activeView === 'notes'} onClick={() => setActiveView('notes')} />
            <NavItem label="Reports" icon={ChartBarIcon} isActive={activeView === 'reports'} onClick={() => setActiveView('reports')} />
            <NavItem label="Rewards" icon={GiftIcon} isActive={activeView === 'rewards'} onClick={() => setActiveView('rewards')} />
          </nav>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1 text-yellow-500 dark:text-yellow-400">
              <StarIcon className="h-5 w-5" />
              <span className="font-semibold text-sm">{userProfile.points}</span>
            </div>
            <div className="flex items-center space-x-1 text-red-500 dark:text-red-400">
              <FireIcon className="h-5 w-5" />
              <span className="font-semibold text-sm">{userProfile.streak}</span>
            </div>
            <button onClick={() => setActiveView('settings')} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Settings">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Toggle theme">
              {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
