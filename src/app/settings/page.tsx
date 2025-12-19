'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Github, 
  Palette, 
  Target, 
  Bell, 
  Timer,
  Flame,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserSettings, LearningStreak, NoteTemplateType } from '@/types';
import { useUIStore } from '@/store/useUIStore';
import { getTemplateList } from '@/lib/noteTemplates';
import { cn } from '@/lib/utils';

const accentColors = [
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
];

export default function SettingsPage() {
  const { showToast } = useUIStore();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const templates = getTemplateList();

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.data.settings);
          setStreak(data.data.streak);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Settings saved', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-16 text-gray-500">
        Failed to load settings
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your learning experience
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Learning Streak Card */}
      {streak && settings.showStreak && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Learning Streak</h2>
              <p className="text-orange-100 text-sm">Keep the momentum going!</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold">{streak.currentStreak}</div>
              <div className="text-xs text-orange-100">Current Streak</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold">{streak.longestStreak}</div>
              <div className="text-xs text-orange-100">Longest Streak</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold">{streak.totalStudyDays}</div>
              <div className="text-xs text-orange-100">Total Days</div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* GitHub Integration */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              GitHub Integration
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Add a GitHub personal access token to increase API rate limits and access private repositories.
          </p>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={settings.githubToken || ''}
              onChange={(e) => updateSetting('githubToken', e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Create a token at GitHub → Settings → Developer Settings → Personal Access Tokens
          </p>
        </section>

        {/* Appearance */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Appearance
            </h2>
          </div>

          {/* Theme */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSetting('theme', theme)}
                  className={cn(
                    "px-4 py-2 rounded-lg capitalize transition-colors",
                    settings.theme === theme
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accent Color
            </label>
            <div className="flex gap-2">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSetting('accentColor', color.value)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                    settings.accentColor === color.value && "ring-2 ring-offset-2 ring-gray-400"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {settings.accentColor === color.value && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Goals */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Learning Goals
            </h2>
          </div>

          {/* Daily Goal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Study Goal (minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={settings.dailyGoalMinutes}
                onChange={(e) => updateSetting('dailyGoalMinutes', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-20 text-center font-medium text-gray-900 dark:text-white">
                {settings.dailyGoalMinutes} min
              </span>
            </div>
          </div>

          {/* Show Streak */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Show Learning Streak</div>
              <div className="text-sm text-gray-500">Display streak stats on settings page</div>
            </div>
            <button
              onClick={() => updateSetting('showStreak', !settings.showStreak)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                settings.showStreak ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  settings.showStreak ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </section>

        {/* Notes Settings */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Timer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notes & Review
            </h2>
          </div>

          {/* Default Template */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Note Template
            </label>
            <select
              value={settings.defaultNoteTemplate}
              onChange={(e) => updateSetting('defaultNoteTemplate', e.target.value as NoteTemplateType)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Spaced Repetition */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Spaced Repetition</div>
              <div className="text-sm text-gray-500">Schedule review reminders for notes</div>
            </div>
            <button
              onClick={() => updateSetting('enableSpacedRepetition', !settings.enableSpacedRepetition)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                settings.enableSpacedRepetition ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  settings.enableSpacedRepetition ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
