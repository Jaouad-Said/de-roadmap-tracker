import { create } from 'zustand';
import {
  RoadmapData,
  ProgressData,
  NotesData,
  ResourcesData,
  ProjectsData,
  Phase,
  Section,
  SectionProgress,
  Note,
  Resource,
  Project,
  ProjectTopic,
  DashboardStats,
  Topic,
  Task,
  Attachment,
  LearningResource,
  TopicTask,
  TopicNote,
  TopicResource,
} from '@/types';

interface RoadmapStore {
  // Data
  roadmap: RoadmapData | null;
  progress: ProgressData | null;
  notes: NotesData | null;
  resources: ResourcesData | null;
  projects: ProjectsData | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  loadAllData: () => Promise<void>;
  
  // Roadmap actions
  updateRoadmap: (roadmap: RoadmapData) => Promise<void>;
  addPhase: (phase: Partial<Phase>) => Promise<void>;
  updatePhase: (phaseId: string, updates: Partial<Phase>) => Promise<void>;
  deletePhase: (phaseId: string) => Promise<void>;
  addSection: (phaseId: string, section: Partial<Section>) => Promise<void>;
  updateSection: (phaseId: string, sectionId: string, updates: Partial<Section>) => Promise<void>;
  deleteSection: (phaseId: string, sectionId: string) => Promise<void>;
  
  // Learning Resource actions
  setLearningResource: (phaseId: string, sectionId: string, resource: LearningResource) => Promise<void>;
  removeLearningResource: (phaseId: string, sectionId: string) => Promise<void>;
  
  // Topic actions
  addTopic: (phaseId: string, sectionId: string, topic: Topic) => Promise<void>;
  updateTopic: (phaseId: string, sectionId: string, topicId: string, updates: Partial<Topic>) => Promise<void>;
  deleteTopic: (phaseId: string, sectionId: string, topicId: string) => Promise<void>;
  toggleTopicComplete: (phaseId: string, sectionId: string, topicId: string) => Promise<void>;
  
  // Topic nested actions
  addTopicTask: (phaseId: string, sectionId: string, topicId: string, task: TopicTask) => Promise<void>;
  toggleTopicTask: (phaseId: string, sectionId: string, topicId: string, taskId: string) => Promise<void>;
  deleteTopicTask: (phaseId: string, sectionId: string, topicId: string, taskId: string) => Promise<void>;
  addTopicNote: (phaseId: string, sectionId: string, topicId: string, note: TopicNote) => Promise<void>;
  deleteTopicNote: (phaseId: string, sectionId: string, topicId: string, noteId: string) => Promise<void>;
  addTopicResource: (phaseId: string, sectionId: string, topicId: string, resource: TopicResource) => Promise<void>;
  deleteTopicResource: (phaseId: string, sectionId: string, topicId: string, resourceId: string) => Promise<void>;
  
  // Task actions
  addTask: (phaseId: string, sectionId: string, task: Task) => Promise<void>;
  updateTask: (phaseId: string, sectionId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (phaseId: string, sectionId: string, taskId: string) => Promise<void>;
  toggleTaskComplete: (phaseId: string, sectionId: string, taskId: string) => Promise<void>;
  
  // Attachment actions
  addAttachment: (phaseId: string, sectionId: string, attachment: Attachment) => Promise<void>;
  updateAttachment: (phaseId: string, sectionId: string, attachmentId: string, updates: Partial<Attachment>) => Promise<void>;
  deleteAttachment: (phaseId: string, sectionId: string, attachmentId: string) => Promise<void>;
  
  // Progress actions
  updateProgress: (sectionId: string, updates: Partial<SectionProgress>) => Promise<void>;
  
  // Notes actions
  addNote: (sectionId: string, title: string, content: string, images?: string[]) => Promise<Note | null>;
  updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  
  // Resource actions
  addResource: (resource: Partial<Resource>) => Promise<void>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  
  // Project actions
  addProject: (project: Partial<Project>) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Utility
  getStats: () => DashboardStats;
  getSectionProgress: (sectionId: string) => SectionProgress;
  getSectionNotes: (sectionId: string) => Note[];
  findSection: (sectionId: string) => { phase: Phase; section: Section } | null;
  getSection: (phaseId: string, sectionId: string) => Section | null;
  getAllSectionsWithTopics: () => {
    phaseId: string;
    phaseTitle: string;
    sections: {
      sectionId: string;
      sectionTitle: string;
      topics: { topicId: string; topicTitle: string }[];
    }[];
  }[];
}

export const useRoadmapStore = create<RoadmapStore>((set, get) => ({
  // Initial state
  roadmap: null,
  progress: null,
  notes: null,
  resources: null,
  projects: null,
  isLoading: false,
  isSaving: false,
  error: null,
  
  // Load all data
  loadAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [roadmapRes, progressRes, notesRes, resourcesRes, projectsRes] = await Promise.all([
        fetch('/api/roadmap'),
        fetch('/api/progress'),
        fetch('/api/notes'),
        fetch('/api/resources'),
        fetch('/api/projects'),
      ]);
      
      const [roadmapData, progressData, notesData, resourcesData, projectsData] = await Promise.all([
        roadmapRes.json(),
        progressRes.json(),
        notesRes.json(),
        resourcesRes.json(),
        projectsRes.json(),
      ]);
      
      set({
        roadmap: roadmapData.data,
        progress: progressData.data,
        notes: notesData.data,
        resources: resourcesData.data,
        projects: projectsData.data,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load data', isLoading: false });
    }
  },
  
  // Roadmap actions
  updateRoadmap: async (roadmap) => {
    set({ isSaving: true });
    try {
      const res = await fetch('/api/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roadmap),
      });
      const data = await res.json();
      if (data.success) {
        set({ roadmap: data.data, isSaving: false });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update roadmap', isSaving: false });
    }
  },
  
  addPhase: async (phase) => {
    set({ isSaving: true });
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phase),
      });
      const data = await res.json();
      if (data.success) {
        const { roadmap } = get();
        if (roadmap) {
          set({
            roadmap: { ...roadmap, phases: [...roadmap.phases, data.data] },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add phase', isSaving: false });
    }
  },
  
  updatePhase: async (phaseId, updates) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/roadmap/${phaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        const { roadmap } = get();
        if (roadmap) {
          set({
            roadmap: {
              ...roadmap,
              phases: roadmap.phases.map(p => p.id === phaseId ? data.data : p),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update phase', isSaving: false });
    }
  },
  
  deletePhase: async (phaseId) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/roadmap/${phaseId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const { roadmap } = get();
        if (roadmap) {
          set({
            roadmap: {
              ...roadmap,
              phases: roadmap.phases.filter(p => p.id !== phaseId),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete phase', isSaving: false });
    }
  },
  
  addSection: async (phaseId, section) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/roadmap/${phaseId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section),
      });
      const data = await res.json();
      if (data.success) {
        const { roadmap } = get();
        if (roadmap) {
          set({
            roadmap: {
              ...roadmap,
              phases: roadmap.phases.map(p => 
                p.id === phaseId 
                  ? { ...p, sections: [...p.sections, data.data] }
                  : p
              ),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add section', isSaving: false });
    }
  },
  
  updateSection: async (phaseId, sectionId, updates) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/roadmap/${phaseId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        const { roadmap } = get();
        if (roadmap) {
          set({
            roadmap: {
              ...roadmap,
              phases: roadmap.phases.map(p => 
                p.id === phaseId 
                  ? {
                      ...p,
                      sections: p.sections.map(s => s.id === sectionId ? data.data : s),
                    }
                  : p
              ),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update section', isSaving: false });
    }
  },
  
  deleteSection: async (phaseId, sectionId) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/roadmap/${phaseId}/sections/${sectionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const { roadmap } = get();
        if (roadmap) {
          set({
            roadmap: {
              ...roadmap,
              phases: roadmap.phases.map(p => 
                p.id === phaseId 
                  ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) }
                  : p
              ),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete section', isSaving: false });
    }
  },
  
  // Progress actions
  updateProgress: async (sectionId, updates) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/progress/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        const { progress } = get();
        if (progress) {
          set({
            progress: {
              ...progress,
              sections: { ...progress.sections, [sectionId]: data.data },
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update progress', isSaving: false });
    }
  },
  
  // Notes actions
  addNote: async (sectionId, title, content, images = []) => {
    set({ isSaving: true });
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, title, content, images }),
      });
      const data = await res.json();
      if (data.success) {
        const { notes } = get();
        if (notes) {
          set({
            notes: {
              ...notes,
              notes: [data.data, ...notes.notes],
            },
            isSaving: false,
          });
        }
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add note', isSaving: false });
      return null;
    }
  },
  
  updateNote: async (noteId, updates) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        const { notes } = get();
        if (notes) {
          set({
            notes: {
              ...notes,
              notes: notes.notes.map(n => n.id === noteId ? data.data : n),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update note', isSaving: false });
    }
  },
  
  deleteNote: async (noteId) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const { notes } = get();
        if (notes) {
          set({
            notes: {
              ...notes,
              notes: notes.notes.filter(n => n.id !== noteId),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete note', isSaving: false });
    }
  },
  
  // Resource actions
  addResource: async (resource) => {
    set({ isSaving: true });
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource),
      });
      const data = await res.json();
      if (data.success) {
        const { resources } = get();
        if (resources) {
          set({
            resources: {
              ...resources,
              resources: [...resources.resources, data.data],
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add resource', isSaving: false });
    }
  },
  
  updateResource: async (id, updates) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        const { resources } = get();
        if (resources) {
          set({
            resources: {
              ...resources,
              resources: resources.resources.map(r => r.id === id ? data.data : r),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update resource', isSaving: false });
    }
  },
  
  deleteResource: async (id) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const { resources } = get();
        if (resources) {
          set({
            resources: {
              ...resources,
              resources: resources.resources.filter(r => r.id !== id),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete resource', isSaving: false });
    }
  },
  
  // Utility functions
  getStats: () => {
    const { roadmap, progress, notes } = get();
    const stats: DashboardStats = {
      totalSections: 0,
      completedSections: 0,
      inProgressSections: 0,
      notStartedSections: 0,
      overallProgress: 0,
      totalNotes: 0,
      phaseProgress: [],
    };
    
    if (!roadmap) return stats;
    
    roadmap.phases.forEach(phase => {
      let phaseCompleted = 0;
      const phaseTotal = phase.sections.length;
      
      phase.sections.forEach(section => {
        stats.totalSections++;
        const sectionProgress = progress?.sections[section.id];
        
        if (sectionProgress?.status === 'completed') {
          stats.completedSections++;
          phaseCompleted++;
        } else if (sectionProgress?.status === 'in-progress') {
          stats.inProgressSections++;
        } else {
          stats.notStartedSections++;
        }
        
        stats.totalNotes += notes?.notes.filter(n => n.sectionId === section.id).length || 0;
      });
      
      stats.phaseProgress.push({
        phaseId: phase.id,
        title: phase.title,
        progress: phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0,
        completed: phaseCompleted,
        total: phaseTotal,
      });
    });
    
    stats.overallProgress = stats.totalSections > 0
      ? Math.round((stats.completedSections / stats.totalSections) * 100)
      : 0;
    
    return stats;
  },
  
  getSectionProgress: (sectionId) => {
    const { progress } = get();
    return progress?.sections[sectionId] || {
      status: 'not-started',
      progress: 0,
      startDate: null,
      completedDate: null,
      lastUpdated: new Date().toISOString(),
    };
  },
  
  getSectionNotes: (sectionId) => {
    const { notes } = get();
    return notes?.notes.filter(n => n.sectionId === sectionId) || [];
  },
  
  findSection: (sectionId) => {
    const { roadmap } = get();
    if (!roadmap) return null;
    
    for (const phase of roadmap.phases) {
      const section = phase.sections.find(s => s.id === sectionId);
      if (section) {
        return { phase, section };
      }
    }
    return null;
  },
  
  getSection: (phaseId, sectionId) => {
    const { roadmap } = get();
    if (!roadmap) return null;
    const phase = roadmap.phases.find(p => p.id === phaseId);
    return phase?.sections.find(s => s.id === sectionId) || null;
  },
  
  // Topic actions
  addTopic: async (phaseId, sectionId, topic) => {
    const { roadmap, updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = [...(section.topics || []), topic];
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  updateTopic: async (phaseId, sectionId, topicId, updates) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.map(t => 
      t.id === topicId ? { ...t, ...updates } : t
    );
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  deleteTopic: async (phaseId, sectionId, topicId) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.filter(t => t.id !== topicId);
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  toggleTopicComplete: async (phaseId, sectionId, topicId) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.map(t => 
      t.id === topicId ? { ...t, completed: !t.completed } : t
    );
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  // Task actions
  addTask: async (phaseId, sectionId, task) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTasks = [...(section.tasks || []), task];
    await updateSection(phaseId, sectionId, { tasks: updatedTasks });
  },
  
  updateTask: async (phaseId, sectionId, taskId, updates) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTasks = section.tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    );
    await updateSection(phaseId, sectionId, { tasks: updatedTasks });
  },
  
  deleteTask: async (phaseId, sectionId, taskId) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTasks = section.tasks.filter(t => t.id !== taskId);
    await updateSection(phaseId, sectionId, { tasks: updatedTasks });
  },
  
  toggleTaskComplete: async (phaseId, sectionId, taskId) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTasks = section.tasks.map(t => 
      t.id === taskId 
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } 
        : t
    );
    await updateSection(phaseId, sectionId, { tasks: updatedTasks });
  },
  
  // Attachment actions
  addAttachment: async (phaseId, sectionId, attachment) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedAttachments = [...(section.attachments || []), attachment];
    await updateSection(phaseId, sectionId, { attachments: updatedAttachments });
  },
  
  updateAttachment: async (phaseId, sectionId, attachmentId, updates) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedAttachments = section.attachments.map(a => 
      a.id === attachmentId ? { ...a, ...updates } : a
    );
    await updateSection(phaseId, sectionId, { attachments: updatedAttachments });
  },
  
  deleteAttachment: async (phaseId, sectionId, attachmentId) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedAttachments = section.attachments.filter(a => a.id !== attachmentId);
    await updateSection(phaseId, sectionId, { attachments: updatedAttachments });
  },
  
  // Learning Resource actions
  setLearningResource: async (phaseId, sectionId, resource) => {
    const { updateSection } = get();
    await updateSection(phaseId, sectionId, { learningResource: resource });
  },
  
  removeLearningResource: async (phaseId, sectionId) => {
    const { updateSection } = get();
    await updateSection(phaseId, sectionId, { learningResource: undefined });
  },
  
  // Topic nested actions
  addTopicTask: async (phaseId, sectionId, topicId, task) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.map(t => 
      t.id === topicId 
        ? { ...t, tasks: [...(t.tasks || []), task] }
        : t
    );
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  toggleTopicTask: async (phaseId, sectionId, topicId, taskId) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.map(t => 
      t.id === topicId 
        ? { 
            ...t, 
            tasks: (t.tasks || []).map(task => 
              task.id === taskId 
                ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : undefined }
                : task
            )
          }
        : t
    );
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  deleteTopicTask: async (phaseId, sectionId, topicId, taskId) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.map(t => 
      t.id === topicId 
        ? { ...t, tasks: (t.tasks || []).filter(task => task.id !== taskId) }
        : t
    );
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  addTopicNote: async (phaseId, sectionId, topicId, note) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.map(t => 
      t.id === topicId 
        ? { ...t, notes: [...(t.notes || []), note] }
        : t
    );
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  deleteTopicNote: async (phaseId, sectionId, topicId, noteId) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.map(t => 
      t.id === topicId 
        ? { ...t, notes: (t.notes || []).filter(n => n.id !== noteId) }
        : t
    );
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  addTopicResource: async (phaseId, sectionId, topicId, resource) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.map(t => 
      t.id === topicId 
        ? { ...t, resources: [...(t.resources || []), resource] }
        : t
    );
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  deleteTopicResource: async (phaseId, sectionId, topicId, resourceId) => {
    const { updateSection, getSection } = get();
    const section = getSection(phaseId, sectionId);
    if (!section) return;
    
    const updatedTopics = section.topics.map(t => 
      t.id === topicId 
        ? { ...t, resources: (t.resources || []).filter(r => r.id !== resourceId) }
        : t
    );
    await updateSection(phaseId, sectionId, { topics: updatedTopics });
  },
  
  // Project actions
  addProject: async (project) => {
    set({ isSaving: true });
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (data.success) {
        const { projects } = get();
        if (projects) {
          set({
            projects: {
              ...projects,
              projects: [...projects.projects, data.data],
            },
            isSaving: false,
          });
        }
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add project', isSaving: false });
      return null;
    }
  },
  
  updateProject: async (id, updates) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        const { projects } = get();
        if (projects) {
          set({
            projects: {
              ...projects,
              projects: projects.projects.map(p => p.id === id ? data.data : p),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update project', isSaving: false });
    }
  },
  
  deleteProject: async (id) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const { projects } = get();
        if (projects) {
          set({
            projects: {
              ...projects,
              projects: projects.projects.filter(p => p.id !== id),
            },
            isSaving: false,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete project', isSaving: false });
    }
  },
  
  // Utility - get all sections with their topics for project linking
  getAllSectionsWithTopics: () => {
    const { roadmap } = get();
    if (!roadmap) return [];
    
    // Group by phase for UI display
    const phaseMap = new Map<string, {
      phaseId: string;
      phaseTitle: string;
      sections: {
        sectionId: string;
        sectionTitle: string;
        topics: { topicId: string; topicTitle: string }[];
      }[];
    }>();
    
    roadmap.phases.forEach(phase => {
      const phaseSections: {
        sectionId: string;
        sectionTitle: string;
        topics: { topicId: string; topicTitle: string }[];
      }[] = [];
      
      phase.sections.forEach(section => {
        phaseSections.push({
          sectionId: section.id,
          sectionTitle: section.title,
          topics: (section.topics || []).map((t, index) => ({
            topicId: typeof t === 'string' ? `topic-${section.id}-${index}` : t.id,
            topicTitle: typeof t === 'string' ? t : t.title,
          })),
        });
      });
      
      phaseMap.set(phase.id, {
        phaseId: phase.id,
        phaseTitle: phase.title,
        sections: phaseSections,
      });
    });
    
    return Array.from(phaseMap.values());
  },
}));
