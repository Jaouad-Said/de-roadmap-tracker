import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, initializeData } from '@/lib/fileSystem';
import { NotesData, Note, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// GET /api/notes - Get all notes (with optional filter)
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<NotesData>>> {
  try {
    await initializeData();
    const notesData = await readJSON<NotesData>('notes.json');
    
    // Optional: filter by sectionId query param
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    const searchQuery = searchParams.get('q')?.toLowerCase();
    
    if (sectionId || searchQuery) {
      let filteredNotes = notesData.notes;
      
      if (sectionId) {
        filteredNotes = filteredNotes.filter(n => n.sectionId === sectionId);
      }
      
      if (searchQuery) {
        filteredNotes = filteredNotes.filter(note =>
          note.title.toLowerCase().includes(searchQuery) ||
          note.content.toLowerCase().includes(searchQuery)
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        data: { notes: filteredNotes, lastUpdated: notesData.lastUpdated } 
      });
    }
    
    return NextResponse.json({ success: true, data: notesData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to read notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Note>>> {
  try {
    const { sectionId, title, content, images = [], tags = [] } = await request.json() as {
      sectionId?: string;
      title: string;
      content: string;
      images?: string[];
      tags?: string[];
    };
    
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'title and content are required' },
        { status: 400 }
      );
    }
    
    const notesData = await readJSON<NotesData>('notes.json');
    
    const note: Note = {
      id: `note-${uuidv4().slice(0, 8)}`,
      title,
      content,
      sectionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images,
      tags,
    };
    
    notesData.notes.unshift(note); // Add to beginning
    notesData.lastUpdated = new Date().toISOString();
    await writeJSON('notes.json', notesData);
    
    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create note' },
      { status: 500 }
    );
  }
}
