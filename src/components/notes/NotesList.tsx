'use client';

import { useState } from 'react';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import ImageUploader from '@/components/images/ImageUploader';

interface NotesListProps {
  sectionId: string;
}

export default function NotesList({ sectionId }: NotesListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const { getSectionNotes, addNote, deleteNote, isSaving } = useRoadmapStore();
  const { showToast } = useUIStore();
  
  const notes = getSectionNotes(sectionId);
  
  const handleAddNote = async () => {
    if (newTitle.trim() && (newContent.trim() || uploadedImages.length > 0)) {
      const note = await addNote(sectionId, newTitle, newContent, uploadedImages);
      if (note) {
        setNewTitle('');
        setNewContent('');
        setUploadedImages([]);
        setIsAdding(false);
        showToast('Note added successfully', 'success');
      }
    }
  };
  
  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    showToast('Note deleted', 'success');
  };
  
  const handleImageUpload = (url: string) => {
    setUploadedImages(prev => [...prev, url]);
  };
  
  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" />
          Notes
          {notes.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({notes.length})
            </span>
          )}
        </h2>
        
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        )}
      </div>
      
      {/* Add Note Form */}
      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full px-3 py-2 mb-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <NoteEditor
            content={newContent}
            onChange={setNewContent}
            placeholder="What did you learn today?"
          />
          
          {/* Image Upload */}
          <div className="mt-4">
            <ImageUploader
              sectionId={sectionId}
              onUpload={handleImageUpload}
            />
            
            {/* Preview uploaded images */}
            {uploadedImages.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {uploadedImages.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      onClick={() => handleRemoveImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTitle('');
                setNewContent('');
                setUploadedImages([]);
              }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              disabled={isSaving || !newTitle.trim() || (!newContent.trim() && uploadedImages.length === 0)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Note'
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onEdit={() => setEditingNoteId(note.id)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notes yet</p>
            <p className="text-sm">Add notes to track your learning progress</p>
          </div>
        )
      )}
    </div>
  );
}
