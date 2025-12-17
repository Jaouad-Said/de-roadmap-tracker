'use client';

import { use } from 'react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import SectionDetail from '@/components/roadmap/SectionDetail';
import { notFound } from 'next/navigation';

interface SectionPageProps {
  params: Promise<{ phaseId: string; sectionId: string }>;
}

export default function SectionPage({ params }: SectionPageProps) {
  const { phaseId, sectionId } = use(params);
  const { roadmap } = useRoadmapStore();
  
  const phase = roadmap?.phases.find(p => p.id === phaseId);
  const section = phase?.sections.find(s => s.id === sectionId);
  
  if (!phase || !section) {
    notFound();
  }
  
  return <SectionDetail phase={phase} section={section} />;
}
