'use client';

import { useState } from 'react';
import {
  Plus,
  Check,
  X,
} from 'lucide-react';
import { Topic } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { createTopic } from '@/lib/migrateData';
import TopicDetail from './TopicDetail';

interface TopicsListProps {
  phaseId: string;
  sectionId: string;
  topics: Topic[];
}

export default function TopicsList({ phaseId, sectionId, topics }: TopicsListProps) {
  const { addTopic } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTopic = async () => {
    if (!newTopicTitle.trim()) return;
    
    const topic = createTopic(newTopicTitle.trim(), sectionId);
    await addTopic(phaseId, sectionId, topic);
    setNewTopicTitle('');
    setIsAdding(false);
    showToast('Topic added successfully', 'success');
  };

  const completedCount = topics.filter(t => t.completed).length;

  return (
    <div className="space-y-3">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{completedCount} of {topics.length} completed</span>
        {topics.length > 0 && (
          <span className="font-medium">
            {Math.round((completedCount / topics.length) * 100)}%
          </span>
        )}
      </div>

      {/* Topics list */}
      <div className="space-y-2">
        {topics.map((topic) => (
          <TopicDetail
            key={topic.id}
            topic={topic}
            phaseId={phaseId}
            sectionId={sectionId}
          />
        ))}
      </div>

      {/* Add new topic */}
      {editMode && (
        <div className="pt-2">
          {isAdding ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTopic();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewTopicTitle('');
                  }
                }}
                placeholder="Enter topic title..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleAddTopic}
                className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewTopicTitle('');
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          )}
        </div>
      )}
    </div>
  );
}
