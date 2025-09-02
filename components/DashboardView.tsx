import React, { useState, useMemo } from 'react';
import { Task, Category } from '../types';
import { TaskItem } from './TaskItem';
import { CATEGORIES } from '../constants';

interface DashboardViewProps {
  tasks: Task[];
  onCompleteTask: (taskId: string, date: Date) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

const TaskSection: React.FC<{ title: string; tasks: Task[]; onCompleteTask: (taskId: string, date: Date) => void; onDeleteTask: (taskId: string) => void; onEditTask: (task: Task) => void; emptyMessage: string }> = ({ title, tasks, onCompleteTask, onDeleteTask, onEditTask, emptyMessage }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h2>
        {tasks.length > 0 ? (
            <div className="space-y-3">
                {tasks.map(task => (
                    <TaskItem key={task.id} task={task} onComplete={onCompleteTask} onDelete={onDeleteTask} onEdit={onEditTask} />
                ))}
            </div>
        ) : (
            <div className="text-center py-10 px-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
            </div>
        )}
    </div>
);


export const DashboardView: React.FC<DashboardViewProps> = ({ tasks, onCompleteTask, onDeleteTask, onEditTask }) => {
    const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

    const { overdueTasks, todayTasks, upcomingTasks } = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        const filtered = selectedCategory === 'All' ? sortedTasks : sortedTasks.filter(t => t.category === selectedCategory);

        const overdue: Task[] = [];
        const today: Task[] = [];
        const upcoming: Task[] = [];
        
        filtered.forEach(task => {
            // Non-recurring tasks that are completed are hidden.
            if (task.repeat === 'none' && task.completedDates.length > 0) {
                return;
            }
            // Recurring tasks are always shown, as they can be completed on multiple days.

            const dueDate = new Date(task.dueDate);
            if (dueDate < startOfToday) {
                overdue.push(task);
            } else if (dueDate >= startOfToday && dueDate < endOfToday) {
                today.push(task);
            } else {
                upcoming.push(task);
            }
        });

        return { overdueTasks: overdue, todayTasks: today, upcomingTasks: upcoming };
    }, [tasks, selectedCategory]);

  return (
    <div>
        <div className="mb-6 flex flex-wrap gap-2">
            <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCategory === 'All' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
                All
            </button>
            {CATEGORIES.map(cat => (
                 <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <TaskSection 
            title="Overdue"
            tasks={overdueTasks}
            onCompleteTask={onCompleteTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            emptyMessage="No overdue tasks. Great job!"
        />

        <TaskSection 
            title="Today's Focus"
            tasks={todayTasks}
            onCompleteTask={onCompleteTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            emptyMessage="No tasks for today. Add one or enjoy the break!"
        />
        
        <TaskSection 
            title="Upcoming"
            tasks={upcomingTasks}
            onCompleteTask={onCompleteTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            emptyMessage="No upcoming tasks. Plan ahead!"
        />
    </div>
  );
};