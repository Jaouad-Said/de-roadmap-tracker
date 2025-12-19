'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, FileText, BookOpen, FolderGit2, Link, ArrowRight } from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'section' | 'topic' | 'note' | 'project' | 'resource';
  title: string;
  description?: string;
  url: string;
  breadcrumb?: string;
  matchText?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { roadmap, notes, projects, resources } = useRoadmapStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Build search index
  const searchIndex = useMemo(() => {
    const results: SearchResult[] = [];

    // Index roadmap sections and topics
    roadmap?.phases.forEach(phase => {
      phase.sections.forEach(section => {
        results.push({
          id: section.id,
          type: 'section',
          title: section.title,
          description: section.why?.slice(0, 100),
          url: `/roadmap/${phase.id}/${section.id}`,
          breadcrumb: phase.title,
        });

        // Handle both string topics (legacy) and object topics
        section.topics.forEach((topic, index) => {
          const topicTitle = typeof topic === 'string' ? topic : topic.title;
          const topicId = typeof topic === 'string' ? `topic-${section.id}-${index}` : topic.id;
          
          results.push({
            id: topicId,
            type: 'topic',
            title: topicTitle,
            url: `/roadmap/${phase.id}/${section.id}`,
            breadcrumb: `${phase.title} › ${section.title}`,
          });
        });
      });
    });

    // Index notes
    notes?.notes.forEach(note => {
      results.push({
        id: note.id,
        type: 'note',
        title: note.title,
        description: note.content.replace(/<[^>]*>/g, '').slice(0, 100),
        url: '/notes',
        breadcrumb: note.tags?.join(', '),
      });
    });

    // Index projects
    projects?.projects.forEach(project => {
      results.push({
        id: project.id,
        type: 'project',
        title: project.title,
        description: project.description?.slice(0, 100),
        url: '/projects',
        breadcrumb: project.technologies?.slice(0, 3).join(', '),
      });
    });

    // Index resources
    resources?.resources.forEach(resource => {
      results.push({
        id: resource.id,
        type: 'resource',
        title: resource.title,
        description: resource.description?.slice(0, 100),
        url: '/resources',
        breadcrumb: resource.type,
      });
    });

    return results;
  }, [roadmap, notes, projects, resources]);

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/).filter(Boolean);

    return searchIndex
      .filter(item => {
        const searchText = `${item.title} ${item.description || ''} ${item.breadcrumb || ''}`.toLowerCase();
        return words.every(word => searchText.includes(word));
      })
      .slice(0, 10); // Limit to 10 results
  }, [query, searchIndex]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          navigateToResult(filteredResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Global keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  const navigateToResult = (result: SearchResult) => {
    router.push(result.url);
    onClose();
    setQuery('');
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'section':
        return <BookOpen className="w-4 h-4" />;
      case 'topic':
        return <BookOpen className="w-4 h-4 opacity-60" />;
      case 'note':
        return <FileText className="w-4 h-4" />;
      case 'project':
        return <FolderGit2 className="w-4 h-4" />;
      case 'resource':
        return <Link className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'section':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/30';
      case 'topic':
        return 'text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'note':
        return 'text-green-500 bg-green-50 dark:bg-green-900/30';
      case 'project':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-900/30';
      case 'resource':
        return 'text-orange-500 bg-orange-50 dark:bg-orange-900/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-[15vh]">
        <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections, notes, projects..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-lg"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() === '' ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Start typing to search across your roadmap, notes, and projects</p>
                <p className="text-sm mt-2 text-gray-400">
                  Use <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">↑</kbd> <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd> to select
                </p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1 text-gray-400">Try different keywords</p>
              </div>
            ) : (
              <ul className="py-2">
                {filteredResults.map((result, index) => (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      onClick={() => navigateToResult(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full px-4 py-3 flex items-start gap-3 text-left transition-colors",
                        index === selectedIndex
                          ? "bg-purple-50 dark:bg-purple-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <span className={cn("p-1.5 rounded", getTypeColor(result.type))}>
                        {getIcon(result.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">
                            {result.type}
                          </span>
                        </div>
                        {result.breadcrumb && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {result.breadcrumb}
                          </p>
                        )}
                        {result.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                            {result.description}
                          </p>
                        )}
                      </div>
                      {index === selectedIndex && (
                        <ArrowRight className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {filteredResults.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 flex items-center justify-between">
              <span>{filteredResults.length} results</span>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↵</kbd>
                <span>to open</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
