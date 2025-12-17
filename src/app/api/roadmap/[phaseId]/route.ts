import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/fileSystem';
import { RoadmapData, Phase, ApiResponse } from '@/types';

type Params = { params: Promise<{ phaseId: string }> };

// GET /api/roadmap/[phaseId] - Get specific phase
export async function GET(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Phase>>> {
  try {
    const { phaseId } = await context.params;
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    const phase = roadmap.phases.find(p => p.id === phaseId);
    
    if (!phase) {
      return NextResponse.json(
        { success: false, error: 'Phase not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: phase });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get phase' },
      { status: 500 }
    );
  }
}

// PUT /api/roadmap/[phaseId] - Update phase
export async function PUT(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Phase>>> {
  try {
    const { phaseId } = await context.params;
    const updates = await request.json() as Partial<Phase>;
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    
    const phaseIndex = roadmap.phases.findIndex(p => p.id === phaseId);
    if (phaseIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Phase not found' },
        { status: 404 }
      );
    }
    
    roadmap.phases[phaseIndex] = {
      ...roadmap.phases[phaseIndex],
      ...updates,
      id: phaseId, // Ensure ID doesn't change
    };
    
    roadmap.lastUpdated = new Date().toISOString();
    await writeJSON('roadmap.json', roadmap);
    
    return NextResponse.json({ success: true, data: roadmap.phases[phaseIndex] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update phase' },
      { status: 500 }
    );
  }
}

// DELETE /api/roadmap/[phaseId] - Delete phase
export async function DELETE(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { phaseId } = await context.params;
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    
    const phaseIndex = roadmap.phases.findIndex(p => p.id === phaseId);
    if (phaseIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Phase not found' },
        { status: 404 }
      );
    }
    
    roadmap.phases.splice(phaseIndex, 1);
    // Reorder remaining phases
    roadmap.phases.forEach((p, i) => p.order = i + 1);
    roadmap.lastUpdated = new Date().toISOString();
    await writeJSON('roadmap.json', roadmap);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete phase' },
      { status: 500 }
    );
  }
}
