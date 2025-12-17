'use client';

import { useState, useRef } from 'react';
import {
  Plus,
  Link as LinkIcon,
  FileText,
  Upload,
  X,
  ExternalLink,
  Edit2,
  Trash2,
  File,
  FileImage,
  FileVideo,
  FileCode,
  Download,
} from 'lucide-react';
import { Attachment } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { cn, formatDate } from '@/lib/utils';
import { createAttachment } from '@/lib/migrateData';

interface AttachmentsListProps {
  phaseId: string;
  sectionId: string;
  attachments: Attachment[];
}

const fileTypeIcons: Record<string, typeof File> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  gif: FileImage,
  svg: FileImage,
  mp4: FileVideo,
  mov: FileVideo,
  avi: FileVideo,
  js: FileCode,
  ts: FileCode,
  py: FileCode,
  html: FileCode,
  css: FileCode,
};

function getFileIcon(fileType?: string) {
  if (!fileType) return File;
  return fileTypeIcons[fileType.toLowerCase()] || File;
}

export default function AttachmentsList({ phaseId, sectionId, attachments }: AttachmentsListProps) {
  const { addAttachment, updateAttachment, deleteAttachment } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Link form state
  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    description: '',
  });
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    url: '',
    description: '',
  });

  const handleAddLink = async () => {
    if (!linkForm.title.trim() || !linkForm.url.trim()) return;
    
    let url = linkForm.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const attachment = createAttachment(
      'link',
      linkForm.title.trim(),
      url,
      linkForm.description.trim() || undefined
    );
    await addAttachment(phaseId, sectionId, attachment);
    setLinkForm({ title: '', url: '', description: '' });
    setIsAddingLink(false);
    showToast('Link added successfully', 'success');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sectionId', sectionId);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        
        if (data.success) {
          const fileExt = file.name.split('.').pop() || '';
          const attachment = createAttachment(
            'file',
            file.name,
            data.url,
            undefined,
            fileExt
          );
          await addAttachment(phaseId, sectionId, attachment);
          showToast(`${file.name} uploaded successfully`, 'success');
        } else {
          showToast(`Failed to upload ${file.name}`, 'error');
        }
      } catch (error) {
        showToast(`Failed to upload ${file.name}`, 'error');
      }
    }
    
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateAttachment = async (attachmentId: string) => {
    if (!editForm.title.trim()) return;
    
    let url = editForm.url.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      url = 'https://' + url;
    }
    
    await updateAttachment(phaseId, sectionId, attachmentId, {
      title: editForm.title.trim(),
      url: url || undefined,
      description: editForm.description.trim() || undefined,
    });
    setEditingId(null);
    showToast('Attachment updated', 'success');
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    // If it's a file, also delete from server
    if (attachment.type === 'file' && attachment.url.startsWith('/uploads/')) {
      try {
        const filename = attachment.url.split('/').pop();
        await fetch(`/api/upload/${filename}?sectionId=${sectionId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        // Continue with attachment deletion even if file delete fails
      }
    }
    
    await deleteAttachment(phaseId, sectionId, attachment.id);
    showToast('Attachment deleted', 'success');
  };

  const startEditing = (attachment: Attachment) => {
    setEditingId(attachment.id);
    setEditForm({
      title: attachment.title,
      url: attachment.url,
      description: attachment.description || '',
    });
  };

  const links = attachments.filter(a => a.type === 'link');
  const files = attachments.filter(a => a.type === 'file');

  const AttachmentForm = ({
    values,
    onChange,
    onSubmit,
    onCancel,
    isLink = true,
  }: {
    values: typeof linkForm;
    onChange: (v: typeof linkForm) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isLink?: boolean;
  }) => (
    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <input
        type="text"
        value={values.title}
        onChange={(e) => onChange({ ...values, title: e.target.value })}
        placeholder="Title..."
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      {isLink && (
        <input
          type="url"
          value={values.url}
          onChange={(e) => onChange({ ...values, url: e.target.value })}
          placeholder="https://example.com"
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      <textarea
        value={values.description}
        onChange={(e) => onChange({ ...values, description: e.target.value })}
        placeholder="Description (optional)..."
        rows={2}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Links Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Links ({links.length})
        </h4>
        
        <div className="space-y-2">
          {links.map((attachment) => (
            <div key={attachment.id}>
              {editingId === attachment.id ? (
                <AttachmentForm
                  values={editForm}
                  onChange={setEditForm}
                  onSubmit={() => handleUpdateAttachment(attachment.id)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="group flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-500 flex items-center gap-1"
                    >
                      {attachment.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {attachment.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {attachment.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                      {attachment.url}
                    </p>
                  </div>
                  {editMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(attachment)}
                        className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAttachment(attachment)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add link button/form */}
        {editMode && (
          <div className="mt-2">
            {isAddingLink ? (
              <AttachmentForm
                values={linkForm}
                onChange={setLinkForm}
                onSubmit={handleAddLink}
                onCancel={() => {
                  setIsAddingLink(false);
                  setLinkForm({ title: '', url: '', description: '' });
                }}
              />
            ) : (
              <button
                onClick={() => setIsAddingLink(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            )}
          </div>
        )}
      </div>

      {/* Files Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Files ({files.length})
        </h4>
        
        <div className="space-y-2">
          {files.map((attachment) => {
            const FileIcon = getFileIcon(attachment.fileType);
            
            return (
              <div key={attachment.id}>
                {editingId === attachment.id ? (
                  <AttachmentForm
                    values={editForm}
                    onChange={setEditForm}
                    onSubmit={() => handleUpdateAttachment(attachment.id)}
                    onCancel={() => setEditingId(null)}
                    isLink={false}
                  />
                ) : (
                  <div className="group flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <FileIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {attachment.title}
                        </span>
                        {attachment.fileType && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded uppercase">
                            {attachment.fileType}
                          </span>
                        )}
                      </div>
                      {attachment.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {attachment.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Added {formatDate(attachment.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={attachment.url}
                        download
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {editMode && (
                        <>
                          <button
                            onClick={() => startEditing(attachment)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttachment(attachment)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload file button */}
        {editMode && (
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.js,.ts,.py,.html,.css,.json,.md"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                isUploading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              )}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {attachments.length === 0 && !isAddingLink && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No attachments yet</p>
          {editMode && (
            <p className="text-sm mt-1">
              Add links or upload files to get started
            </p>
          )}
        </div>
      )}
    </div>
  );
}
