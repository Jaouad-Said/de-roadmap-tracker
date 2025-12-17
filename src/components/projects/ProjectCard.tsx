'use client';

import {
  Github,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { Project } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { cn, formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
}

const statusColors = {
  'planning': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const statusLabels = {
  'planning': 'Planning',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'on-hold': 'On Hold',
};

export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const { deleteProject, roadmap } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    await deleteProject(project.id);
    showToast('Project deleted', 'success');
    setConfirmDelete(false);
  };

  // Get section titles for linked sections
  const linkedSections = project.sections
    .map(sectionId => {
      for (const phase of roadmap?.phases || []) {
        const section = phase.sections.find(s => s.id === sectionId);
        if (section) {
          return { phase: phase.title, section: section.title };
        }
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                statusColors[project.status]
              )}>
                {statusLabels[project.status]}
              </span>
              {project.completedAt && (
                <span className="text-xs text-gray-500">
                  Completed {formatDate(project.completedAt)}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          
          {editMode && (
            <div className="flex items-center gap-1">
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDelete}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center gap-3 mt-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-500"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-500"
            >
              <ExternalLink className="w-4 h-4" />
              Demo
            </a>
          )}
        </div>

        {/* Technologies */}
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.technologies.slice(0, expanded ? undefined : 5).map((tech, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full"
              >
                {tech}
              </span>
            ))}
            {!expanded && project.technologies.length > 5 && (
              <span className="text-xs text-gray-500">
                +{project.technologies.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-1 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Show More
          </>
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-800 pt-3 space-y-4">
          {/* Linked Sections */}
          {linkedSections.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Linked Sections
              </h4>
              <div className="space-y-1">
                {linkedSections.map((item, i) => (
                  <div key={i} className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500">{item?.phase}:</span> {item?.section}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topics Covered */}
          {project.topics.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Topics Covered
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.topics.map((topic, i) => (
                  <span
                    key={i}
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-full",
                      topic.isCustom
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    )}
                  >
                    {topic.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {project.notes && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                Notes
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {project.notes}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {project.startedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Started {formatDate(project.startedAt)}
              </span>
            )}
            <span>Created {formatDate(project.createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
