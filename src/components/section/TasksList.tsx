'use client';

import { useState } from 'react';
import {
  Plus,
  Check,
  X,
  Edit2,
  Trash2,
  Calendar,
  Flag,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Task } from '@/types';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import { useUIStore } from '@/store/useUIStore';
import { cn, formatDate } from '@/lib/utils';
import { createTask } from '@/lib/migrateData';

interface TasksListProps {
  phaseId: string;
  sectionId: string;
  tasks: Task[];
}

const priorityColors = {
  low: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
  medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  high: 'text-red-600 bg-red-100 dark:bg-red-900/30',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function TasksList({ phaseId, sectionId, tasks }: TasksListProps) {
  const { addTask, updateTask, deleteTask, toggleTaskComplete } = useRoadmapStore();
  const { editMode, showToast } = useUIStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    const task = createTask(
      newTask.title.trim(),
      newTask.description.trim() || undefined,
      newTask.priority,
      newTask.dueDate || undefined
    );
    await addTask(phaseId, sectionId, task);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    setIsAdding(false);
    showToast('Task added successfully', 'success');
  };

  const handleUpdateTask = async (taskId: string) => {
    if (!editForm.title.trim()) return;
    
    await updateTask(phaseId, sectionId, taskId, {
      title: editForm.title.trim(),
      description: editForm.description.trim() || undefined,
      priority: editForm.priority,
      dueDate: editForm.dueDate || undefined,
    });
    setEditingId(null);
    showToast('Task updated', 'success');
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(phaseId, sectionId, taskId);
    showToast('Task deleted', 'success');
  };

  const handleToggleComplete = async (taskId: string) => {
    await toggleTaskComplete(phaseId, sectionId, taskId);
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || '',
    });
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const TaskForm = ({ 
    values, 
    onChange, 
    onSubmit, 
    onCancel 
  }: { 
    values: typeof newTask; 
    onChange: (v: typeof newTask) => void; 
    onSubmit: () => void; 
    onCancel: () => void;
  }) => (
    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <input
        type="text"
        value={values.title}
        onChange={(e) => onChange({ ...values, title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Task title..."
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <textarea
        value={values.description}
        onChange={(e) => onChange({ ...values, description: e.target.value })}
        placeholder="Description (optional)..."
        rows={2}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Priority</label>
          <select
            value={values.priority}
            onChange={(e) => onChange({ ...values, priority: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Due Date</label>
          <input
            type="date"
            value={values.dueDate}
            onChange={(e) => onChange({ ...values, dueDate: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
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

  const TaskItem = ({ task }: { task: Task }) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    
    if (editingId === task.id) {
      return (
        <TaskForm
          values={editForm}
          onChange={setEditForm}
          onSubmit={() => handleUpdateTask(task.id)}
          onCancel={() => setEditingId(null)}
        />
      );
    }
    
    return (
      <div className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border transition-colors",
        task.completed
          ? "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
      )}>
        <button
          onClick={() => handleToggleComplete(task.id)}
          className={cn(
            "flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-colors",
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 dark:border-gray-600 hover:border-green-500"
          )}
        >
          {task.completed && <Check className="w-3 h-3" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "font-medium text-gray-900 dark:text-white",
              task.completed && "line-through text-gray-400 dark:text-gray-500"
            )}>
              {task.title}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {editMode && (
                <>
                  <button
                    onClick={() => startEditing(task)}
                    className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {task.description && (
            <p className={cn(
              "text-sm text-gray-600 dark:text-gray-400 mt-1",
              task.completed && "line-through text-gray-400 dark:text-gray-500"
            )}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
              priorityColors[task.priority]
            )}>
              <Flag className="w-3 h-3" />
              {priorityLabels[task.priority]}
            </span>
            
            {task.dueDate && (
              <span className={cn(
                "inline-flex items-center gap-1 text-xs",
                isOverdue ? "text-red-500" : "text-gray-500 dark:text-gray-400"
              )}>
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
            
            {task.completedAt && (
              <span className="text-xs text-green-500">
                Completed {formatDate(task.completedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {completedCount} of {tasks.length} tasks completed
        </span>
        {tasks.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((completedCount / tasks.length) * 100)}%` }}
              />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {Math.round((completedCount / tasks.length) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          {pendingTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Add new task */}
      {editMode && (
        <div>
          {isAdding ? (
            <TaskForm
              values={newTask}
              onChange={setNewTask}
              onSubmit={handleAddTask}
              onCancel={() => {
                setIsAdding(false);
                setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
              }}
            />
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Completed ({completedTasks.length})
          </h4>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && !isAdding && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No tasks yet</p>
          {editMode && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Add your first task
            </button>
          )}
        </div>
      )}
    </div>
  );
}
