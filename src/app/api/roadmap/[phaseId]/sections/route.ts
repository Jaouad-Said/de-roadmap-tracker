import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/fileSystem';
import { RoadmapData, Section, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

type Params = { params: Promise<{ phaseId: string }> };

// POST /api/roadmap/[phaseId]/sections - Add new section to phase
export async function POST(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Section>>> {
  try {
    const { phaseId } = await context.params;
    const newSection = await request.json() as Partial<Section>;
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    
    const phase = roadmap.phases.find(p => p.id === phaseId);
    if (!phase) {
      return NextResponse.json(
        { success: false, error: 'Phase not found' },
        { status: 404 }
      );
    }
    
    const section: Section = {
      id: newSection.id || `section-${uuidv4().slice(0, 8)}`,
      title: newSection.title || 'New Section',
      topics: newSection.topics || [],
      why: newSection.why || '',
      how: newSection.how || '',
      order: phase.sections.length + 1,
    };
    
    phase.sections.push(section);
    roadmap.lastUpdated = new Date().toISOString();
    await writeJSON('roadmap.json', roadmap);
    
    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add section' },
      { status: 500 }
    );
  }
}

// PUT /api/roadmap/[phaseId]/sections - Reorder sections
export async function PUT(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Section[]>>> {
  try {
    const { phaseId } = await context.params;
    const { sectionIds } = await request.json() as { sectionIds: string[] };
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    
    const phase = roadmap.phases.find(p => p.id === phaseId);
    if (!phase) {
      return NextResponse.json(
        { success: false, error: 'Phase not found' },
        { status: 404 }
      );
    }
    
    // Reorder sections based on provided IDs
    const reorderedSections = sectionIds
      .map((id, index) => {
        const section = phase.sections.find(s => s.id === id);
        if (section) {
          section.order = index + 1;
        }
        return section;
      })
      .filter((s): s is Section => s !== undefined);
    
    phase.sections = reorderedSections;
    roadmap.lastUpdated = new Date().toISOString();
    await writeJSON('roadmap.json', roadmap);
    
    return NextResponse.json({ success: true, data: phase.sections });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to reorder sections' },
      { status: 500 }
    );
  }
}
