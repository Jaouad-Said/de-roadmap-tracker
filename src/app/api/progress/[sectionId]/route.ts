import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/fileSystem';
import { ProgressData, SectionProgress, ApiResponse } from '@/types';

type Params = { params: Promise<{ sectionId: string }> };

// GET /api/progress/[sectionId] - Get progress for specific section
export async function GET(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<SectionProgress>>> {
  try {
    const { sectionId } = await context.params;
    const progressData = await readJSON<ProgressData>('progress.json');
    
    const progress = progressData.sections[sectionId] || {
      status: 'not-started' as const,
      progress: 0,
      startDate: null,
      completedDate: null,
      lastUpdated: new Date().toISOString(),
    };
    
    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get progress' },
      { status: 500 }
    );
  }
}

// PUT /api/progress/[sectionId] - Update progress for section
export async function PUT(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<SectionProgress>>> {
  try {
    const { sectionId } = await context.params;
    const updates = await request.json() as Partial<SectionProgress>;
    const progressData = await readJSON<ProgressData>('progress.json');
    
    const existingProgress = progressData.sections[sectionId] || {
      status: 'not-started' as const,
      progress: 0,
      startDate: null,
      completedDate: null,
      lastUpdated: new Date().toISOString(),
    };
    
    const updatedProgress: SectionProgress = {
      ...existingProgress,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    
    progressData.sections[sectionId] = updatedProgress;
    progressData.lastUpdated = new Date().toISOString();
    await writeJSON('progress.json', progressData);
    
    return NextResponse.json({ success: true, data: updatedProgress });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// PATCH /api/progress/[sectionId] - Partial update (status, percentage, dates)
export async function PATCH(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<SectionProgress>>> {
  try {
    const { sectionId } = await context.params;
    const { status, progress } = await request.json() as {
      status?: SectionProgress['status'];
      progress?: number;
    };
    
    const progressData = await readJSON<ProgressData>('progress.json');
    
    const existingProgress = progressData.sections[sectionId] || {
      status: 'not-started' as const,
      progress: 0,
      startDate: null,
      completedDate: null,
      lastUpdated: new Date().toISOString(),
    };
    
    const updatedProgress: SectionProgress = {
      ...existingProgress,
      lastUpdated: new Date().toISOString(),
    };
    
    if (status !== undefined) {
      updatedProgress.status = status;
      
      // Handle date updates based on status
      if (status === 'in-progress' && !existingProgress.startDate) {
        updatedProgress.startDate = new Date().toISOString();
      }
      if (status === 'completed') {
        updatedProgress.completedDate = new Date().toISOString();
        updatedProgress.progress = 100;
      }
      if (status === 'not-started') {
        updatedProgress.startDate = null;
        updatedProgress.completedDate = null;
        updatedProgress.progress = 0;
      }
    }
    
    if (progress !== undefined) {
      updatedProgress.progress = Math.min(100, Math.max(0, progress));
      
      // Auto-update status based on progress
      if (progress === 100 && updatedProgress.status !== 'completed') {
        updatedProgress.status = 'completed';
        updatedProgress.completedDate = new Date().toISOString();
      } else if (progress > 0 && progress < 100 && updatedProgress.status === 'not-started') {
        updatedProgress.status = 'in-progress';
        updatedProgress.startDate = new Date().toISOString();
      }
    }
    
    progressData.sections[sectionId] = updatedProgress;
    progressData.lastUpdated = new Date().toISOString();
    await writeJSON('progress.json', progressData);
    
    return NextResponse.json({ success: true, data: updatedProgress });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update progress' },
      { status: 500 }
    );
  }
}
