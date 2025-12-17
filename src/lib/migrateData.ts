import { v4 as uuidv4 } from 'uuid';
import { Topic, Task, Attachment, Section } from '@/types';

/**
 * Migrates old section format (topics as strings) to new format (topics as objects)
 */
export function migrateSection(section: Section | { topics: string[] } & Omit<Section, 'topics' | 'tasks' | 'attachments'>): Section {
  // Check if topics are already migrated (objects with id)
  const firstTopic = section.topics?.[0];
  const isMigrated = firstTopic && typeof firstTopic === 'object' && 'id' in firstTopic;
  
  if (isMigrated) {
    // Already migrated, ensure tasks and attachments exist
    return {
      ...section as Section,
      tasks: (section as Section).tasks || [],
      attachments: (section as Section).attachments || [],
    };
  }
  
  // Migrate string topics to Topic objects
  const migratedTopics: Topic[] = (section.topics as unknown as string[]).map((topicStr, index) => ({
    id: `topic-${section.id}-${index + 1}`,
    title: topicStr,
    completed: false,
    tasks: [],
    notes: [],
    resources: [],
  }));
  
  return {
    id: section.id,
    title: section.title,
    topics: migratedTopics,
    tasks: [],
    attachments: [],
    why: section.why,
    how: section.how,
    order: section.order,
  };
}

/**
 * Creates a new topic
 */
export function createTopic(title: string, sectionId: string): Topic {
  return {
    id: `topic-${sectionId}-${uuidv4().slice(0, 8)}`,
    title,
    completed: false,
    tasks: [],
    notes: [],
    resources: [],
  };
}

/**
 * Creates a new task
 */
export function createTask(title: string, description?: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: string): Task {
  return {
    id: `task-${uuidv4().slice(0, 8)}`,
    title,
    description,
    completed: false,
    dueDate,
    priority,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Creates a new attachment
 */
export function createAttachment(
  type: 'file' | 'link',
  title: string,
  url: string,
  description?: string,
  fileType?: string
): Attachment {
  return {
    id: `attachment-${uuidv4().slice(0, 8)}`,
    type,
    title,
    url,
    description,
    fileType,
    createdAt: new Date().toISOString(),
  };
}
