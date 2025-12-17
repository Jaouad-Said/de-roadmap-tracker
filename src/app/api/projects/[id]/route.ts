import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/fileSystem';
import { ProjectsData, Project, ApiResponse } from '@/types';

type Params = { params: Promise<{ id: string }> };

// GET /api/projects/[id] - Get specific project
export async function GET(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const { id } = await context.params;
    const projects = await readJSON<ProjectsData>('projects.json');
    
    const project = projects.projects.find(p => p.id === id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const { id } = await context.params;
    const updates = await request.json();
    const projects = await readJSON<ProjectsData>('projects.json');
    
    const projectIndex = projects.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    projects.projects[projectIndex] = {
      ...projects.projects[projectIndex],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    
    projects.lastUpdated = new Date().toISOString();
    await writeJSON('projects.json', projects);
    
    return NextResponse.json({ success: true, data: projects.projects[projectIndex] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await context.params;
    const projects = await readJSON<ProjectsData>('projects.json');
    
    const projectIndex = projects.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    projects.projects.splice(projectIndex, 1);
    projects.lastUpdated = new Date().toISOString();
    await writeJSON('projects.json', projects);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete project' },
      { status: 500 }
    );
  }
}
