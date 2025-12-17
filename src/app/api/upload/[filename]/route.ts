import { NextRequest, NextResponse } from 'next/server';
import { deleteUploadedFile } from '@/lib/fileSystem';
import { ApiResponse } from '@/types';

type Params = { params: Promise<{ filename: string }> };

// DELETE /api/upload/[filename] - Remove uploaded image
export async function DELETE(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { filename } = await context.params;
    
    // Get sectionId from query params
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    
    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: 'sectionId is required' },
        { status: 400 }
      );
    }
    
    await deleteUploadedFile(sectionId, filename);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    );
  }
}
