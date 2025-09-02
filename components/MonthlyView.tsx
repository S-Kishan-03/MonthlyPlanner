import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { CRITICALITY_COLORS, CATEGORY_COLORS } from '../constants';

interface MonthlyViewProps {
  tasks: Task[];
}

type TaskOccurrence = Task & { completedForDate: boolean };

const getMonthlyTaskOccurrences = (tasks: Task[], year: number, month: number): TaskOccurrence[] => {
    const occurrences: TaskOccurrence[] = [];
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    for (const task of tasks) {
        const originalDueDate = new Date(task.dueDate);
        
        if (originalDueDate > endDate && task.repeat === 'none') {
            continue;
        }

        let currentDate = new Date(originalDueDate);

        if (task.repeat === 'none') {
            if (currentDate >= startDate && currentDate <= endDate) {
                const dateString = currentDate.toISOString().split('T')[0];
                occurrences.push({
                    ...task,
                    completedForDate: task.completedDates.includes(dateString),
                });
            }
        } else {
            // Move start date to the first occurrence within or before the current view
            if (task.repeat === 'monthly') {
                while(currentDate < startDate && (currentDate.getMonth() !== month || currentDate.getFullYear() !== year)) {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            } else if (task.repeat === 'weekly') {
                 while(currentDate < startDate) {
                    currentDate.setDate(currentDate.getDate() + 7);
                }
            } else if (task.repeat === 'daily') {
                 while(currentDate < startDate) {
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            
            while (currentDate <= endDate) {
                 if (currentDate >= startDate) {
                    const dateString = currentDate.toISOString().split('T')[0];
                    occurrences.push({
                        ...task,
                        id: `${task.id}-${currentDate.getTime()}`,
                        dueDate: currentDate.toISOString(),
                        completedForDate: task.completedDates.includes(dateString),
                    });
                }

                if (task.repeat === 'daily') {
                    currentDate.setDate(currentDate.getDate() + 1);
                } else if (task.repeat === 'weekly') {
                    currentDate.setDate(currentDate.getDate() + 7);
                } else if (task.repeat === 'monthly') {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            }
        }
    }
    return occurrences;
};


const DayCell: React.FC<{
    day: number | null;
    tasksForDay: TaskOccurrence[];
    isToday: boolean;
    isCurrentMonth: boolean;
    onDayClick: (day: number) => void;
}> = ({ day, tasksForDay, isToday, isCurrentMonth, onDayClick }) => {
    if (!day) {
        return <div className="border-t border-r border-gray-200 dark:border-gray-700"></div>
    }

    const cellClasses = `relative border-t border-r border-gray-200 dark:border-gray-700 p-2 h-24 sm:h-28 flex flex-col cursor-pointer transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700/50 ${!isCurrentMonth ? 'bg-gray-50 text-gray-400 dark:bg-gray-800/50 dark:text-gray-500' : 'bg-white dark:bg-gray-800'}`;
    const dayNumberClasses = `flex items-center justify-center h-7 w-7 rounded-full text-sm ${isToday ? 'bg-indigo-600 text-white font-bold' : ''}`;
    
    return (
        <div className={cellClasses} onClick={() => onDayClick(day)}>
            <div className="flex justify-end">
                <span className={dayNumberClasses}>{day}</span>
            </div>
            <div className="mt-1 overflow-y-auto text-gray-700 dark:text-gray-300">
                {tasksForDay.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center text-xs mb-1">
                        <div className={`w-2 h-2 rounded-full mr-1.5 ${CRITICALITY_COLORS[task.criticality]}`}></div>
                        <span className="truncate">{task.title}</span>
                    </div>
                ))}
                {tasksForDay.length > 3 && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{tasksForDay.length - 3} more</div>}
            </div>
        </div>
    );
};

export const MonthlyView: React.FC<MonthlyViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDayOfWeek = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();
  
  const monthlyTasks = useMemo(() => {
      return getMonthlyTaskOccurrences(tasks, currentDate.getFullYear(), currentDate.getMonth());
  }, [tasks, currentDate]);
  
  const days = [];
  for(let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for(let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleDayClick = (day: number) => {
    setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }
  
  const selectedDayTasks = selectedDay ? monthlyTasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate.getFullYear() === selectedDay.getFullYear() &&
           taskDate.getMonth() === selectedDay.getMonth() &&
           taskDate.getDate() === selectedDay.getDate();
  }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) 
  : [];


  return (
    <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="px-4 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-sm">&lt;</button>
                <h2 className="text-lg sm:text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={handleNextMonth} className="px-4 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-sm">&gt;</button>
            </div>
            <div className="grid grid-cols-7 border-l border-b border-gray-200 dark:border-gray-700">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium text-sm text-gray-600 dark:text-gray-300 py-2 border-t border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">{day}</div>
                ))}
                {days.map((day, index) => {
                    const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                    const isToday = date?.toDateString() === new Date().toDateString();
                    const tasksForDay = day ? monthlyTasks.filter(task => {
                        const taskDate = new Date(task.dueDate);
                        return taskDate.getDate() === day;
                    }) : [];
                    return (
                        <DayCell
                            key={index}
                            day={day}
                            tasksForDay={tasksForDay}
                            isToday={isToday}
                            isCurrentMonth={true}
                            onDayClick={handleDayClick}
                        />
                    );
                })}
            </div>
        </div>
        <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm sticky top-24">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    {selectedDay ? selectedDay.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a day'}
                </h3>
                {selectedDayTasks.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedDayTasks.map(task => (
                            <div key={task.id} className={`p-3 rounded-md border-l-4 ${task.completedForDate ? 'bg-gray-100 dark:bg-gray-700/50 border-gray-400 dark:border-gray-500' : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 dark:border-indigo-400'}`}>
                                <p className={`font-medium ${task.completedForDate ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</p>
                                <div className="flex items-center flex-wrap gap-x-3 mt-1">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: false })} ({task.duration} min)
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[task.category]} dark:bg-opacity-20`}>{task.category}</span>
                                    <div className={`w-3 h-3 rounded-full ${CRITICALITY_COLORS[task.criticality]}`} title={`Criticality: ${task.criticality}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No tasks for this day.</p>
                )}
            </div>
        </div>
    </div>
  );
};