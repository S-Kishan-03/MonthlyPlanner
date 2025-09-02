import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DailyView } from './components/DailyView';
import { MonthlyView } from './components/MonthlyView';
import { ReportsView } from './components/ReportsView';
import { RewardsView } from './components/RewardsView';
import { NotesView } from './components/NotesView';
import { SettingsView } from './components/SettingsView';
import { AddTaskModal } from './components/AddTaskModal';
import { AddNoteModal } from './components/AddNoteModal';
import { Task, UserProfile, CustomReward, View, Note } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_TASKS, INITIAL_PROFILE, INITIAL_REWARDS, INITIAL_NOTES } from './constants';
import { PlusCircleIcon } from './components/Icon';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', INITIAL_TASKS);
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', INITIAL_NOTES);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', INITIAL_PROFILE);
  const [customRewards, setCustomRewards] = useLocalStorage<CustomReward[]>('customRewards', INITIAL_REWARDS);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [apiKey, setApiKey] = useLocalStorage<string>('gemini-api-key', '');

  const [activeView, setActiveView] = useState<View>('dashboard');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  const checkStreaks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (userProfile.lastCompletedDate) {
      const lastCompleted = new Date(userProfile.lastCompletedDate);
      if (lastCompleted.getTime() < yesterday.getTime()) {
        setUserProfile(prev => ({ ...prev, streak: 0 }));
      }
    }
  }, [userProfile.lastCompletedDate, setUserProfile]);

  useEffect(() => {
    checkStreaks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Task Handlers
  const handleAddTask = (task: Omit<Task, 'id' | 'completedDates'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completedDates: [],
    };
    setTasks(prev => [...prev, newTask].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    setIsTaskModalOpen(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };
  
  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleCompleteTask = (taskId: string, completionDate: Date) => {
    const completionDateString = completionDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    const isAlreadyCompleted = taskToUpdate.completedDates.includes(completionDateString);

    if (isAlreadyCompleted) {
        // Un-complete: For simplicity, we'll just remove the completion date and not adjust points/streak.
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? { ...task, completedDates: task.completedDates.filter(d => d !== completionDateString) }
                    : task
            )
        );
    } else {
        // Complete: Add date and award points
        let pointsEarned = 10; // Base points
        if (taskToUpdate.criticality === 'urgent') pointsEarned += 15;
        if (taskToUpdate.criticality === 'high') pointsEarned += 10;
        if (taskToUpdate.criticality === 'medium') pointsEarned += 5;

        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? { ...task, completedDates: [...task.completedDates, completionDateString] }
                    : task
            )
        );

        // Update user profile with points and streak
        const today = completionDate;
        today.setHours(0, 0, 0, 0);
        const todayString = today.toISOString();

        setUserProfile(prev => {
            const lastCompleted = prev.lastCompletedDate ? new Date(prev.lastCompletedDate) : null;
            let newStreak = prev.streak;

            if (!lastCompleted || lastCompleted.getTime() < today.getTime()) {
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                
                newStreak = (lastCompleted && lastCompleted.getTime() === yesterday.getTime()) ? newStreak + 1 : 1;
            }

            return { ...prev, points: prev.points + pointsEarned, streak: newStreak, lastCompletedDate: todayString };
        });
        }
  };
  
  // Note Handlers
  const handleAddNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    setIsNoteModalOpen(false);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(note => note.id === updatedNote.id ? updatedNote : note));
    setIsNoteModalOpen(false);
    setEditingNote(null);
  };

  const handleOpenEditNoteModal = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  // Reward Handlers
  const handleAddReward = (reward: Omit<CustomReward, 'id'>) => {
    const newReward: CustomReward = { ...reward, id: Date.now().toString() };
    setCustomRewards(prev => [...prev, newReward]);
  };

  const handleRedeemReward = (rewardId: string) => {
    const reward = customRewards.find(r => r.id === rewardId);
    if (reward && userProfile.points >= reward.cost) {
      setUserProfile(prev => ({ ...prev, points: prev.points - reward.cost }));
      setCustomRewards(prev => prev.filter(r => r.id !== rewardId));
    } else {
      alert("Not enough points!");
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView tasks={tasks} onCompleteTask={handleCompleteTask} onDeleteTask={handleDeleteTask} onEditTask={handleOpenEditTaskModal} />;
      case 'daily':
        return <DailyView tasks={tasks} onCompleteTask={handleCompleteTask} onDeleteTask={handleDeleteTask} onEditTask={handleOpenEditTaskModal} onUpdateTask={handleUpdateTask} />;
      case 'monthly':
        return <MonthlyView tasks={tasks} />;
      case 'reports':
        return <ReportsView tasks={tasks} />;
      case 'rewards':
        return (
          <RewardsView
            userProfile={userProfile}
            customRewards={customRewards}
            onAddReward={handleAddReward}
            onRedeemReward={handleRedeemReward}
          />
        );
      case 'notes':
        return (
            <NotesView 
                notes={notes}
                onAddNote={() => { setEditingNote(null); setIsNoteModalOpen(true); }}
                onEditNote={handleOpenEditNoteModal}
                onDeleteNote={handleDeleteNote}
            />
        );
      case 'settings':
        return <SettingsView apiKey={apiKey} setApiKey={setApiKey} />;
      default:
        return <DashboardView tasks={tasks} onCompleteTask={handleCompleteTask} onDeleteTask={handleDeleteTask} onEditTask={handleOpenEditTaskModal}/>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        userProfile={userProfile}
        theme={theme}
        setTheme={setTheme}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderView()}
      </main>
      <button
        onClick={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110 dark:focus:ring-offset-gray-900"
        aria-label="Add new task"
      >
        <PlusCircleIcon className="h-8 w-8" />
      </button>
      {isTaskModalOpen && (
        <AddTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          editingTask={editingTask}
          apiKey={apiKey}
        />
      )}
      {isNoteModalOpen && (
        <AddNoteModal
            isOpen={isNoteModalOpen}
            onClose={() => {
                setIsNoteModalOpen(false);
                setEditingNote(null);
            }}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            editingNote={editingNote}
        />
      )}
    </div>
  );
};

export default App;
