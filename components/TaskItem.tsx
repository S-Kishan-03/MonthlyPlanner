import React from 'react';
import { Task } from '../types';
import { CRITICALITY_COLORS, CATEGORY_COLORS } from '../constants';
import { TrashIcon, PencilIcon } from './Icon';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string, date: Date) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  displayDate?: Date;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete, onEdit, displayDate }) => {
  const dateToConsider = displayDate || new Date();
  const dateToConsiderString = dateToConsider.toISOString().split('T')[0];
  const isCompleted = task.completedDates.includes(dateToConsiderString);

  const isOverdue = !isCompleted && new Date(task.dueDate) < new Date();
  
  const dueDate = new Date(task.dueDate);
  const formattedDate = dueDate.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
  });
  const formattedTime = dueDate.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: false });

  const categoryStyle = CATEGORY_COLORS[task.category];


  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 transition-all duration-300 ${
        isCompleted ? 'border-gray-300 dark:border-gray-600 opacity-60' : 'border-indigo-500 dark:border-indigo-400'
      }`}
    >
      <div className="flex items-center flex-grow">
         <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onComplete(task.id, dateToConsider)}
          className="h-6 w-6 rounded-full border-gray-300 dark:border-gray-500 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:focus:ring-offset-gray-800"
          aria-label={`Mark task ${task.title} as complete`}
        />
        <div className="ml-4">
          <p className={`font-medium text-gray-900 dark:text-gray-100 ${isCompleted ? 'line-through' : ''}`}>{task.title}</p>
          <div className="flex items-center flex-wrap gap-x-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryStyle} dark:bg-opacity-20`}>
              {task.category}
            </span>
            <span className={isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
              {formattedDate}, {formattedTime} ({task.duration} min)
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:ml-4 self-end sm:self-center mt-2 sm:mt-0">
        <div className={`w-4 h-4 rounded-full ${CRITICALITY_COLORS[task.criticality]}`} title={`Criticality: ${task.criticality}`}></div>
        <button
          onClick={() => onEdit(task)}
          className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
          aria-label="Edit task"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
          aria-label="Delete task"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};