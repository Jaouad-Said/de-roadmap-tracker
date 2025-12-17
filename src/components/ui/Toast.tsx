'use client';

import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast, hideToast } = useUIStore();
  
  if (!toast.visible) return null;
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };
  
  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg",
          bgColors[toast.type]
        )}
      >
        {icons[toast.type]}
        <p className="text-sm text-gray-900 dark:text-white">{toast.message}</p>
        <button
          onClick={hideToast}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
