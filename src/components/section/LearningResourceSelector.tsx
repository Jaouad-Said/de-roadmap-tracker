'use client';

import { useState } from 'react';
import {
  Youtube,
  BookOpen,
  GraduationCap,
  Link,
  X,
  Check,
  Plus,
  ExternalLink,
  Calendar,
  User,
  FileText,
  Globe,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { LearningResource } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { cn, formatDate } from '@/lib/utils';

interface LearningResourceSelectorProps {
  phaseId: string;
  sectionId: string;
  currentResource?: LearningResource;
}

type ResourceType = 'youtube' | 'course' | 'book' | 'documentation' | 'tutorial' | 'other';

const resourceTypeConfig: Record<ResourceType, { icon: typeof Youtube; label: string; color: string }> = {
  youtube: { icon: Youtube, label: 'YouTube', color: 'text-red-500' },
  course: { icon: GraduationCap, label: 'Online Course', color: 'text-blue-500' },
  book: { icon: BookOpen, label: 'Book', color: 'text-green-500' },
  documentation: { icon: FileText, label: 'Documentation', color: 'text-orange-500' },
  tutorial: { icon: Globe, label: 'Tutorial', color: 'text-purple-500' },
  other: { icon: Link, label: 'Other', color: 'text-gray-500' },
};

export default function LearningResourceSelector({
  phaseId,
  sectionId,
  currentResource,
}: LearningResourceSelectorProps) {
  const { setLearningResource, removeLearningResource } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [type, setType] = useState<ResourceType>(currentResource?.type || 'youtube');
  const [title, setTitle] = useState(currentResource?.title || '');
  const [url, setUrl] = useState(currentResource?.url || '');
  const [platform, setPlatform] = useState(currentResource?.platform || '');
  const [author, setAuthor] = useState(currentResource?.author || '');
  const [startedAt, setStartedAt] = useState(currentResource?.startedAt || '');
  const [completedAt, setCompletedAt] = useState(currentResource?.completedAt || '');

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please enter a resource title', 'error');
      return;
    }

    const resource: LearningResource = {
      id: currentResource?.id || uuidv4(),
      type,
      title: title.trim(),
      url: url.trim() || undefined,
      platform: platform.trim() || undefined,
      author: author.trim() || undefined,
      startedAt: startedAt || undefined,
      completedAt: completedAt || undefined,
    };

    await setLearningResource(phaseId, sectionId, resource);
    setIsEditing(false);
    showToast('Learning resource saved', 'success');
  };

  const handleRemove = async () => {
    await removeLearningResource(phaseId, sectionId);
    setType('youtube');
    setTitle('');
    setUrl('');
    setPlatform('');
    setAuthor('');
    setStartedAt('');
    setCompletedAt('');
    showToast('Learning resource removed', 'success');
  };

  const handleCancel = () => {
    setType(currentResource?.type || 'youtube');
    setTitle(currentResource?.title || '');
    setUrl(currentResource?.url || '');
    setPlatform(currentResource?.platform || '');
    setAuthor(currentResource?.author || '');
    setStartedAt(currentResource?.startedAt || '');
    setCompletedAt(currentResource?.completedAt || '');
    setIsEditing(false);
  };

  // Display mode
  if (!isEditing && currentResource) {
    const config = resourceTypeConfig[currentResource.type];
    const Icon = config.icon;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm", config.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase">
                  Learning Resource
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-800", config.color)}>
                  {config.label}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mt-1">
                {currentResource.title}
              </h4>
              {(currentResource.platform || currentResource.author) && (
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  {currentResource.platform && (
                    <span>{currentResource.platform}</span>
                  )}
                  {currentResource.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {currentResource.author}
                    </span>
                  )}
                </div>
              )}
              {(currentResource.startedAt || currentResource.completedAt) && (
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {currentResource.startedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Started {formatDate(currentResource.startedAt)}
                    </span>
                  )}
                  {currentResource.completedAt && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" />
                      Completed {formatDate(currentResource.completedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentResource.url && (
              <a
                href={currentResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {editMode && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={handleRemove}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Edit/Add mode
  if (isEditing || (editMode && !currentResource)) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {currentResource ? 'Edit Learning Resource' : 'Add Learning Resource'}
        </h4>
        
        {/* Resource Type */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.entries(resourceTypeConfig) as [ResourceType, typeof resourceTypeConfig[ResourceType]][]).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setType(key)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                  type === key
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <Icon className={cn("w-4 h-4", config.color)} />
                <span className="text-sm">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Title */}
        <div className="mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource title *"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* URL */}
        <div className="mb-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Platform & Author */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder={type === 'youtube' ? 'Channel name' : type === 'course' ? 'Platform (Udemy, etc.)' : 'Publisher'}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author/Instructor"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Started</label>
            <input
              type="date"
              value={startedAt ? startedAt.split('T')[0] : ''}
              onChange={(e) => setStartedAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Completed</label>
            <input
              type="date"
              value={completedAt ? completedAt.split('T')[0] : ''}
              onChange={(e) => setCompletedAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    );
  }

  // No resource and not in edit mode - show add button
  if (editMode) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Learning Resource
      </button>
    );
  }

  return null;
}
