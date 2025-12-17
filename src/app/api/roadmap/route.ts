import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, initializeData } from '@/lib/fileSystem';
import { RoadmapData, Phase, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// GET /api/roadmap - Get full roadmap
export async function GET(): Promise<NextResponse<ApiResponse<RoadmapData>>> {
  try {
    await initializeData();
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    return NextResponse.json({ success: true, data: roadmap });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to read roadmap' },
      { status: 500 }
    );
  }
}

// PUT /api/roadmap - Update entire roadmap
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<RoadmapData>>> {
  try {
    const data = await request.json() as RoadmapData;
    data.lastUpdated = new Date().toISOString();
    await writeJSON('roadmap.json', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update roadmap' },
      { status: 500 }
    );
  }
}

// POST /api/roadmap - Add new phase
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Phase>>> {
  try {
    const newPhase = await request.json() as Partial<Phase>;
    const roadmap = await readJSON<RoadmapData>('roadmap.json');
    
    const phase: Phase = {
      id: newPhase.id || `phase-${uuidv4().slice(0, 8)}`,
      title: newPhase.title || 'New Phase',
      duration: newPhase.duration || 'TBD',
      description: newPhase.description || '',
      sections: newPhase.sections || [],
      order: roadmap.phases.length + 1,
    };
    
    roadmap.phases.push(phase);
    roadmap.lastUpdated = new Date().toISOString();
    await writeJSON('roadmap.json', roadmap);
    
    return NextResponse.json({ success: true, data: phase }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add phase' },
      { status: 500 }
    );
  }
}
