'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import ProgressBar from '@/components/progress/ProgressBar';
import { formatDate } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Dynamic imports for charts to avoid SSR issues
const ProgressChart = dynamic(() => import('@/components/dashboard/ProgressChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />,
});

const StatusDistributionChart = dynamic(() => import('@/components/dashboard/StatusDistributionChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />,
});

const PhaseProgressChart = dynamic(() => import('@/components/dashboard/PhaseProgressChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />,
});

const ActivityChart = dynamic(() => import('@/components/dashboard/ActivityChart'), {
  ssr: false,
  loading: () => <div className="h-[200px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />,
});

export default function DashboardPage() {
  const { roadmap, progress, notes } = useRoadmapStore();
  
  const stats = useMemo(() => useRoadmapStore.getState().getStats(), [roadmap, progress, notes]);
  const notesList = notes?.notes || [];
  
  // Calculate phase progress data
  const phaseProgressData = useMemo(() => {
    if (!roadmap) return [];
    
    return roadmap.phases
      .sort((a, b) => a.order - b.order)
      .map(phase => {
        const total = phase.sections.length;
        const completed = phase.sections.filter(
          s => progress?.sections[s.id]?.status === 'completed'
        ).length;
        const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return {
          name: phase.title.length > 20 ? phase.title.slice(0, 20) + '...' : phase.title,
          progress: progressPercent,
          completed,
          total,
        };
      });
  }, [roadmap, progress]);
  
  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    if (!roadmap) return [];
    
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    
    roadmap.phases.forEach(phase => {
      phase.sections.forEach(section => {
        const status = progress?.sections[section.id]?.status || 'not-started';
        if (status === 'completed') completed++;
        else if (status === 'in-progress') inProgress++;
        else notStarted++;
      });
    });
    
    return [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'In Progress', value: inProgress, color: '#f59e0b' },
      { name: 'Not Started', value: notStarted, color: '#e5e7eb' },
    ];
  }, [roadmap, progress]);
  
  // Cumulative progress over phases (simulated timeline)
  const progressOverTime = useMemo(() => {
    if (!roadmap) return [];
    
    let cumulative = 0;
    const totalSections = roadmap.phases.reduce((sum, p) => sum + p.sections.length, 0);
    
    return roadmap.phases
      .sort((a, b) => a.order - b.order)
      .map(phase => {
        const completed = phase.sections.filter(
          s => progress?.sections[s.id]?.status === 'completed'
        ).length;
        cumulative += completed;
        
        return {
          name: `Phase ${phase.order}`,
          progress: totalSections > 0 ? Math.round((cumulative / totalSections) * 100) : 0,
        };
      });
  }, [roadmap, progress]);
  
  // Activity data (last 7 days - based on notes)
  const activityData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count notes for this day
      const noteCount = notesList.filter(n => 
        n.updatedAt.startsWith(dateStr) || n.createdAt.startsWith(dateStr)
      ).length;
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        activities: noteCount,
      });
    }
    
    return days;
  }, [notesList]);
  
  // Find next section to work on
  const nextSection = useMemo(() => {
    if (!roadmap) return null;
    
    for (const phase of roadmap.phases.sort((a, b) => a.order - b.order)) {
      for (const section of phase.sections.sort((a, b) => a.order - b.order)) {
        const status = progress?.sections[section.id]?.status;
        if (status === 'in-progress') {
          return { phase, section };
        }
      }
    }
    
    for (const phase of roadmap.phases.sort((a, b) => a.order - b.order)) {
      for (const section of phase.sections.sort((a, b) => a.order - b.order)) {
        const status = progress?.sections[section.id]?.status;
        if (!status || status === 'not-started') {
          return { phase, section };
        }
      }
    }
    
    return null;
  }, [roadmap, progress]);
  
  // Recent notes
  const recentNotes = useMemo(() => {
    return [...notesList]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [notesList]);
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your data engineering learning progress
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.overallProgress}%
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Completed</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.completedSections}
            <span className="text-lg font-normal text-gray-500">/{stats.totalSections}</span>
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">In Progress</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.inProgressSections}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Notes</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {notesList.length}
          </p>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progress Over Time */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Progress by Phase</h2>
          </div>
          <ProgressChart data={progressOverTime} />
        </div>
        
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Status Distribution</h2>
          </div>
          <StatusDistributionChart data={statusDistribution} />
        </div>
      </div>
      
      {/* Phase Progress */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Phase Progress</h2>
        </div>
        <PhaseProgressChart data={phaseProgressData} />
      </div>
      
      {/* Activity & Next Up */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Activity (Last 7 Days)</h2>
          </div>
          <ActivityChart data={activityData} />
        </div>
        
        {/* Next Up & Recent Notes */}
        <div className="space-y-6">
          {/* Continue Learning */}
          {nextSection && (
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-sm font-medium text-blue-100 mb-2">Continue Learning</h3>
              <p className="text-lg font-semibold mb-1">{nextSection.section.title}</p>
              <p className="text-sm text-blue-100 mb-4">{nextSection.phase.title}</p>
              <Link
                href={`/roadmap/${nextSection.phase.id}/${nextSection.section.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
          
          {/* Recent Notes */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Notes</h3>
              <Link href="/notes" className="text-sm text-blue-500 hover:text-blue-600">
                View all
              </Link>
            </div>
            
            {recentNotes.length > 0 ? (
              <div className="space-y-3">
                {recentNotes.map(note => (
                  <div
                    key={note.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {note.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(note.updatedAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No notes yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
