'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Clock,
  Target,
  Lightbulb,
  CheckCircle2,
  Circle,
  PlayCircle,
  Edit,
  Trash2,
  Save,
  X,
  ListTodo,
  Paperclip,
} from 'lucide-react';
import { Section, Phase, Topic, Task, Attachment } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { cn, formatDate } from '@/lib/utils';
import ProgressTracker from '@/components/progress/ProgressTracker';
import NotesList from '@/components/notes/NotesList';
import { TopicsList, TasksList, AttachmentsList, LearningResourceSelector } from '@/components/section';

interface SectionDetailProps {
  phase: Phase;
  section: Section;
}

export default function SectionDetail({ phase, section: initialSection }: SectionDetailProps) {
  const { progress, updateSection, getSection } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  const [section, setSection] = useState(initialSection);
  const [isEditingWhy, setIsEditingWhy] = useState(false);
  const [isEditingHow, setIsEditingHow] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedWhy, setEditedWhy] = useState(section.why);
  const [editedHow, setEditedHow] = useState(section.how);
  const [editedTitle, setEditedTitle] = useState(section.title);
  
  const sectionProgress = progress?.sections[section.id];
  const status = sectionProgress?.status || 'not-started';

  // Fetch section data on mount to get migrated data
  useEffect(() => {
    const fetchSection = async () => {
      try {
        const res = await fetch(`/api/roadmap/${phase.id}/sections/${section.id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSection(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch section:', error);
      }
    };
    fetchSection();
  }, [phase.id, section.id]);

  // Update local section when store changes
  useEffect(() => {
    const storeSection = getSection(phase.id, section.id);
    if (storeSection) {
      setSection(storeSection);
    }
  }, [getSection, phase.id, section.id]);

  const handleSaveWhy = async () => {
    await updateSection(phase.id, section.id, { why: editedWhy });
    setIsEditingWhy(false);
    showToast('Section updated', 'success');
  };

  const handleSaveHow = async () => {
    await updateSection(phase.id, section.id, { how: editedHow });
    setIsEditingHow(false);
    showToast('Section updated', 'success');
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) return;
    await updateSection(phase.id, section.id, { title: editedTitle.trim() });
    setIsEditingTitle(false);
    showToast('Section updated', 'success');
  };

  // Ensure topics, tasks, attachments are arrays
  const topics: Topic[] = Array.isArray(section.topics) 
    ? (typeof section.topics[0] === 'string' 
        ? (section.topics as unknown as string[]).map((t, i) => ({ 
            id: `topic-${i}`, 
            title: t, 
            completed: false,
            tasks: [],
            notes: [],
            resources: []
          }))
        : section.topics)
    : [];
  const tasks: Task[] = section.tasks || [];
  const attachments: Attachment[] = section.attachments || [];
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/roadmap/${phase.id}`}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Phase {phase.order}: {phase.title}</span>
        </Link>
      </div>
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditingTitle && editMode ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setEditedTitle(section.title);
                    }
                  }}
                  className="flex-1 text-2xl font-bold bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingTitle(false);
                    setEditedTitle(section.title);
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <h1 
                className={cn(
                  "text-2xl font-bold text-gray-900 dark:text-white",
                  editMode && "cursor-pointer hover:text-blue-500"
                )}
                onClick={() => editMode && setIsEditingTitle(true)}
              >
                {section.title}
              </h1>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Section {section.order} of {phase.sections.length}</span>
              {sectionProgress?.startDate && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Started {formatDate(sectionProgress.startDate)}
                </span>
              )}
            </div>
          </div>
          
          {editMode && !isEditingTitle && (
            <button 
              onClick={() => setIsEditingTitle(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Progress Tracker */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <ProgressTracker sectionId={section.id} />
        </div>
      </div>

      {/* Learning Resource */}
      <div className="mb-6">
        <LearningResourceSelector
          phaseId={phase.id}
          sectionId={section.id}
          currentResource={section.learningResource}
        />
      </div>
      
      {/* Topics */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-500" />
          Topics to Cover
        </h2>
        <TopicsList 
          phaseId={phase.id} 
          sectionId={section.id} 
          topics={topics} 
        />
      </div>

      {/* Tasks */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <ListTodo className="w-5 h-5 text-purple-500" />
          Tasks
        </h2>
        <TasksList 
          phaseId={phase.id} 
          sectionId={section.id} 
          tasks={tasks} 
        />
      </div>
      
      {/* Why This Matters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Why This Matters
          </h2>
          {editMode && !isEditingWhy && (
            <button
              onClick={() => setIsEditingWhy(true)}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        {isEditingWhy && editMode ? (
          <div className="space-y-3">
            <textarea
              value={editedWhy}
              onChange={(e) => setEditedWhy(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditingWhy(false);
                  setEditedWhy(section.why);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWhy}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {section.why}
          </p>
        )}
      </div>
      
      {/* How to Learn */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            How to Learn This
          </h2>
          {editMode && !isEditingHow && (
            <button
              onClick={() => setIsEditingHow(true)}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        {isEditingHow && editMode ? (
          <div className="space-y-3">
            <textarea
              value={editedHow}
              onChange={(e) => setEditedHow(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditingHow(false);
                  setEditedHow(section.how);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHow}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {section.how}
          </p>
        )}
      </div>

      {/* Attachments */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Paperclip className="w-5 h-5 text-orange-500" />
          Attachments & Resources
        </h2>
        <AttachmentsList 
          phaseId={phase.id} 
          sectionId={section.id} 
          attachments={attachments} 
        />
      </div>
      
      {/* Notes Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <NotesList sectionId={section.id} />
      </div>
    </div>
  );
}
