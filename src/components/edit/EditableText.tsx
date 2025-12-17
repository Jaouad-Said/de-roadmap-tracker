'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  editMode: boolean;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  placeholder?: string;
}

export default function EditableText({
  value,
  onSave,
  editMode,
  className,
  inputClassName,
  multiline = false,
  placeholder = 'Click to edit...',
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setEditValue(value);
  }, [value]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  if (isEditing && editMode) {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div className="flex items-start gap-2">
        <InputComponent
          ref={inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex-1 bg-white dark:bg-gray-800 border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500",
            multiline && "min-h-[100px] resize-y",
            inputClassName
          )}
          placeholder={placeholder}
        />
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleSave}
            className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={cn(
        "group",
        editMode && "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-2 py-1 -mx-2 -my-1",
        className
      )}
      onClick={() => editMode && setIsEditing(true)}
    >
      <span className={!value ? 'text-gray-400 italic' : ''}>
        {value || placeholder}
      </span>
      {editMode && (
        <Edit2 className="inline-block w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 text-blue-500" />
      )}
    </div>
  );
}
