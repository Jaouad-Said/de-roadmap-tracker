'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Plus, StickyNote, Calendar } from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import NoteCard from '@/components/notes/NoteCard';
import NoteEditor from '@/components/notes/NoteEditor';
import { Note } from '@/types';
import { formatDate } from '@/lib/utils';

export default function NotesPage() {
  const { notes, roadmap, addNote, updateNote, deleteNote } = useRoadmapStore();
  const { showToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Get all notes as array
  const notesList = notes?.notes || [];
  
  // Get all sections for filtering
  const allSections = useMemo(() => {
    return roadmap?.phases.flatMap(phase =>
      phase.sections.map(section => ({
        id: section.id,
        title: section.title,
        phaseTitle: phase.title,
      }))
    ) || [];
  }, [roadmap]);
  
  // Filter notes
  const filteredNotes = useMemo(() => {
    return notesList.filter(note => {
      const matchesSearch = searchQuery === '' ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = selectedSection === 'all' || note.sectionId === selectedSection;
      return matchesSearch && matchesSection;
    });
  }, [notesList, searchQuery, selectedSection]);
  
  // Sort by updated date (most recent first)
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [filteredNotes]);
  
  // Group notes by date
  const groupedNotes = useMemo(() => {
    const groups: { [key: string]: Note[] } = {};
    sortedNotes.forEach(note => {
      const dateKey = formatDate(note.updatedAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(note);
    });
    return groups;
  }, [sortedNotes]);
  
  const handleSaveNote = async (data: { title: string; content: string; sectionId?: string }) => {
    if (editingNote) {
      await updateNote(editingNote.id, data);
      showToast('Note updated', 'success');
      setEditingNote(null);
    } else {
      await addNote(data.sectionId || '', data.title, data.content);
      showToast('Note created', 'success');
      setIsCreating(false);
    }
  };
  
  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
      showToast('Note deleted', 'info');
    }
  };
  
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsCreating(false);
  };
  
  const handleCancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {notesList.length} note{notesList.length !== 1 ? 's' : ''} total
          </p>
        </div>
        
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingNote(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Note</span>
        </button>
      </div>
      
      {/* Note Editor */}
      {(isCreating || editingNote) && (
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
          <NoteEditorForm
            note={editingNote}
            sectionId={selectedSection !== 'all' ? selectedSection : undefined}
            sections={allSections}
            onSave={handleSaveNote}
            onCancel={handleCancelEdit}
          />
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="pl-10 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="all">All Sections</option>
            {allSections.map(section => (
              <option key={section.id} value={section.id}>
                {section.phaseTitle} - {section.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Notes List */}
      {sortedNotes.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedNotes).map(([date, dateNotes]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {date}
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {dateNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => handleEditNote(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedSection !== 'all' ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || selectedSection !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Start taking notes to track your learning journey'}
          </p>
          {!isCreating && !editingNote && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create your first note</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Simple inline note editor form
function NoteEditorForm({
  note,
  sectionId,
  sections,
  onSave,
  onCancel,
}: {
  note: Note | null;
  sectionId?: string;
  sections: { id: string; title: string; phaseTitle: string }[];
  onSave: (data: { title: string; content: string; sectionId?: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [section, setSection] = useState(note?.sectionId || sectionId || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title, content, sectionId: section || undefined });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Section (optional)
        </label>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No section</option>
          {sections.map(s => (
            <option key={s.id} value={s.id}>
              {s.phaseTitle} - {s.title}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          rows={6}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          required
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {note ? 'Update' : 'Create'} Note
        </button>
      </div>
    </form>
  );
}
