'use client';

import { useMemo } from 'react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { CheckCircle2, PlayCircle, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProgressStats() {
  const { roadmap, progress, notes } = useRoadmapStore();
  const stats = useMemo(() => useRoadmapStore.getState().getStats(), [roadmap, progress, notes]);
  
  const statCards = [
    {
      label: 'Completed',
      value: stats.completedSections,
      total: stats.totalSections,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'In Progress',
      value: stats.inProgressSections,
      total: stats.totalSections,
      icon: PlayCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Not Started',
      value: stats.notStartedSections,
      total: stats.totalSections,
      icon: Circle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map(({ label, value, total, icon: Icon, color, bgColor }) => (
        <div
          key={label}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl", bgColor)}>
              <Icon className={cn("w-6 h-6", color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
                <span className="text-base font-normal text-gray-500 ml-1">
                  / {total}
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
