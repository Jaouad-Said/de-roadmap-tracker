'use client';

import {
  X,
  Github,
  ExternalLink,
  Plus,
  BookOpen,
  Tag,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Project, ProjectTopic } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

interface ProjectEditorProps {
  project?: Project | null;
  onClose: () => void;
}

type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

export default function ProjectEditor({ project, onClose }: ProjectEditorProps) {
  const { addProject, updateProject, getAllSectionsWithTopics } = useRoadmapStore();
  const { showToast } = useUIStore();
  
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status || 'planning');
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl || '');
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl || '');
  const [technologies, setTechnologies] = useState<string[]>(project?.technologies || []);
  const [techInput, setTechInput] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>(project?.sections || []);
  const [topics, setTopics] = useState<ProjectTopic[]>(project?.topics || []);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [notes, setNotes] = useState(project?.notes || '');
  const [startedAt, setStartedAt] = useState(project?.startedAt || '');
  const [completedAt, setCompletedAt] = useState(project?.completedAt || '');
  
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [saving, setSaving] = useState(false);

  const allSections = getAllSectionsWithTopics();

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  const toggleTopic = (topicId: string, topicTitle: string, sectionId: string) => {
    const existing = topics.find(t => t.topicId === topicId);
    if (existing) {
      setTopics(topics.filter(t => t.topicId !== topicId));
    } else {
      setTopics([...topics, { 
        id: `linked-${topicId}`,
        topicId, 
        title: topicTitle, 
        sectionId, 
        isCustom: false 
      }]);
    }
  };

  const addCustomTopic = () => {
    if (customTopicInput.trim()) {
      const customId = `custom-${Date.now()}`;
      setTopics([...topics, {
        id: customId,
        topicId: customId,
        title: customTopicInput.trim(),
        isCustom: true,
      }]);
      setCustomTopicInput('');
    }
  };

  const removeTopic = (id: string) => {
    setTopics(topics.filter(t => t.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please enter a project title', 'error');
      return;
    }

    setSaving(true);

    try {
      const projectData = {
        title: title.trim(),
        description: description.trim(),
        status,
        githubUrl: githubUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        technologies,
        sections: selectedSections,
        topics,
        notes: notes.trim() || undefined,
        startedAt: startedAt || undefined,
        completedAt: status === 'completed' ? (completedAt || new Date().toISOString()) : undefined,
      };

      if (project) {
        await updateProject(project.id, projectData);
        showToast('Project updated', 'success');
      } else {
        await addProject(projectData);
        showToast('Project created', 'success');
      }

      onClose();
    } catch (error) {
      showToast('Failed to save project', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="My Awesome Project"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="What is this project about?"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Github className="w-4 h-4 inline mr-1" />
                GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <ExternalLink className="w-4 h-4 inline mr-1" />
                Demo URL
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Started At
              </label>
              <input
                type="date"
                value={startedAt ? startedAt.split('T')[0] : ''}
                onChange={(e) => setStartedAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {status === 'completed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Completed At
                </label>
                <input
                  type="date"
                  value={completedAt ? completedAt.split('T')[0] : ''}
                  onChange={(e) => setCompletedAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Technologies
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add technology..."
              />
              <button
                onClick={handleAddTech}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-full flex items-center gap-1"
                  >
                    {tech}
                    <button
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:text-purple-900 dark:hover:text-purple-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Linked Sections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Linked Roadmap Sections
            </label>
            <button
              onClick={() => setShowSectionSelector(!showSectionSelector)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-left text-gray-900 dark:text-white flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className={selectedSections.length ? '' : 'text-gray-400'}>
                {selectedSections.length
                  ? `${selectedSections.length} section(s) selected`
                  : 'Select sections from roadmap'}
              </span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showSectionSelector && "rotate-180")} />
            </button>
            
            {showSectionSelector && (
              <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                {allSections.map((phase) => (
                  <div key={phase.phaseId} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {phase.phaseTitle}
                    </div>
                    {phase.sections.map((section) => (
                      <div key={section.sectionId} className="ml-2">
                        <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSections.includes(section.sectionId)}
                            onChange={() => toggleSection(section.sectionId)}
                            className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {section.sectionTitle}
                          </span>
                        </label>
                        
                        {/* Show topics for selected sections */}
                        {selectedSections.includes(section.sectionId) && section.topics.length > 0 && (
                          <div className="ml-6 pb-2">
                            <div className="text-xs text-gray-500 mb-1">Topics:</div>
                            {section.topics.map((topic) => (
                              <label key={topic.topicId} className="flex items-center gap-2 px-2 py-0.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={topics.some(t => t.topicId === topic.topicId)}
                                  onChange={() => toggleTopic(topic.topicId, topic.topicTitle, section.sectionId)}
                                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {topic.topicTitle}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Topics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Tag className="w-4 h-4 inline mr-1" />
              Topics Covered
            </label>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {topics.map((topic) => (
                  <span
                    key={topic.id}
                    className={cn(
                      "px-2 py-0.5 text-sm rounded-full flex items-center gap-1",
                      topic.isCustom
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    )}
                  >
                    {topic.title}
                    <button
                      onClick={() => removeTopic(topic.id)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTopic())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add custom topic..."
              />
              <button
                onClick={addCustomTopic}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Additional notes about this project..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {project ? 'Save Changes' : 'Create Project'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
