import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type TaskDetailPriority = 'high' | 'medium' | 'low' | 'none';

const PRIORITY_BADGE: Record<TaskDetailPriority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-green-100 text-green-700',
  none: 'bg-gray-100 text-gray-600',
};

const PRIORITY_LABEL: Record<TaskDetailPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'Not set',
};

export interface TaskDetailData {
  id: number;
  name: string;
  description: string | null;
  storyPoints: number | null;
  priority: TaskDetailPriority;
  developerName: string | null;
  state: string | null;
}

export interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskDetailData | null;
}

/**
 * Shared modal for displaying task details across the application
 * (e.g., from the TeamPage or SprintPage).
 */
export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
}: TaskDetailModalProps) {
  // Escape pattern shared with AddSprintModal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        // Prevent clicks inside modal content from bubbling up and triggering onClose
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2
            id="task-detail-title"
            className="text-xl font-bold text-gray-900 truncate pr-4"
          >
            {task.name || 'Untitled task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-6 overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-xs text-gray-500 mb-1">Story Points</div>
              <div className="text-sm font-semibold text-gray-800">
                {task.storyPoints != null ? `${task.storyPoints} SP` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Priority</div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[task.priority]}`}
              >
                {PRIORITY_LABEL[task.priority]}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Developer</div>
              <div className="text-sm font-semibold text-gray-800 truncate">
                {task.developerName || 'Unassigned'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <div className="text-sm font-semibold text-gray-800">
                {task.state || 'N/A'}
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div>
            <div className="text-sm font-bold text-gray-800 mb-2">Description</div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              {task.description ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No description available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}