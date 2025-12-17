'use client';

import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-2">
            {note.title}
          </h3>
          <div
            className="prose dark:prose-invert prose-sm max-w-none line-clamp-3 text-gray-600 dark:text-gray-400"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
        
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Images */}
      {note.images && note.images.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {note.images.map((img, i) => (
            <div
              key={i}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Timestamp */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
        <span>Created {format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
        {note.updatedAt !== note.createdAt && (
          <span>Edited {format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
        )}
      </div>
    </div>
  );
}
