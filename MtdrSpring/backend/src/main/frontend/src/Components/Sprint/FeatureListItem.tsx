import React from 'react';
import StatusBadge, { StatusTone } from './StatusBadge';

export interface FeatureListItemProps {
  name: string;
  developer: string;
  storyPoints: number;
  completedTasks: number;
  totalTasks: number;
  statusLabel: string;
  statusTone?: StatusTone;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Selectable feature card shown in the left column of SprintPage.
 * Mirrors the visual contract of MemberListItem so the two pages feel
 * cohesive — selected state uses the same brand-bordered highlight.
 */
function FeatureListItem({
  name,
  developer,
  storyPoints,
  completedTasks,
  totalTasks,
  statusLabel,
  statusTone = 'neutral',
  selected,
  onSelect,
}: FeatureListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full p-4 rounded-xl border transition-colors text-left
        ${
          selected
            ? 'border-brand bg-brand-lighter'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-semibold text-gray-800 truncate">{name}</h4>
        <StatusBadge label={statusLabel} tone={statusTone} />
      </div>
      <div className="text-xs text-gray-500">
        {developer} · {storyPoints} SPs
      </div>
      <div className="text-xs text-gray-500">
        {completedTasks}/{totalTasks} tareas
      </div>
    </button>
  );
}

export default React.memo(FeatureListItem);
