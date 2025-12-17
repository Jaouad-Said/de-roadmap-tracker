'use client';

import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import PhaseCard from '@/components/roadmap/PhaseCard';
import AddPhaseButton from '@/components/edit/AddPhaseButton';

export default function RoadmapPage() {
  const { roadmap } = useRoadmapStore();
  const { editMode } = useUIStore();
  
  if (!roadmap) return null;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Data Engineering Roadmap
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your complete learning path to becoming a data engineer
        </p>
      </div>
      
      <div className="space-y-4">
        {roadmap.phases
          .sort((a, b) => a.order - b.order)
          .map((phase, index) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              defaultExpanded={index === 0}
            />
          ))}
        
        {editMode && <AddPhaseButton />}
      </div>
    </div>
  );
}
