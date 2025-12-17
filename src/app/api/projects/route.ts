import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/fileSystem';
import { ProjectsData, Project, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// GET /api/projects - Get all projects
export async function GET(): Promise<NextResponse<ApiResponse<ProjectsData>>> {
  try {
    const projects = await readJSON<ProjectsData>('projects.json');
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const body = await request.json();
    const projects = await readJSON<ProjectsData>('projects.json');
    
    const newProject: Project = {
      id: `project-${uuidv4().slice(0, 8)}`,
      title: body.title || 'Untitled Project',
      description: body.description || '',
      status: body.status || 'planning',
      githubUrl: body.githubUrl,
      demoUrl: body.demoUrl,
      topics: body.topics || [],
      sections: body.sections || [],
      technologies: body.technologies || [],
      notes: body.notes || '',
      images: body.images || [],
      startedAt: body.startedAt,
      completedAt: body.completedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    projects.projects.push(newProject);
    projects.lastUpdated = new Date().toISOString();
    await writeJSON('projects.json', projects);
    
    return NextResponse.json({ success: true, data: newProject });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    );
  }
}
