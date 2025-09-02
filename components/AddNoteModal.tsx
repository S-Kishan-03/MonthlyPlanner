import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { XMarkIcon } from './Icon';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  onUpdateNote: (note: Note) => void;
  editingNote: Note | null;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, onClose, onAddNote, onUpdateNote, editingNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [editingNote, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const noteData = { title, content };

    if (editingNote) {
      onUpdateNote({ ...noteData, id: editingNote.id, createdAt: editingNote.createdAt });
    } else {
      onAddNote(noteData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{editingNote ? 'Edit Note' : 'Add New Note'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input type="text" id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
            </div>

            <div>
              <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
              <textarea id="note-content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
              <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">{editingNote ? 'Save Changes' : 'Add Note'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};