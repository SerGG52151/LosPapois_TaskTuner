import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export type PriorityTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface FeatureTaskLite {
  id: number;
  name: string;
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
}

/**
 * Right-hand panel that explodes the selected feature into:
 *   - Title + blue "Descripción" callout
 *   - Stats block (developer / SPs / priority / progress) + progress bar
 *   - "Tareas Asociadas" list (or empty state)
 */
function FeatureDetailPanel({ feature }: FeatureDetailPanelProps) {
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
          <h4 className="text-sm font-semibold text-gray-800">Descripción</h4>
        </div>
        <p className="text-sm text-gray-700">{feature.description}</p>
      </div>

      {/* Stats + progress */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <Stat label="Desarrollador" value={feature.developer} />
          <Stat label="Story Points" value={`${feature.storyPoints} SPs`} />
          <Stat label="Prioridad" value={feature.priority} valueClass={priorityClass} />
          <Stat label="Progreso" value={`${safeProgress}%`} />
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
          {feature.completedTasks} de {feature.totalTasks} tareas completadas
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h4 className="text-base font-semibold text-gray-800 mb-3">Tareas Asociadas</h4>
        {feature.tasks && feature.tasks.length > 0 ? (
          <ul className="space-y-2">
            {feature.tasks.map(t => (
              <li
                key={t.id}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700"
              >
                {t.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">Sin tareas asociadas</p>
        )}
      </div>
    </div>
  );
}

export default React.memo(FeatureDetailPanel);
