import React from 'react';
import { ChevronRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export type PriorityTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface FeatureTaskLite {
  id: number;
  name: string;
  /** Long-text description (TaskTT.infoTask). Optional — empty/null = no body shown. */
  description?: string | null;
  storyPoints?: number | null;
  priority?: 'high' | 'medium' | 'low' | 'none';
  state?: 'active' | 'done' | 'delayed';
}

export interface FeatureDetailData {
  id: number;
  name: string;
  description: string;
  developer: string;
  storyPoints: number;
  priority: string;
  priorityTone?: PriorityTone;
  /** 0–100 */
  progress: number;
  completedTasks: number;
  totalTasks: number;
  tasks?: FeatureTaskLite[];
}

const PRIORITY_TEXT: Record<PriorityTone, string> = {
  success: 'text-green-600',
  warning: 'text-orange-500',
  danger:  'text-red-500',
  info:    'text-blue-500',
  neutral: 'text-gray-700',
};

const TASK_PRIORITY_BADGE: Record<'high' | 'medium' | 'low' | 'none', string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-green-100 text-green-700',
  none: 'bg-gray-100 text-gray-600',
};

const TASK_PRIORITY_LABEL: Record<'high' | 'medium' | 'low' | 'none', string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'Not set',
};

const TASK_STATE_BADGE: Record<'active' | 'done' | 'delayed', string> = {
  active: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  delayed: 'bg-amber-100 text-amber-700',
};

const TASK_STATE_LABEL: Record<'active' | 'done' | 'delayed', string> = {
  active: 'Active',
  done: 'Done',
  delayed: 'Delayed',
};

/**
 * Single task row in the "Linked Tasks" list.
 *
 * Behaviour:
 *   - No description → renders as a plain row, not interactive.
 *   - With description → uses the native <details> element so the user
 *     can click the row to expand the body. Zero JS state, fully
 *     keyboard-accessible (Tab + Enter), respects browser print.
 */
function TaskItem({ task, onClick }: { task: FeatureTaskLite; onClick?: () => void }) {
  const priority = task.priority ?? 'none';
  const state = task.state ?? 'active';

  return (
    <li
      className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-800 truncate">{task.name}</div>
          {task.storyPoints != null && task.storyPoints > 0 && (
            <div className="text-xs text-gray-500 mt-0.5">{task.storyPoints} SP</div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_STATE_BADGE[state]}`}
          >
            {TASK_STATE_LABEL[state]}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_PRIORITY_BADGE[priority]}`}
          >
            {TASK_PRIORITY_LABEL[priority]}
          </span>
          <ChevronRightIcon
            className="size-4 text-gray-400 shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>
    </li>
  );
}

/** One stat tile inside the gray summary block. */
function Stat({
  label,
  value,
  valueClass = 'text-gray-800',
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-sm font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

export interface FeatureDetailPanelProps {
  feature: FeatureDetailData;
  onTaskClick?: (taskId: number) => void;
}

/**
 * Right-hand panel that explodes the selected feature into:
 *   - Title + blue "Description" callout
 *   - Stats block (developer / SPs / priority / progress) + progress bar
 *   - "Linked Tasks" list (or empty state)
 */
function FeatureDetailPanel({ feature, onTaskClick }: FeatureDetailPanelProps) {
  const priorityClass =
    PRIORITY_TEXT[feature.priorityTone ?? 'neutral'] ?? PRIORITY_TEXT.neutral;
  const safeProgress = Math.max(0, Math.min(feature.progress, 100));

  return (
    <div className="space-y-5">
      <h3 className="text-2xl font-bold text-gray-800">{feature.name}</h3>

      {/* Description callout */}
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <DocumentTextIcon
            className="h-5 w-5 text-blue-500"
            aria-hidden="true"
          />
          <h4 className="text-sm font-semibold text-gray-800">Description</h4>
        </div>
        <p className="text-sm text-gray-700">{feature.description}</p>
      </div>

      {/* Stats + progress */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <Stat label="Developer" value={feature.developer} />
          <Stat label="Story Points" value={`${feature.storyPoints} SPs`} />
          <Stat label="Priority" value={feature.priority} valueClass={priorityClass} />
          <Stat label="Progress" value={`${safeProgress}%`} />
        </div>

        <div
          className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={safeProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-blue-500 transition-[width] duration-300"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          {feature.completedTasks} of {feature.totalTasks} tasks completed
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h4 className="text-base font-semibold text-gray-800 mb-3">Linked Tasks</h4>
        {feature.tasks && feature.tasks.length > 0 ? (
          <ul className="space-y-2">
            {feature.tasks.map(t => (
              <TaskItem key={t.id} task={t} onClick={() => onTaskClick?.(t.id)} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No linked tasks</p>
        )}
      </div>
    </div>
  );
}

export default React.memo(FeatureDetailPanel);
