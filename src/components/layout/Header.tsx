'use client';

import { Menu, Moon, Sun, Edit, Eye, Save, Loader2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { cn } from '@/lib/utils';
import SearchModal from '@/components/ui/SearchModal';

export default function Header() {
  const { editMode, toggleEditMode, toggleSidebar, sidebarOpen } = useUIStore();
  const { isSaving } = useRoadmapStore();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <>
      <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Engineering Roadmap
            </h1>
            {isSaving && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Search</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          {/* Edit Mode Toggle */}
          <button
            onClick={toggleEditMode}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              editMode
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {editMode ? (
              <>
                <Eye className="w-4 h-4" />
                View Mode
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit Mode
              </>
            )}
          </button>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
