import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile, ensureUploadDir } from '@/lib/fileSystem';
import { ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Allowed file types (images and common documents)
const ALLOWED_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'text/markdown',
  // Code files
  'text/javascript',
  'application/javascript',
  'text/typescript',
  'application/json',
  'text/html',
  'text/css',
  'text/x-python',
  'application/x-python-code',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

// Also allow by extension for common cases where mime type isn't recognized
const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'csv', 'md',
  'js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'py', 'sql', 'sh',
  'zip', 'rar', '7z',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
    
    // Validate file type by mime type or extension
    const extension = (file.name.split('.').pop() || '').toLowerCase();
    const isAllowedType = ALLOWED_TYPES.includes(file.type);
    const isAllowedExtension = ALLOWED_EXTENSIONS.includes(extension);
    
    if (!isAllowedType && !isAllowedExtension) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload images, documents, or code files.' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size: 10MB' },
        { status: 400 }
      );
    }
    
    // Generate unique filename (preserve original extension)
    const filename = `${uuidv4().slice(0, 8)}-${Date.now()}.${extension || 'bin'}`;
    
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
