'use client';

import { Menu, Moon, Sun, Edit, Eye, Save, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { cn } from '@/lib/utils';

export default function Header() {
  const { editMode, toggleEditMode, toggleSidebar, sidebarOpen } = useUIStore();
  const { isSaving } = useRoadmapStore();
  
  return (
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
  );
}
