'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Link,
  ListTodo,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Topic, TopicTask, TopicNote, TopicResource } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { cn, formatDate } from '@/lib/utils';

interface TopicDetailProps {
  topic: Topic;
  phaseId: string;
  sectionId: string;
}

export default function TopicDetail({ topic, phaseId, sectionId }: TopicDetailProps) {
  const {
    toggleTopicComplete,
    updateTopic,
    addTopicTask,
    toggleTopicTask,
    deleteTopicTask,
    addTopicNote,
    deleteTopicNote,
    addTopicResource,
    deleteTopicResource,
  } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  
  const [expanded, setExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(topic.title);
  
  // Add new items
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [showAddResource, setShowAddResource] = useState(false);

  const tasks = topic.tasks || [];
  const notes = topic.notes || [];
  const resources = topic.resources || [];
  const hasContent = tasks.length > 0 || notes.length > 0 || resources.length > 0;

  const handleToggleComplete = async () => {
    await toggleTopicComplete(phaseId, sectionId, topic.id);
    showToast(topic.completed ? 'Topic marked incomplete' : 'Topic completed!', 'success');
  };

  const handleSaveTitle = async () => {
    if (editedTitle.trim() && editedTitle !== topic.title) {
      await updateTopic(phaseId, sectionId, topic.id, { title: editedTitle.trim() });
      showToast('Topic updated', 'success');
    }
    setIsEditingTitle(false);
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      const task: TopicTask = {
        id: uuidv4(),
        title: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      await addTopicTask(phaseId, sectionId, topic.id, task);
      setNewTask('');
      showToast('Task added', 'success');
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      const note: TopicNote = {
        id: uuidv4(),
        content: newNote.trim(),
        createdAt: new Date().toISOString(),
      };
      await addTopicNote(phaseId, sectionId, topic.id, note);
      setNewNote('');
      showToast('Note added', 'success');
    }
  };

  const handleAddResource = async () => {
    if (newResourceTitle.trim()) {
      const resource: TopicResource = {
        id: uuidv4(),
        type: newResourceUrl.trim() ? 'link' : 'file',
        title: newResourceTitle.trim(),
        url: newResourceUrl.trim() || '#',
        createdAt: new Date().toISOString(),
      };
      await addTopicResource(phaseId, sectionId, topic.id, resource);
      setNewResourceTitle('');
      setNewResourceUrl('');
      setShowAddResource(false);
      showToast('Resource added', 'success');
    }
  };

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-colors",
      topic.completed
        ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
    )}>
      {/* Topic Header */}
      <div className="flex items-center gap-2 p-3">
        {/* Expand button */}
        {(hasContent || editMode) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Complete toggle */}
        <button
          onClick={handleToggleComplete}
          className={cn(
            "transition-colors",
            topic.completed ? "text-green-500" : "text-gray-400 hover:text-green-500"
          )}
        >
          {topic.completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Title */}
        {isEditingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              autoFocus
            />
            <button onClick={handleSaveTitle} className="p-1 text-green-500 hover:text-green-600">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => { setIsEditingTitle(false); setEditedTitle(topic.title); }} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span
            className={cn(
              "flex-1 text-sm",
              topic.completed && "line-through text-gray-500"
            )}
            onDoubleClick={() => editMode && setIsEditingTitle(true)}
          >
            {topic.title}
          </span>
        )}

        {/* Counts */}
        {!expanded && hasContent && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {tasks.length > 0 && (
              <span className="flex items-center gap-1">
                <ListTodo className="w-3 h-3" />
                {tasks.filter(t => t.completed).length}/{tasks.length}
              </span>
            )}
            {notes.length > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {notes.length}
              </span>
            )}
            {resources.length > 0 && (
              <span className="flex items-center gap-1">
                <Link className="w-3 h-3" />
                {resources.length}
              </span>
            )}
          </div>
        )}

        {/* Edit button */}
        {editMode && !isEditingTitle && (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="p-1 text-gray-400 hover:text-blue-500"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-700/50 space-y-4">
          {/* Tasks */}
          <div>
            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
              <ListTodo className="w-3 h-3" />
              Tasks ({tasks.filter(t => t.completed).length}/{tasks.length})
            </h5>
            <div className="space-y-1">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleTopicTask(phaseId, sectionId, topic.id, task.id)}
                    className={cn(
                      "transition-colors",
                      task.completed ? "text-green-500" : "text-gray-400 hover:text-green-500"
                    )}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <span className={cn(
                    "flex-1 text-sm",
                    task.completed && "line-through text-gray-400"
                  )}>
                    {task.title}
                  </span>
                  {editMode && (
                    <button
                      onClick={() => deleteTopicTask(phaseId, sectionId, topic.id, task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {editMode && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Add task..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-transparent"
                  />
                  <button
                    onClick={handleAddTask}
                    className="p-1 text-gray-400 hover:text-green-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Notes ({notes.length})
            </h5>
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="flex items-start gap-2 group bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  {editMode && (
                    <button
                      onClick={() => deleteTopicNote(phaseId, sectionId, topic.id, note.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {editMode && (
                <div className="flex items-start gap-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add note..."
                    rows={2}
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-transparent resize-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="p-1 text-gray-400 hover:text-green-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
              <Link className="w-3 h-3" />
              Resources ({resources.length})
            </h5>
            <div className="space-y-1">
              {resources.map((resource) => (
                <div key={resource.id} className="flex items-center gap-2 group">
                  <Link className="w-4 h-4 text-gray-400" />
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {resource.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                      {resource.title}
                    </span>
                  )}
                  {editMode && (
                    <button
                      onClick={() => deleteTopicResource(phaseId, sectionId, topic.id, resource.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {editMode && (
                showAddResource ? (
                  <div className="space-y-2 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <input
                      type="text"
                      value={newResourceTitle}
                      onChange={(e) => setNewResourceTitle(e.target.value)}
                      placeholder="Resource title..."
                      className="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-transparent"
                    />
                    <input
                      type="url"
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      placeholder="URL (optional)..."
                      className="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-transparent"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddResource(false)}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddResource}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddResource(true)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-500 mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add resource
                  </button>
                )
              )}
            </div>
          </div>

          {/* Timestamps */}
          {(topic.startedAt || topic.completedAt) && (
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/50">
              {topic.startedAt && <span>Started: {formatDate(topic.startedAt)}</span>}
              {topic.completedAt && <span className="text-green-500">Completed: {formatDate(topic.completedAt)}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
