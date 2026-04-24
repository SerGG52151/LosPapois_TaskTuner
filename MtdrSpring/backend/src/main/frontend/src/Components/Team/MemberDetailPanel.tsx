import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import MemberAvatar, { AvatarTone } from './MemberAvatar';

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

export interface MemberDetailPanelProps {
  member: MemberDetailMember;
  kpis: MemberDetailKpis;
  onEdit?: () => void;
  onDelete?: () => void;
}

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
 * Right-hand panel showing the selected member's profile + per-project KPIs.
 * Edit / Delete buttons are wired through optional callbacks so the parent
 * controls what happens (modal, confirmation dialog, etc.).
 */
function MemberDetailPanel({
  member,
  kpis,
  onEdit,
  onDelete,
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
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                       bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <TrashIcon className="h-4 w-4" aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <h4 className="text-base font-semibold text-gray-800 mb-3">
        KPIs del Miembro en el Proyecto
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniKpi label="Tareas Completadas" value={kpis.tasksCompleted} />
        <MiniKpi label="Tiempo de Ciclo Promedio" value={kpis.cycleTime} />
        <MiniKpi label="Features Asignadas" value={kpis.features} />
        <MiniKpi label="Progreso Actual" value={kpis.progress} />
      </div>
    </div>
  );
}

export default React.memo(MemberDetailPanel);
