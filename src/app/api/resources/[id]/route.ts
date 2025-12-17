import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/fileSystem';
import { ResourcesData, Resource, ApiResponse } from '@/types';

type Params = { params: Promise<{ id: string }> };

// GET /api/resources/[id] - Get specific resource
export async function GET(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Resource>>> {
  try {
    const { id } = await context.params;
    const resourcesData = await readJSON<ResourcesData>('resources.json');
    
    const resource = resourcesData.resources.find(r => r.id === id);
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: resource });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get resource' },
      { status: 500 }
    );
  }
}

// PUT /api/resources/[id] - Update resource
export async function PUT(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Resource>>> {
  try {
    const { id } = await context.params;
    const updates = await request.json() as Partial<Resource>;
    const resourcesData = await readJSON<ResourcesData>('resources.json');
    
    const resourceIndex = resourcesData.resources.findIndex(r => r.id === id);
    if (resourceIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    resourcesData.resources[resourceIndex] = {
      ...resourcesData.resources[resourceIndex],
      ...updates,
      id, // Ensure ID doesn't change
    };
    
    resourcesData.lastUpdated = new Date().toISOString();
    await writeJSON('resources.json', resourcesData);
    
    return NextResponse.json({ success: true, data: resourcesData.resources[resourceIndex] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[id] - Remove resource
export async function DELETE(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await context.params;
    const resourcesData = await readJSON<ResourcesData>('resources.json');
    
    const resourceIndex = resourcesData.resources.findIndex(r => r.id === id);
    if (resourceIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    resourcesData.resources.splice(resourceIndex, 1);
    resourcesData.lastUpdated = new Date().toISOString();
    await writeJSON('resources.json', resourcesData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
