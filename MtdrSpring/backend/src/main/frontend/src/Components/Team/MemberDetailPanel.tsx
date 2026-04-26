import React from 'react';
import {
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import MemberAvatar, { AvatarTone } from './MemberAvatar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MemberDetailMember {
  id: number;
  name: string;
  role: string;
  email: string;
  avatarTone?: AvatarTone;
}

export interface MemberDetailKpis {
  tasksCompleted: number;
  cycleTime: string;
  features: number;
  progress: string;
}

export type MemberTaskPriority = 'high' | 'medium' | 'low' | 'none';

export interface MemberTaskLite {
  id: number;
  name: string;
  /** Long-text description (TaskTT.infoTask). Optional — enables expansion. */
  description?: string | null;
  /** Name of the parent feature, if any. Tasks without featureId omit it. */
  featureName?: string;
  /** Task-level priority (TaskTT.priority). */
  priority: MemberTaskPriority;
  /** Story points of the task, if set. */
  storyPoints?: number | null;
  /** True when the task has a real end date — i.e., actually closed. */
  done: boolean;
}

export interface MemberDetailPanelProps {
  member: MemberDetailMember;
  kpis: MemberDetailKpis;
  /** Tasks assigned to this member in the current project. */
  tasks?: MemberTaskLite[];
  onEdit?: () => void;
  onDelete?: () => void;
  onTaskClick?: (taskId: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PRIORITY_BADGE: Record<MemberTaskPriority, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low:    'bg-green-100 text-green-700',
  none:   'bg-gray-100 text-gray-600',
};

const PRIORITY_LABEL: Record<MemberTaskPriority, string> = {
  high:   'High',
  medium: 'Medium',
  low:    'Low',
  none:   'Not set',
};

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────────────────

/** Compact KPI tile used inside the member detail panel. */
function MiniKpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
      <div className="text-xs text-gray-500 mb-1 leading-snug">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

/**
 * Single task row in the "Assigned Tasks" list.
 *
 * Layout:
 *   [status-icon] [name + meta]  [priority chip]  [chevron if expandable]
 *
 * When the task has a description, the row becomes a native <details>
 * element — click anywhere on the summary line to expand and read the
 * full body. Tasks without description render as a plain row.
 */
function TaskItem({ task, onClick }: { task: MemberTaskLite; onClick?: () => void }) {
  const hasDescription =
    !!task.description && task.description.trim().length > 0;

  return (
    <li
      className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Completion indicator — filled green check when done, empty circle otherwise. */}
        {task.done ? (
          <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" aria-hidden="true" />
        ) : (
          <span
            className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0"
            aria-hidden="true"
          />
        )}

        <div className="min-w-0 flex-1">
          <div
            className={`text-sm font-medium truncate ${
              task.done ? 'text-gray-400 line-through' : 'text-gray-800'
            }`}
          >
            {task.name}
          </div>
          {(task.featureName || task.storyPoints != null) && (
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              {task.featureName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 truncate max-w-[180px]">
                  {task.featureName}
                </span>
              )}
              {task.storyPoints != null && task.storyPoints > 0 && (
                <span>{task.storyPoints} SP</span>
              )}
            </div>
          )}
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-xs font-medium shrink-0
                      ${PRIORITY_BADGE[task.priority]}`}
        >
          {PRIORITY_LABEL[task.priority]}
        </span>

        <ChevronRightIcon
          className="size-4 text-gray-400 shrink-0"
          aria-hidden="true"
        />
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main panel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Right-hand panel showing the selected member's profile, per-project KPIs,
 * and the tasks assigned to them. Edit / Delete buttons are wired through
 * optional callbacks so the parent controls what happens (modal, confirm).
 */
function MemberDetailPanel({
  member,
  kpis,
  tasks,
  onEdit,
  onDelete,
  onTaskClick
}: MemberDetailPanelProps) {
  return (
    <div>
      {/* Header: avatar + identity + actions */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <MemberAvatar name={member.name} size="lg" tone={member.avatarTone} />
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-800 truncate">{member.name}</h3>
            <p className="text-sm text-gray-600 truncate">{member.role}</p>
            <p className="text-sm text-gray-500 truncate">{member.email}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                       bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                       bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <TrashIcon className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      {/* KPIs */}
      <h4 className="text-base font-semibold text-gray-800 mb-3">
        Project Member KPIs
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniKpi label="Completed Tasks" value={kpis.tasksCompleted} />
        <MiniKpi label="Average Cycle Time" value={kpis.cycleTime} />
        <MiniKpi label="Assigned Features" value={kpis.features} />
        <MiniKpi label="Current Progress" value={kpis.progress} />
      </div>

      {/* Tasks — shown only when the parent passes data, so the panel stays
          reusable for consumers that don't care about task detail. */}
      {tasks && (
        <>
          <h4 className="text-base font-semibold text-gray-800 mt-6 mb-3">
            Assigned Tasks ({tasks.length})
          </h4>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400">
              This member has no tasks assigned in this project.
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map(t => (
                <TaskItem key={t.id} task={t} onClick={() => onTaskClick?.(t.id)} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default React.memo(MemberDetailPanel);
