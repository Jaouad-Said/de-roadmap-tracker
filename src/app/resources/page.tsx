'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ExternalLink,
  Book,
  GraduationCap,
  Award,
  Users,
  Globe,
  Edit,
  Trash2,
  X,
  Save,
  FileText,
  Wrench,
} from 'lucide-react';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { Resource } from '@/types';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  book: Book,
  course: GraduationCap,
  certification: Award,
  community: Users,
  tool: Wrench,
  documentation: FileText,
  tutorial: Globe,
  other: Globe,
};

const typeColors: Record<string, string> = {
  book: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  course: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  certification: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  community: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  tool: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  documentation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  tutorial: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function ResourcesPage() {
  const { resources, addResource, updateResource, deleteResource } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'book' as Resource['type'],
    tags: '',
  });
  
  // Get resources array
  const resourcesList = resources?.resources || [];
  
  // Get unique types
  const types = useMemo(() => {
    return [...new Set(resourcesList.map(r => r.type))];
  }, [resourcesList]);
  
  // Filter resources
  const filteredResources = useMemo(() => {
    return resourcesList.filter(resource => {
      const matchesSearch = searchQuery === '' ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [resourcesList, searchQuery, selectedType]);
  
  // Group by type
  const groupedResources = useMemo(() => {
    const groups: Record<string, Resource[]> = {};
    filteredResources.forEach(resource => {
      if (!groups[resource.type]) {
        groups[resource.type] = [];
      }
      groups[resource.type].push(resource);
    });
    return groups;
  }, [filteredResources]);
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      type: 'book',
      tags: '',
    });
    setIsCreating(false);
    setEditingResource(null);
  };
  
  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      url: resource.url,
      type: resource.type,
      tags: resource.tags.join(', '),
    });
    setIsCreating(false);
  };
  
  const handleSave = async () => {
    if (!formData.title || !formData.url) {
      showToast('Title and URL are required', 'error');
      return;
    }
    
    const resourceData = {
      title: formData.title,
      description: formData.description,
      url: formData.url,
      type: formData.type,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    
    if (editingResource) {
      await updateResource(editingResource.id, resourceData);
      showToast('Resource updated', 'success');
    } else {
      await addResource(resourceData);
      showToast('Resource added', 'success');
    }
    
    resetForm();
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      await deleteResource(id);
      showToast('Resource deleted', 'info');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {resourcesList.length} resource{resourcesList.length !== 1 ? 's' : ''} in your library
          </p>
        </div>
        
        {editMode && (
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingResource(null);
              setFormData({
                title: '',
                description: '',
                url: '',
                type: 'book',
                tags: '',
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Resource</span>
          </button>
        )}
      </div>
      
      {/* Resource Form */}
      {(isCreating || editingResource) && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            <button onClick={resetForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Resource title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Brief description"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="book">Book</option>
                  <option value="course">Course</option>
                  <option value="certification">Certification</option>
                  <option value="community">Community</option>
                  <option value="tool">Tool</option>
                  <option value="documentation">Documentation</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="python, beginner, free"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="pl-10 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Resources List */}
      {filteredResources.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedResources).map(([type, typeResources]) => {
            const Icon = typeIcons[type] || Globe;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {type}s
                  </h2>
                  <span className="text-sm text-gray-500">({typeResources.length})</span>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {typeResources.map(resource => {
                    const TypeIcon = typeIcons[resource.type] || Globe;
                    return (
                      <div
                        key={resource.id}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[resource.type]}`}>
                                {resource.type}
                              </span>
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                              {resource.title}
                            </h3>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                              {resource.description}
                            </p>
                            
                            {resource.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {resource.tags.slice(0, 3).map(tag => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {resource.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{resource.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {editMode && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(resource)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(resource.id)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <span>Visit resource</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Book className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedType !== 'all' ? 'No resources found' : 'No resources yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || selectedType !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add resources to build your learning library'}
          </p>
        </div>
      )}
    </div>
  );
}
