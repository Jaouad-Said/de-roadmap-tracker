import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, initializeData } from '@/lib/fileSystem';
import { ProgressData, SectionProgress, ApiResponse } from '@/types';

// GET /api/progress - Get all progress data
export async function GET(): Promise<NextResponse<ApiResponse<ProgressData>>> {
  try {
    await initializeData();
    const progress = await readJSON<ProgressData>('progress.json');
    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to read progress' },
      { status: 500 }
    );
  }
}

// PUT /api/progress - Bulk update progress
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<ProgressData>>> {
  try {
    const data = await request.json() as ProgressData;
    data.lastUpdated = new Date().toISOString();
    await writeJSON('progress.json', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// POST /api/progress - Initialize progress for a section
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<SectionProgress>>> {
  try {
    const { sectionId, status = 'not-started', progress = 0 } = await request.json() as {
      sectionId: string;
      status?: SectionProgress['status'];
      progress?: number;
    };
    
    const progressData = await readJSON<ProgressData>('progress.json');
    
    const sectionProgress: SectionProgress = {
      status,
      progress,
      startDate: status === 'in-progress' ? new Date().toISOString() : null,
      completedDate: status === 'completed' ? new Date().toISOString() : null,
      lastUpdated: new Date().toISOString(),
    };
    
    progressData.sections[sectionId] = sectionProgress;
    progressData.lastUpdated = new Date().toISOString();
    await writeJSON('progress.json', progressData);
    
    return NextResponse.json({ success: true, data: sectionProgress }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create progress' },
      { status: 500 }
    );
  }
}
