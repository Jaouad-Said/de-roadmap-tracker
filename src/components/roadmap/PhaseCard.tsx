'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Clock, BookOpen } from 'lucide-react';
import { Phase } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { cn } from '@/lib/utils';
import SectionCard from './SectionCard';

interface PhaseCardProps {
  phase: Phase;
  defaultExpanded?: boolean;
}

export default function PhaseCard({ phase, defaultExpanded = false }: PhaseCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { progress } = useRoadmapStore();
  
  // Calculate phase progress
  const completedSections = phase.sections.filter(
    s => progress?.sections[s.id]?.status === 'completed'
  ).length;
  const totalSections = phase.sections.length;
  const progressPercent = totalSections > 0
    ? Math.round((completedSections / totalSections) * 100)
    : 0;
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg",
          progressPercent === 100
            ? "bg-green-500"
            : progressPercent > 0
            ? "bg-blue-500"
            : "bg-gray-400"
        )}>
          {phase.order}
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {phase.title}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {phase.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {totalSections} sections
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {phase.description}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  progressPercent === 100
                    ? "bg-green-500"
                    : "bg-blue-500"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {completedSections}/{totalSections}
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-5 space-y-3">
          {phase.sections.map(section => (
            <SectionCard
              key={section.id}
              section={section}
              phaseId={phase.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
