import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/fileSystem';
import { SettingsData, UserSettings, LearningStreak } from '@/types';

const SETTINGS_FILE = 'settings.json';

const defaultSettings: UserSettings = {
  theme: 'system',
  accentColor: '#8b5cf6', // Purple
  showStreak: true,
  enableSpacedRepetition: true,
  dailyGoalMinutes: 60,
  defaultNoteTemplate: 'blank',
};

const defaultStreak: LearningStreak = {
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '',
  totalStudyDays: 0,
  studySessions: [],
};

async function getSettings(): Promise<SettingsData> {
  try {
    const data = await readJSON<SettingsData>(SETTINGS_FILE);
    return data;
  } catch {
    // Return default settings if file doesn't exist
    return {
      settings: defaultSettings,
      streak: defaultStreak,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    const current = await getSettings();

    const newSettings: SettingsData = {
      settings: { ...current.settings, ...updates.settings },
      streak: updates.streak ? { ...current.streak, ...updates.streak } : current.streak,
      lastUpdated: new Date().toISOString(),
    };

    await writeJSON(SETTINGS_FILE, newSettings);

    return NextResponse.json({ success: true, data: newSettings });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// Record a study session
export async function POST(request: NextRequest) {
  try {
    const session = await request.json();
    const current = await getSettings();

    const today = new Date().toISOString().split('T')[0];
    const lastStudyDate = current.streak.lastStudyDate?.split('T')[0];

    let newStreak = current.streak.currentStreak;
    let longestStreak = current.streak.longestStreak;

    if (lastStudyDate === today) {
      // Same day, streak unchanged
    } else if (lastStudyDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
      // Consecutive day
      newStreak += 1;
      if (newStreak > longestStreak) {
        longestStreak = newStreak;
      }
    } else {
      // Streak broken
      newStreak = 1;
    }

    const updatedStreak: LearningStreak = {
      currentStreak: newStreak,
      longestStreak,
      lastStudyDate: new Date().toISOString(),
      totalStudyDays: lastStudyDate !== today 
        ? current.streak.totalStudyDays + 1 
        : current.streak.totalStudyDays,
      studySessions: [
        ...current.streak.studySessions.slice(-99), // Keep last 100 sessions
        {
          id: `session-${Date.now()}`,
          ...session,
          startTime: session.startTime || new Date().toISOString(),
        },
      ],
    };

    const newSettings: SettingsData = {
      ...current,
      streak: updatedStreak,
      lastUpdated: new Date().toISOString(),
    };

    await writeJSON(SETTINGS_FILE, newSettings);

    return NextResponse.json({ success: true, data: newSettings });
  } catch (error) {
    console.error('Failed to record study session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record study session' },
      { status: 500 }
    );
  }
}
