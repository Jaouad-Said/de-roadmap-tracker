'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Home,
  Map,
  FileText,
  BookOpen,
  X,
  BarChart3,
  FolderKanban,
  Settings,
} from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { roadmap, progress } = useRoadmapStore();
  const { sidebarOpen, searchQuery, setSearchQuery, filterStatus, setFilterStatus } = useUIStore();
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  
  if (!sidebarOpen) return null;
  
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };
  
  const getPhaseProgress = (phaseId: string) => {
    if (!roadmap || !progress) return 0;
    const phase = roadmap.phases.find(p => p.id === phaseId);
    if (!phase) return 0;
    
    const completed = phase.sections.filter(
      s => progress.sections[s.id]?.status === 'completed'
    ).length;
    return phase.sections.length > 0
      ? Math.round((completed / phase.sections.length) * 100)
      : 0;
  };
  
  const getSectionStatus = (sectionId: string) => {
    return progress?.sections[sectionId]?.status || 'not-started';
  };
  
  const filteredPhases = roadmap?.phases.map(phase => ({
    ...phase,
    sections: phase.sections.filter(section => {
      const matchesSearch = !searchQuery || 
        section.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
        getSectionStatus(section.id) === filterStatus;
      return matchesSearch && matchesFilter;
    }),
  })).filter(phase => phase.sections.length > 0 || !searchQuery);
  
  const statusColors = {
    'not-started': 'bg-gray-400',
    'in-progress': 'bg-blue-500',
    'completed': 'bg-green-500',
  };
  
  return (
    <aside className="w-72 bg-gray-900 text-gray-100 h-screen flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">DE Roadmap</span>
        </Link>
      </div>
      
      {/* Search */}
      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="w-full mt-2 bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Sections</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      {/* Navigation Links */}
      <nav className="p-3 border-b border-gray-800">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === '/' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-1",
            pathname === '/dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard
        </Link>
        <Link
          href="/roadmap"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-1",
            pathname.startsWith('/roadmap') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Map className="w-4 h-4" />
          Roadmap
        </Link>
        <Link
          href="/notes"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-1",
            pathname === '/notes' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <FileText className="w-4 h-4" />
          All Notes
        </Link>
        <Link
          href="/resources"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-1",
            pathname === '/resources' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Resources
        </Link>
        <Link
          href="/projects"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-1",
            pathname === '/projects' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <FolderKanban className="w-4 h-4" />
          Projects
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-1",
            pathname === '/settings' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </nav>
      
      {/* Phases List */}
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Learning Path
        </h3>
        
        {filteredPhases?.map(phase => (
          <div key={phase.id} className="mb-2">
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              {expandedPhases[phase.id] ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span className="flex-1 text-left truncate">{phase.title}</span>
              <span className="text-xs text-gray-500">{getPhaseProgress(phase.id)}%</span>
            </button>
            
            {expandedPhases[phase.id] && (
              <div className="ml-4 mt-1 space-y-1">
                {phase.sections.map(section => {
                  const status = getSectionStatus(section.id);
                  return (
                    <Link
                      key={section.id}
                      href={`/roadmap/${phase.id}/${section.id}`}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                        pathname === `/roadmap/${phase.id}/${section.id}`
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full", statusColors[status])} />
                      <span className="truncate">{section.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
