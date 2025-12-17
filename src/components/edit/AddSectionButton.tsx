'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';

interface AddSectionButtonProps {
  phaseId: string;
  className?: string;
}

export default function AddSectionButton({ phaseId, className }: AddSectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [topics, setTopics] = useState('');
  const [why, setWhy] = useState('');
  const [how, setHow] = useState('');
  const { addSection, isSaving } = useRoadmapStore();
  const { showToast } = useUIStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showToast('Please enter a section title', 'error');
      return;
    }
    
    const topicsList = topics
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    await addSection(phaseId, {
      title: title.trim(),
      topics: topicsList,
      why: why.trim(),
      how: how.trim(),
    });
    
    showToast('Section added successfully', 'success');
    setTitle('');
    setTopics('');
    setWhy('');
    setHow('');
    setIsOpen(false);
  };
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors text-sm ${className}`}
      >
        <Plus className="w-4 h-4" />
        Add Section
      </button>
    );
  }
  
  return (
    <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Add New Section
        </h4>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Section Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Advanced SQL Techniques"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Topics (one per line)
          </label>
          <textarea
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Why This Matters
          </label>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Explain why this section is important..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            How to Learn
          </label>
          <textarea
            value={how}
            onChange={(e) => setHow(e.target.value)}
            placeholder="Suggest how to learn this section..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? 'Adding...' : 'Add Section'}
          </button>
        </div>
      </form>
    </div>
  );
}
