'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock, BookOpen, Edit, Trash2 } from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import SectionCard from '@/components/roadmap/SectionCard';
import ProgressBar from '@/components/progress/ProgressBar';
import AddSectionButton from '@/components/edit/AddSectionButton';
import { notFound } from 'next/navigation';

interface PhasePageProps {
  params: Promise<{ phaseId: string }>;
}

export default function PhasePage({ params }: PhasePageProps) {
  const { phaseId } = use(params);
  const { roadmap, progress, deletePhase } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  
  const phase = roadmap?.phases.find(p => p.id === phaseId);
  
  if (!phase) {
    notFound();
  }
  
  // Calculate progress
  const completedSections = phase.sections.filter(
    s => progress?.sections[s.id]?.status === 'completed'
  ).length;
  const totalSections = phase.sections.length;
  const progressPercent = totalSections > 0
    ? Math.round((completedSections / totalSections) * 100)
    : 0;
  
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${phase.title}"? This action cannot be undone.`)) {
      await deletePhase(phase.id);
      showToast('Phase deleted', 'info');
      window.location.href = '/roadmap';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/roadmap"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Roadmap</span>
        </Link>
      </div>
      
      {/* Phase Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {phase.order}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {phase.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {phase.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {totalSections} sections
                </span>
              </div>
            </div>
          </div>
          
          {editMode && (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {phase.description}
        </p>
        
        {/* Progress */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Phase Progress
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {completedSections}/{totalSections} completed
            </span>
          </div>
          <ProgressBar progress={progressPercent} />
        </div>
      </div>
      
      {/* Sections */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sections
        </h2>
        
        {phase.sections
          .sort((a, b) => a.order - b.order)
          .map(section => (
            <SectionCard
              key={section.id}
              section={section}
              phaseId={phase.id}
            />
          ))}
        
        {editMode && <AddSectionButton phaseId={phase.id} />}
        
        {phase.sections.length === 0 && !editMode && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No sections in this phase yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
