'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Target, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import ProgressStats from '@/components/progress/ProgressStats';
import ProgressBar from '@/components/progress/ProgressBar';

export default function HomePage() {
  const { roadmap, progress, notes } = useRoadmapStore();
  const stats = useMemo(() => useRoadmapStore.getState().getStats(), [roadmap, progress, notes]);
  
  // Find next section to work on (first in-progress or first not-started)
  const getNextSection = () => {
    if (!roadmap) return null;
    
    for (const phase of roadmap.phases) {
      for (const section of phase.sections) {
        const sectionStatus = useRoadmapStore.getState().getSectionProgress(section.id);
        if (sectionStatus.status === 'in-progress') {
          return { phase, section };
        }
      }
    }
    
    // If no in-progress, find first not-started
    for (const phase of roadmap.phases) {
      for (const section of phase.sections) {
        const sectionStatus = useRoadmapStore.getState().getSectionProgress(section.id);
        if (sectionStatus.status === 'not-started') {
          return { phase, section };
        }
      }
    }
    
    return null;
  };
  
  const nextSection = getNextSection();
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress on the Data Engineering learning roadmap
        </p>
      </div>
      
      {/* Overall Progress Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Overall Progress</h2>
            <p className="text-blue-100 text-sm">
              {stats.completedSections} of {stats.totalSections} sections completed
            </p>
          </div>
          <div className="text-5xl font-bold">{stats.overallProgress}%</div>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${stats.overallProgress}%` }}
          />
        </div>
      </div>
      
      {/* Stats Cards */}
      <ProgressStats />
      
      {/* Next Section to Work On */}
      {nextSection && (
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Up Next
          </h2>
          
          <Link
            href={`/roadmap/${nextSection.phase.id}/${nextSection.section.id}`}
            className="block p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Phase {nextSection.phase.order}: {nextSection.phase.title}
                </p>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {nextSection.section.title}
                </h3>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>
        </div>
      )}
      
      {/* Phase Progress */}
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Progress by Phase
        </h2>
        
        <div className="space-y-4">
          {stats.phaseProgress.map((phase, index) => (
            <div key={phase.phaseId}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </span>
                  <Link
                    href={`/roadmap/${phase.phaseId}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-500 transition-colors"
                  >
                    {phase.title}
                  </Link>
                </div>
                <span className="text-sm text-gray-500">
                  {phase.completed}/{phase.total}
                </span>
              </div>
              <ProgressBar progress={phase.progress} size="sm" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/roadmap"
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">View Full Roadmap</h3>
            <p className="text-sm text-gray-500">Explore all phases and sections</p>
          </div>
        </Link>
        
        <Link
          href="/notes"
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
        >
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Clock className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Your Notes</h3>
            <p className="text-sm text-gray-500">{stats.totalNotes} notes across all sections</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
