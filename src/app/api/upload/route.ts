import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile, ensureUploadDir } from '@/lib/fileSystem';
import { ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/upload - Handle image upload
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ url: string }>>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sectionId = formData.get('sectionId') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: 'sectionId is required' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const extension = file.name.split('.').pop() || 'png';
    const filename = `${uuidv4().slice(0, 8)}-${Date.now()}.${extension}`;
    
    // Convert to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await ensureUploadDir(sectionId);
    const url = await saveUploadedFile(sectionId, filename, buffer);
    
    return NextResponse.json({ success: true, data: { url } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
