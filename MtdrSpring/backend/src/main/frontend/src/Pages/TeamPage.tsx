import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  KpiCard,
  MemberDetailPanel,
  MemberListItem,
} from '../Components/Team';
import type { AvatarTone } from '../Components/Team';
import { getFromStorage, STORAGE_KEYS } from '../Utils/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — visual-only until the team / KPI endpoints are wired.
// Each section is grouped + commented so the swap to real data is mechanical:
// replace the constant with a hook (e.g. useProjectKpis(projectId)) and pipe
// the same shape into the components.
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectDTO {
  pjId: number;
  namePj: string;
}

interface MockMember {
  id: number;
  name: string;
  role: string;
  email: string;
  avatarTone: AvatarTone;
}

const MOCK_MEMBERS: MockMember[] = [
  { id: 1, name: 'Ana García',   role: 'Frontend Developer', email: 'ana.garcia@tasktuner.com',   avatarTone: 'brand'   },
  { id: 2, name: 'Carlos Ruiz',  role: 'Backend Developer',  email: 'carlos.ruiz@tasktuner.com',  avatarTone: 'brand'   },
  { id: 3, name: 'María López',  role: 'QA Engineer',        email: 'maria.lopez@tasktuner.com',  avatarTone: 'brand'   },
  { id: 4, name: 'Juan Pérez',   role: 'DevOps Engineer',    email: 'juan.perez@tasktuner.com',   avatarTone: 'neutral' },
];

interface MemberKpis {
  tasksCompleted: number;
  cycleTime: string;
  features: number;
  progress: string;
}

const MOCK_MEMBER_KPIS: Record<number, MemberKpis> = {
  1: { tasksCompleted: 2, cycleTime: '2.5 días', features: 2, progress: '50%' },
  2: { tasksCompleted: 0, cycleTime: '0 días',   features: 0, progress: '0%'  },
  3: { tasksCompleted: 0, cycleTime: '0 días',   features: 0, progress: '0%'  },
  4: { tasksCompleted: 0, cycleTime: '0 días',   features: 0, progress: '0%'  },
};

const EMPTY_MEMBER_KPIS: MemberKpis = {
  tasksCompleted: 0,
  cycleTime: '—',
  features: 0,
  progress: '—',
};

const PROJECT_KPIS = {
  avgProgress: 50,
  carryRate: 0,
  taskDelay: 0,
  cycleTime: '2.9 días',
  projectDelay: '0 días',
  expectedDate: '14/6/2026',
  sprintsCount: 3,
  delayedTasks: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Inline visualizations — kept here because they're throwaway shapes specific
// to these mock cards. Promote to /Components when real data drives them.
// ─────────────────────────────────────────────────────────────────────────────

/** Three-segment ring approximating the screenshot's progress donut. */
function DonutChart({ value }: { value: number }) {
  const radius = 28;
  const stroke = 9;
  const c = 2 * Math.PI * radius;
  const greenLen = Math.max(0, Math.min(value, 100)) / 100 * c;
  const blueLen = 0.12 * c;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto" aria-hidden="true">
      <g transform="rotate(-90 40 40)">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke="#22C55E" strokeWidth={stroke}
          strokeDasharray={`${greenLen} ${c}`}
        />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke="#3B82F6" strokeWidth={stroke}
          strokeDasharray={`${blueLen} ${c}`}
          strokeDashoffset={-greenLen}
        />
      </g>
    </svg>
  );
}

/** Decorative cycle-time sparkline. */
function Sparkline() {
  return (
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      className="w-full h-5"
      aria-hidden="true"
    >
      <path d="M 0 15 Q 25 6, 50 9 T 100 12" fill="none" stroke="#3B82F6" strokeWidth="2" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  // The route is /projects/:projectId/team — every "Equipo" link in the
  // sidebar carries its own projectId, so this param uniquely identifies
  // which project's team we're viewing (no more cross-group highlight bugs).
  const { projectId: rawProjectId } = useParams<{ projectId: string }>();
  const projectId = rawProjectId ? Number(rawProjectId) : undefined;

  const [selectedId, setSelectedId] = useState<number>(MOCK_MEMBERS[0].id);

  // Resolve the project name from the cached project list (filled by the
  // sidebar fetch / mock fallback). When real backend wiring lands, this
  // becomes a fetch keyed by projectId — the URL is already correct.
  const projectName = useMemo(() => {
    const projects = getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS) ?? [];
    const match = projectId != null
      ? projects.find(p => p.pjId === projectId)
      : undefined;
    return match?.namePj
      ?? projects[0]?.namePj
      ?? 'Sistema de Gestión de Inventario';
  }, [projectId]);

  const selectedMember =
    MOCK_MEMBERS.find(m => m.id === selectedId) ?? MOCK_MEMBERS[0];
  const selectedKpis = MOCK_MEMBER_KPIS[selectedMember.id] ?? EMPTY_MEMBER_KPIS;

  return (
    <div className="bg-gray-50 min-h-full px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            {projectName} - Equipo
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los miembros del equipo y visualiza sus KPIs
          </p>
        </header>

        {/* Project-level KPIs */}
        <section aria-labelledby="project-kpis-heading">
          <h2
            id="project-kpis-heading"
            className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-4"
          >
            <span className="h-5 w-1 bg-brand rounded-full" aria-hidden="true" />
            KPIs Promedio del Proyecto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              label="Progreso Promedio"
              value={`${PROJECT_KPIS.avgProgress}%`}
              icon={ArrowTrendingUpIcon}
              tone="success"
            >
              <DonutChart value={PROJECT_KPIS.avgProgress} />
            </KpiCard>

            <KpiCard
              label="Tasa de Arrastre Promedio"
              value={`${PROJECT_KPIS.carryRate}%`}
              icon={ExclamationCircleIcon}
              tone="warning"
            >
              <p className="text-xs text-gray-500">
                Promedio en {PROJECT_KPIS.sprintsCount} sprints
              </p>
            </KpiCard>

            <KpiCard
              label="Retraso Promedio en Tareas"
              value={`${PROJECT_KPIS.taskDelay}%`}
              icon={ExclamationCircleIcon}
              tone="danger"
            >
              <p className="text-xs text-gray-500">
                {PROJECT_KPIS.delayedTasks} tareas retrasadas
              </p>
            </KpiCard>

            <KpiCard
              label="Tiempo de Ciclo Promedio"
              value={PROJECT_KPIS.cycleTime}
              icon={ClockIcon}
              tone="info"
            >
              <Sparkline />
            </KpiCard>

            <KpiCard
              label="Retraso del Proyecto"
              value={PROJECT_KPIS.projectDelay}
              icon={CalendarDaysIcon}
              tone="success"
            >
              <p className="text-xs text-gray-500">
                Fecha esperada: {PROJECT_KPIS.expectedDate}
              </p>
            </KpiCard>
          </div>
        </section>

        {/* Members section */}
        <section
          aria-labelledby="members-heading"
          className="bg-white border border-gray-200 rounded-xl p-6
                     shadow-sm shadow-gray-200/60"
        >
          <h2
            id="members-heading"
            className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-6"
          >
            <span className="h-5 w-1 bg-brand rounded-full" aria-hidden="true" />
            Miembros del Equipo
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Left: members list */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserGroupIcon
                  className="h-5 w-5 text-gray-700"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-gray-800">
                  Miembros ({MOCK_MEMBERS.length})
                </span>
              </div>
              <div className="space-y-2">
                {MOCK_MEMBERS.map(m => (
                  <MemberListItem
                    key={m.id}
                    name={m.name}
                    role={m.role}
                    selected={m.id === selectedId}
                    avatarTone={m.avatarTone}
                    onSelect={() => setSelectedId(m.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right: selected member detail */}
            <MemberDetailPanel
              member={selectedMember}
              kpis={selectedKpis}
              onEdit={() => console.log('[TeamPage] edit', selectedMember.id)}
              onDelete={() => console.log('[TeamPage] delete', selectedMember.id)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
