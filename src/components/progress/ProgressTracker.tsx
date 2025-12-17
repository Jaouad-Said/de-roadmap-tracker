'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, PlayCircle, Loader2 } from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { SectionStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  sectionId: string;
}

export default function ProgressTracker({ sectionId }: ProgressTrackerProps) {
  const { progress, updateProgress, isSaving } = useRoadmapStore();
  const { showToast } = useUIStore();
  const [localProgress, setLocalProgress] = useState<number | null>(null);
  
  const sectionProgress = progress?.sections[sectionId];
  const status = sectionProgress?.status || 'not-started';
  const progressPercent = localProgress ?? sectionProgress?.progress ?? 0;
  
  const handleStatusChange = async (newStatus: SectionStatus) => {
    await updateProgress(sectionId, { status: newStatus });
    showToast(
      newStatus === 'completed'
        ? 'Section marked as completed! 🎉'
        : newStatus === 'in-progress'
        ? 'Section marked as in progress'
        : 'Section marked as not started',
      'success'
    );
    setLocalProgress(null);
  };
  
  const handleProgressChange = async (value: number) => {
    setLocalProgress(value);
  };
  
  const handleProgressCommit = async () => {
    if (localProgress !== null) {
      await updateProgress(sectionId, { progress: localProgress });
      showToast('Progress updated', 'success');
      setLocalProgress(null);
    }
  };
  
  const statusButtons = [
    {
      status: 'not-started' as SectionStatus,
      label: 'Not Started',
      icon: Circle,
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      activeColor: 'bg-gray-500 text-white border-gray-500',
    },
    {
      status: 'in-progress' as SectionStatus,
      label: 'In Progress',
      icon: PlayCircle,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      activeColor: 'bg-blue-500 text-white border-blue-500',
    },
    {
      status: 'completed' as SectionStatus,
      label: 'Completed',
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
      activeColor: 'bg-green-500 text-white border-green-500',
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Status Buttons */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statusButtons.map(({ status: btnStatus, label, icon: Icon, color, activeColor }) => (
            <button
              key={btnStatus}
              onClick={() => handleStatusChange(btnStatus)}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all",
                status === btnStatus ? activeColor : color,
                isSaving && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          {isSaving && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
        </div>
      </div>
      
      {/* Progress Slider */}
      {status !== 'not-started' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </label>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {progressPercent}%
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={(e) => handleProgressChange(Number(e.target.value))}
            onMouseUp={handleProgressCommit}
            onTouchEnd={handleProgressCommit}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:bg-blue-500
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:cursor-pointer"
          />
          
          {/* Progress Bar Visual */}
          <div className="mt-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progressPercent === 100 ? "bg-green-500" : "bg-blue-500"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Quick Progress Buttons */}
          <div className="flex gap-2 mt-3">
            {[0, 25, 50, 75, 100].map(val => (
              <button
                key={val}
                onClick={() => {
                  setLocalProgress(val);
                  updateProgress(sectionId, { progress: val });
                }}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  progressPercent === val
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
