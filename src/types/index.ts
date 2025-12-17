// Core Data Types for Data Engineering Roadmap Tracker

// Learning Resource - the main resource for learning a section
export interface LearningResource {
  id: string;
  type: 'youtube' | 'course' | 'book' | 'documentation' | 'tutorial' | 'other';
  title: string;
  url?: string;
  author?: string;
  platform?: string; // Udemy, Coursera, YouTube channel, etc.
  description?: string;
  startedAt?: string;
  completedAt?: string;
}

// Mini-note for topics (lightweight notes)
export interface TopicNote {
  id: string;
  content: string;
  createdAt: string;
}

// Mini-resource for topics (code files, links, etc.)
export interface TopicResource {
  id: string;
  type: 'code' | 'link' | 'file' | 'github';
  title: string;
  url: string;
  language?: string; // For code: python, sql, etc.
  description?: string;
  createdAt: string;
}

// Mini-task for topics
export interface TopicTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

// Enhanced Topic with its own tasks, notes, and resources
export interface Topic {
  id: string;
  title: string;
  completed: boolean;
  tasks: TopicTask[];
  notes: TopicNote[];
  resources: TopicResource[];
  startedAt?: string;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface Attachment {
  id: string;
  type: 'file' | 'link';
  title: string;
  url: string;
  description?: string;
  fileType?: string; // For files: pdf, doc, etc.
  createdAt: string;
}

export interface Section {
  id: string;
  title: string;
  topics: Topic[];
  tasks: Task[];
  attachments: Attachment[];
  learningResource?: LearningResource; // Current learning resource for this section
  why: string;
  how: string;
  order: number;
}

// Project Types
export interface ProjectTopic {
  id: string;
  title: string;
  isCustom: boolean; // true if user wrote it, false if linked from roadmap
  sectionId?: string; // Reference to roadmap section if not custom
  topicId?: string; // Reference to roadmap topic if not custom
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  githubUrl?: string;
  demoUrl?: string;
  topics: ProjectTopic[]; // Topics/skills covered in this project
  sections: string[]; // Section IDs this project relates to
  technologies: string[]; // Tech stack used
  notes: string; // Project notes/learnings
  images: string[]; // Screenshots
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsData {
  projects: Project[];
  lastUpdated: string;
}

export interface Phase {
  id: string;
  title: string;
  duration: string;
  description: string;
  sections: Section[];
  order: number;
}

export interface RoadmapData {
  phases: Phase[];
  lastUpdated: string;
}

export type SectionStatus = 'not-started' | 'in-progress' | 'completed';

export interface SectionProgress {
  status: SectionStatus;
  progress: number; // 0-100
  startDate: string | null;
  completedDate: string | null;
  lastUpdated: string;
}

export interface ProgressData {
  sections: Record<string, SectionProgress>;
  lastUpdated: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  sectionId?: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  tags?: string[];
}

export interface SectionNotes {
  notes: Note[];
}

export interface NotesData {
  notes: Note[];
  lastUpdated: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'book' | 'course' | 'tutorial' | 'documentation' | 'tool' | 'community' | 'certification' | 'other';
  description: string;
  tags: string[];
  sectionId?: string; // Optional link to specific section
  createdAt: string;
}

export interface ResourcesData {
  resources: Resource[];
  lastUpdated: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalSections: number;
  completedSections: number;
  inProgressSections: number;
  notStartedSections: number;
  overallProgress: number;
  totalNotes: number;
  phaseProgress: {
    phaseId: string;
    title: string;
    progress: number;
    completed: number;
    total: number;
  }[];
}

// UI State Types
export interface UIState {
  editMode: boolean;
  selectedPhaseId: string | null;
  selectedSectionId: string | null;
  sidebarOpen: boolean;
  searchQuery: string;
  filterStatus: SectionStatus | 'all';
}
