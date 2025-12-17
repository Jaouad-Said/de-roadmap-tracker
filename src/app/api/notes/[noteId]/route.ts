import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/fileSystem';
import { NotesData, Note, ApiResponse } from '@/types';

type Params = { params: Promise<{ noteId: string }> };

// GET /api/notes/[noteId] - Get single note
export async function GET(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Note>>> {
  try {
    const { noteId } = await context.params;
    const notesData = await readJSON<NotesData>('notes.json');
    
    const note = notesData.notes.find(n => n.id === noteId);
    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get note' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[noteId] - Update note
export async function PUT(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<Note>>> {
  try {
    const { noteId } = await context.params;
    const updates = await request.json() as Partial<Note>;
    
    const notesData = await readJSON<NotesData>('notes.json');
    
    const noteIndex = notesData.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }
    
    notesData.notes[noteIndex] = {
      ...notesData.notes[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    notesData.lastUpdated = new Date().toISOString();
    await writeJSON('notes.json', notesData);
    
    return NextResponse.json({ success: true, data: notesData.notes[noteIndex] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[noteId] - Delete note
export async function DELETE(
  request: NextRequest,
  context: Params
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { noteId } = await context.params;
    const notesData = await readJSON<NotesData>('notes.json');
    
    const noteIndex = notesData.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }
    
    notesData.notes.splice(noteIndex, 1);
    notesData.lastUpdated = new Date().toISOString();
    await writeJSON('notes.json', notesData);
    
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete note' },
      { status: 500 }
    );
  }
}
