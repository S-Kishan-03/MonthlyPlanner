import React, { useState, useEffect } from 'react';
import { Task, Category, Criticality, Repeat } from '../types';
import { CATEGORIES, CRITICALITY_LEVELS, REPEAT_OPTIONS, CRITICALITY_COLORS } from '../constants';
import { XMarkIcon } from './Icon';
// Fix: Import suggestSubtasks to use the Gemini API for sub-task suggestions.
import { suggestSubtasks } from '../services/geminiService';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completedDates'>) => void;
  onUpdateTask: (task: Task) => void;
  editingTask: Task | null;
  apiKey: string;
}

// Helper to format a Date object to a string suitable for datetime-local input
const getLocalDateTimePickerValue = (date: Date): string => {
    const dateCopy = new Date(date.getTime());
    // Adjust for the local timezone offset to get the correct "YYYY-MM-DDTHH:mm" format
    dateCopy.setMinutes(dateCopy.getMinutes() - dateCopy.getTimezoneOffset());
    return dateCopy.toISOString().slice(0, 16);
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, onUpdateTask, editingTask, apiKey }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Work');
  const [dueDate, setDueDate] = useState(getLocalDateTimePickerValue(new Date()));
  const [duration, setDuration] = useState(30);
  const [criticality, setCriticality] = useState<Criticality>('medium');
  const [repeat, setRepeat] = useState<Repeat>('none');

  // State for AI suggestions feature
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category);
      setDueDate(getLocalDateTimePickerValue(new Date(editingTask.dueDate)));
      setDuration(editingTask.duration);
      setCriticality(editingTask.criticality);
      setRepeat(editingTask.repeat);
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Work');
      setDueDate(getLocalDateTimePickerValue(new Date()));
      setDuration(30);
      setCriticality('medium');
      setRepeat('none');
    }
    setSuggestionError(''); // Reset suggestion error when modal opens or editing task changes
  }, [editingTask, isOpen]);
  
  const handleSuggestSubtasks = async () => {
    if (!apiKey) {
      setSuggestionError('Please set your Gemini API key in the settings to use this feature.');
      return;
    }
    if (!title.trim()) {
      setSuggestionError('Please enter a task title first.');
      return;
    }
    setIsSuggesting(true);
    setSuggestionError('');
    try {
      const subtasks = await suggestSubtasks(title, apiKey);
      if (subtasks.length > 0) {
        const subtasksText = subtasks.map(s => `- ${s}`).join('\n');
        setDescription(prev => prev ? `${prev}\n\nSuggested sub-tasks:\n${subtasksText}` : `Suggested sub-tasks:\n${subtasksText}`);
      } else {
        setSuggestionError('No suggestions found.');
      }
    } catch (error) {
        setSuggestionError((error as Error).message || 'Failed to get suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const taskData = {
      title,
      description,
      category,
      // The value from datetime-local input is treated as local time
      dueDate: new Date(dueDate).toISOString(),
      duration: Number(duration),
      criticality,
      repeat,
    };
    
    if (editingTask) {
        onUpdateTask({ ...taskData, id: editingTask.id, completedDates: editingTask.completedDates });
    } else {
        onAddTask(taskData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <button
                    type="button"
                    onClick={handleSuggestSubtasks}
                    disabled={isSuggesting || !title.trim()}
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSuggesting ? 'Generating...' : '✨ Suggest sub-tasks'}
                </button>
              </div>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"></textarea>
              {suggestionError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{suggestionError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button type="button" key={cat} onClick={() => setCategory(cat)} className={`px-3 py-2 text-sm rounded-md transition-colors ${category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Criticality</label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {CRITICALITY_LEVELS.map(level => (
                        <button type="button" key={level} onClick={() => setCriticality(level)} className={`flex-1 text-center capitalize py-2 text-sm rounded-md border-2 transition-colors ${criticality === level ? `border-transparent ring-2 ring-indigo-500 text-white ${CRITICALITY_COLORS[level]}` : 'bg-transparent text-gray-600 border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date & Time</label>
                <input type="datetime-local" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" required />
              </div>
              <div>
                 <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (minutes)</label>
                <input type="number" id="duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required min="1" />
              </div>
            </div>
            
            <div>
              <label htmlFor="repeat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Repeat</label>
              <select id="repeat" value={repeat} onChange={(e) => setRepeat(e.target.value as Repeat)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                {REPEAT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
              </select>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
              <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">{editingTask ? 'Save Changes' : 'Add Task'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
