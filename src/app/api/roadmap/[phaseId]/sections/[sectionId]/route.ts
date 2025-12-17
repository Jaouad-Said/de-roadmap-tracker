import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/fileSystem';
import { RoadmapData, Section, ApiResponse, Topic, Task, Attachment } from '@/types';
import { migrateSection } from '@/lib/migrateData';

type Params = { params: Promise<{ phaseId: string; sectionId: string }> };

// GET /api/roadmap/[phaseId]/sections/[sectionId] - Get specific section
export async function GET(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Section>>> {
  try {
    const { phaseId, sectionId } = await context.params;
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    
    const phase = roadmap.phases.find(p => p.id === phaseId);
    if (!phase) {
      return NextResponse.json(
        { success: false, error: 'Phase not found' },
        { status: 404 }
      );
    }
    
    const sectionIndex = phase.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }
    
    // Migrate section if needed (topics as strings -> objects)
    const section = migrateSection(phase.sections[sectionIndex] as any);
    
    // Save migrated section back if it was changed
    if (JSON.stringify(section) !== JSON.stringify(phase.sections[sectionIndex])) {
      phase.sections[sectionIndex] = section;
      roadmap.lastUpdated = new Date().toISOString();
      await writeJSON('roadmap.json', roadmap);
    }
    
    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get section' },
      { status: 500 }
    );
  }
}

// PUT /api/roadmap/[phaseId]/sections/[sectionId] - Update section
export async function PUT(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Section>>> {
  try {
    const { phaseId, sectionId } = await context.params;
    const updates = await request.json() as Partial<Section>;
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    
    const phase = roadmap.phases.find(p => p.id === phaseId);
    if (!phase) {
      return NextResponse.json(
        { success: false, error: 'Phase not found' },
        { status: 404 }
      );
    }
    
    const sectionIndex = phase.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }
    
    phase.sections[sectionIndex] = {
      ...phase.sections[sectionIndex],
      ...updates,
      id: sectionId, // Ensure ID doesn't change
    };
    
    roadmap.lastUpdated = new Date().toISOString();
    await writeJSON('roadmap.json', roadmap);
    
    return NextResponse.json({ success: true, data: phase.sections[sectionIndex] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE /api/roadmap/[phaseId]/sections/[sectionId] - Delete section
export async function DELETE(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { phaseId, sectionId } = await context.params;
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    
    const phase = roadmap.phases.find(p => p.id === phaseId);
    if (!phase) {
      return NextResponse.json(
        { success: false, error: 'Phase not found' },
        { status: 404 }
      );
    }
    
    const sectionIndex = phase.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }
    
    phase.sections.splice(sectionIndex, 1);
    // Reorder remaining sections
    phase.sections.forEach((s, i) => s.order = i + 1);
    roadmap.lastUpdated = new Date().toISOString();
    await writeJSON('roadmap.json', roadmap);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete section' },
      { status: 500 }
    );
  }
}
