'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({
  progress,
  showLabel = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const isCompleted = clampedProgress === 100;
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
        heights[size]
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isCompleted ? "bg-green-500" : "bg-blue-500"
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn(
          "text-gray-600 dark:text-gray-400 font-medium",
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}
