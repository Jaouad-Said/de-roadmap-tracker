'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, PlayCircle, ArrowRight } from 'lucide-react';
import { Section } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  section: Section;
  phaseId: string;
  compact?: boolean;
}

export default function SectionCard({ section, phaseId, compact = false }: SectionCardProps) {
  const { progress } = useRoadmapStore();
  const sectionProgress = progress?.sections[section.id];
  const status = sectionProgress?.status || 'not-started';
  const progressPercent = sectionProgress?.progress || 0;
  
  const statusIcons = {
    'not-started': <Circle className="w-5 h-5 text-gray-400" />,
    'in-progress': <PlayCircle className="w-5 h-5 text-blue-500" />,
    'completed': <CheckCircle2 className="w-5 h-5 text-green-500" />,
  };
  
  const statusLabels = {
    'not-started': 'Not Started',
    'in-progress': 'In Progress',
    'completed': 'Completed',
  };
  
  const statusBadgeColors = {
    'not-started': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    'in-progress': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'completed': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  };
  
  if (compact) {
    return (
      <Link
        href={`/roadmap/${phaseId}/${section.id}`}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {statusIcons[status]}
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
          {section.title}
        </span>
        <span className="text-xs text-gray-500">{progressPercent}%</span>
      </Link>
    );
  }
  
  return (
    <Link
      href={`/roadmap/${phaseId}/${section.id}`}
      className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all bg-gray-50 dark:bg-gray-800/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {statusIcons[status]}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {section.title}
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {section.topics.slice(0, 3).map((topic, i) => {
                const topicTitle = typeof topic === 'string' ? topic : topic.title;
                return (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {topicTitle.length > 30 ? topicTitle.substring(0, 30) + '...' : topicTitle}
                  </span>
                );
              })}
              {section.topics.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-500">
                  +{section.topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={cn(
            "px-2 py-1 text-xs font-medium rounded-full",
            statusBadgeColors[status]
          )}>
            {statusLabels[status]}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {/* Progress bar for in-progress items */}
      {status === 'in-progress' && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{progressPercent}%</span>
        </div>
      )}
    </Link>
  );
}
