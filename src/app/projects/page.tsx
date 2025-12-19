'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  FolderGit2,
  Github,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  BookOpen,
} from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { Project, ProjectTopic } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectEditor from '@/components/projects/ProjectEditor';

const statusColors = {
  'not-started': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'planning': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const statusLabels = {
  'not-started': 'Not Started',
  'planning': 'Planning',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'on-hold': 'On Hold',
};

export default function ProjectsPage() {
  const { projects, roadmap } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const projectsList = projects?.projects || [];

  const filteredProjects = useMemo(() => {
    return projectsList.filter(project => {
      const matchesSearch = !searchQuery || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [projectsList, searchQuery, filterStatus]);

  const projectsByStatus = useMemo(() => {
    const grouped = {
      'not-started': [] as Project[],
      'in-progress': [] as Project[],
      'planning': [] as Project[],
      'on-hold': [] as Project[],
      'completed': [] as Project[],
    };
    
    filteredProjects.forEach(project => {
      if (grouped[project.status]) {
        grouped[project.status].push(project);
      }
    });
    
    return grouped;
  }, [filteredProjects]);

  const stats = useMemo(() => ({
    total: projectsList.length,
    completed: projectsList.filter(p => p.status === 'completed').length,
    inProgress: projectsList.filter(p => p.status === 'in-progress').length,
    planning: projectsList.filter(p => p.status === 'planning').length,
  }), [projectsList]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FolderGit2 className="w-8 h-8 text-purple-500" />
              Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your learning projects and link them to your roadmap progress
            </p>
          </div>
          {editMode && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Projects</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-2xl font-bold text-gray-500">{stats.planning}</p>
            <p className="text-sm text-gray-500">Planning</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="not-started">Not Started</option>
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <FolderGit2 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {projectsList.length === 0 ? 'No projects yet' : 'No matching projects'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {projectsList.length === 0 
              ? 'Create your first project to start tracking your learning journey'
              : 'Try adjusting your search or filter'}
          </p>
          {editMode && projectsList.length === 0 && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Not Started */}
          {projectsByStatus['not-started'].length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-400 rounded-full" />
                Not Started ({projectsByStatus['not-started'].length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projectsByStatus['not-started'].map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => setEditingProject(project)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {projectsByStatus['in-progress'].length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                In Progress ({projectsByStatus['in-progress'].length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projectsByStatus['in-progress'].map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => setEditingProject(project)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Planning */}
          {projectsByStatus['planning'].length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-400 rounded-full" />
                Planning ({projectsByStatus['planning'].length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projectsByStatus['planning'].map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => setEditingProject(project)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* On Hold */}
          {projectsByStatus['on-hold'].length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                On Hold ({projectsByStatus['on-hold'].length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projectsByStatus['on-hold'].map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => setEditingProject(project)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {projectsByStatus['completed'].length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full" />
                Completed ({projectsByStatus['completed'].length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projectsByStatus['completed'].map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => setEditingProject(project)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingProject) && (
        <ProjectEditor
          project={editingProject}
          onClose={() => {
            setIsCreating(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}
