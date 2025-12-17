import { NextResponse } from 'next/server';
import { backupData } from '@/lib/fileSystem';
import { ApiResponse } from '@/types';

// POST /api/backup - Create backup of all data
export async function POST(): Promise<NextResponse<ApiResponse<{ path: string }>>> {
  try {
    const backupPath = await backupData();
    return NextResponse.json({ success: true, data: { path: backupPath } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create backup' },
      { status: 500 }
    );
  }
}
