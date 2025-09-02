import React from 'react';
import { Note } from '../types';
import { PlusCircleIcon, PencilIcon, TrashIcon } from './Icon';

interface NotesViewProps {
  notes: Note[];
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

const NoteCard: React.FC<{ note: Note; onEdit: (note: Note) => void; onDelete: (noteId: string) => void }> = ({ note, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 flex flex-col justify-between border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:border-gray-600 transition-shadow">
            <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate mb-2">{note.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm break-words line-clamp-4">{note.content}</p>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <div className="flex items-center space-x-2">
                     <button
                        onClick={() => onEdit(note)}
                        className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                        aria-label="Edit note"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(note.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                        aria-label="Delete note"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const NotesView: React.FC<NotesViewProps> = ({ notes, onAddNote, onEditNote, onDeleteNote }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">My Notes</h2>
        <button
          onClick={onAddNote}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Add New Note
        </button>
      </div>
      
      {notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
                <NoteCard key={note.id} note={note} onEdit={onEditNote} onDelete={onDeleteNote} />
            ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No notes yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Click "Add New Note" to get started.</p>
        </div>
      )}
    </div>
  );
};