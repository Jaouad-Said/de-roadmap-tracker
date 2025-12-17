import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, initializeData } from '@/lib/fileSystem';
import { ResourcesData, Resource, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// GET /api/resources - Get all resources
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ResourcesData>>> {
  try {
    await initializeData();
    const resourcesData = await readJSON<ResourcesData>('resources.json');
    
    // Optional filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sectionId = searchParams.get('sectionId');
    const searchQuery = searchParams.get('q')?.toLowerCase();
    
    let resources = resourcesData.resources;
    
    if (type) {
      resources = resources.filter(r => r.type === type);
    }
    
    if (sectionId) {
      resources = resources.filter(r => r.sectionId === sectionId);
    }
    
    if (searchQuery) {
      resources = resources.filter(r =>
        r.title.toLowerCase().includes(searchQuery) ||
        r.description?.toLowerCase().includes(searchQuery)
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { ...resourcesData, resources }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to read resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Add new resource
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Resource>>> {
  try {
    const newResource = await request.json() as Partial<Resource>;
    
    if (!newResource.title || !newResource.url) {
      return NextResponse.json(
        { success: false, error: 'title and url are required' },
        { status: 400 }
      );
    }
    
    const resourcesData = await readJSON<ResourcesData>('resources.json');
    
    const resource: Resource = {
      id: `res-${uuidv4().slice(0, 8)}`,
      title: newResource.title,
      url: newResource.url,
      type: newResource.type || 'other',
      description: newResource.description || '',
      tags: newResource.tags || [],
      sectionId: newResource.sectionId,
      createdAt: new Date().toISOString(),
    };
    
    resourcesData.resources.push(resource);
    resourcesData.lastUpdated = new Date().toISOString();
    await writeJSON('resources.json', resourcesData);
    
    return NextResponse.json({ success: true, data: resource }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add resource' },
      { status: 500 }
    );
  }
}
