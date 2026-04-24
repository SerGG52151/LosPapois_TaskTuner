import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { KpiCard } from '../Components/Team'; // shared visual primitive — promote to /Common if it spreads further
import {
  FeatureDetailPanel,
  FeatureFilters,
  FeatureListItem,
} from '../Components/Sprint';
import type {
  FeatureDetailData,
  FilterKey,
  FilterValues,
  PriorityTone,
} from '../Components/Sprint';
import type { StatusTone } from '../Components/Sprint';
import { getFromStorage, STORAGE_KEYS } from '../Utils/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — visual-only until the sprint endpoints are wired.
// All MOCK_* lives at the top so the swap to real hooks is mechanical.
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectDTO {
  pjId: number;
  namePj: string;
}

interface SprintInfo {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  kpis: {
    progress: number;
    carryRate: number;
    carriedFeatures: number;
    totalFeatures: number;
    taskDelay: number;
    delayedTasks: number;
    cycleTime: string;
  };
}

// One mock sprint shared across all sprintIds — the page swaps in the
// matching name when present, otherwise falls back to "Sprint {id}".
const MOCK_SPRINT_BASE: Omit<SprintInfo, 'id' | 'name'> = {
  startDate: '15 mar 2026',
  endDate:   '29 mar 2026',
  totalTasks: 0,
  kpis: {
    progress: 0,
    carryRate: 0,
    carriedFeatures: 0,
    totalFeatures: 2,
    taskDelay: 0,
    delayedTasks: 0,
    cycleTime: '0.0 días',
  },
};

interface MockFeature {
  id: number;
  name: string;
  developer: string;
  storyPoints: number;
  completedTasks: number;
  totalTasks: number;
  statusLabel: string;
  statusTone: StatusTone;
  // Detail-only:
  description: string;
  priority: string;
  priorityTone: PriorityTone;
  progress: number;
}

const MOCK_FEATURES: MockFeature[] = [
  {
    id: 1,
    name: 'Módulo de Usuarios',
    developer: 'Ana García',
    storyPoints: 8,
    completedTasks: 0,
    totalTasks: 0,
    statusLabel: 'Completada',
    statusTone: 'success',
    description:
      'Crear módulo completo de gestión de usuarios con roles y permisos. Incluye CRUD de usuarios, asignación de roles y auditoría de acciones.',
    priority: 'Alta',
    priorityTone: 'danger',
    progress: 0,
  },
  {
    id: 2,
    name: 'Base de Datos',
    developer: 'Carlos Ruiz',
    storyPoints: 13,
    completedTasks: 0,
    totalTasks: 0,
    statusLabel: 'Completada',
    statusTone: 'success',
    description:
      'Diseñar e implementar el esquema relacional para soportar usuarios, productos, inventario y movimientos. Migraciones reproducibles.',
    priority: 'Alta',
    priorityTone: 'danger',
    progress: 0,
  },
];

// Decorative cycle-time sparkline. Inline because it's specific to this card.
function Sparkline() {
  return (
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      className="w-full h-5"
      aria-hidden="true"
    >
      <path
        d="M 0 14 Q 25 6, 50 10 T 100 12"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SprintPage() {
  const { projectId: rawProjectId, sprintId: rawSprintId } = useParams<{
    projectId: string;
    sprintId: string;
  }>();
  const projectId = rawProjectId ? Number(rawProjectId) : undefined;
  const sprintId = rawSprintId ? Number(rawSprintId) : undefined;

  // Resolve project name from the cached project list (filled by the sidebar).
  // When backend wiring lands this becomes a fetch keyed by projectId.
  const projectName = useMemo(() => {
    const projects = getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS) ?? [];
    const match = projectId != null
      ? projects.find(p => p.pjId === projectId)
      : undefined;
    return match?.namePj ?? projects[0]?.namePj ?? 'Proyecto';
  }, [projectId]);

  // Build the visible sprint object. Real wiring replaces MOCK_SPRINT_BASE
  // with a fetch keyed by sprintId — the rest stays put.
  const sprint: SprintInfo = useMemo(
    () => ({
      id: sprintId ?? 0,
      name: sprintId != null ? `Sprint ${sprintId}` : 'Sprint',
      ...MOCK_SPRINT_BASE,
    }),
    [sprintId]
  );

  // Filter state — visual-only filters wired so the dropdowns "feel" alive.
  const [filters, setFilters] = useState<FilterValues>({});
  const handleFilterChange = (key: FilterKey, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value || undefined }));

  // Derive options from the mock features so dropdowns aren't empty.
  const filterOptions = useMemo(() => {
    const developers = Array.from(new Set(MOCK_FEATURES.map(f => f.developer)));
    const statuses = Array.from(new Set(MOCK_FEATURES.map(f => f.statusLabel)));
    const priorities = Array.from(new Set(MOCK_FEATURES.map(f => f.priority)));
    const sps = Array.from(new Set(MOCK_FEATURES.map(f => String(f.storyPoints))));
    return {
      developers: developers.map(d => ({ value: d, label: d })),
      statuses:   statuses.map(s => ({ value: s, label: s })),
      priorities: priorities.map(p => ({ value: p, label: p })),
      storyPoints: sps.map(s => ({ value: s, label: `${s} SPs` })),
    };
  }, []);

  // Apply filters (cheap, mock data is tiny).
  const visibleFeatures = useMemo(
    () =>
      MOCK_FEATURES.filter(f => {
        if (filters.developer && f.developer !== filters.developer) return false;
        if (filters.status && f.statusLabel !== filters.status) return false;
        if (filters.priority && f.priority !== filters.priority) return false;
        if (filters.sp && String(f.storyPoints) !== filters.sp) return false;
        return true;
      }),
    [filters]
  );

  const [selectedFeatureId, setSelectedFeatureId] = useState<number>(
    MOCK_FEATURES[0].id
  );

  // Keep selection valid as filters change — fall back to first visible.
  const selectedFeature: MockFeature =
    visibleFeatures.find(f => f.id === selectedFeatureId)
      ?? visibleFeatures[0]
      ?? MOCK_FEATURES[0];

  const detail: FeatureDetailData = {
    id: selectedFeature.id,
    name: selectedFeature.name,
    description: selectedFeature.description,
    developer: selectedFeature.developer,
    storyPoints: selectedFeature.storyPoints,
    priority: selectedFeature.priority,
    priorityTone: selectedFeature.priorityTone,
    progress: selectedFeature.progress,
    completedTasks: selectedFeature.completedTasks,
    totalTasks: selectedFeature.totalTasks,
    tasks: [], // empty — matches the screenshot's "no tareas" state
  };

  return (
    <div className="bg-gray-50 min-h-full px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            {projectName} - {sprint.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 mt-2">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              {sprint.startDate} - {sprint.endDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
              {sprint.totalTasks} tareas totales
            </span>
          </div>
        </header>

        {/* Sprint KPIs */}
        <section
          aria-labelledby="sprint-kpis-heading"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <h2 id="sprint-kpis-heading" className="sr-only">
            KPIs del Sprint
          </h2>

          <KpiCard
            label="Progreso del Sprint"
            value={`${sprint.kpis.progress}%`}
            icon={ArrowTrendingUpIcon}
            tone="success"
          />

          <KpiCard
            label="Tasa de Arrastre"
            value={`${sprint.kpis.carryRate}%`}
            icon={ExclamationCircleIcon}
            tone="warning"
          >
            <p className="text-xs text-gray-500">
              {sprint.kpis.carriedFeatures} de {sprint.kpis.totalFeatures} features arrastradas
            </p>
          </KpiCard>

          <KpiCard
            label="Retraso en Tareas"
            value={`${sprint.kpis.taskDelay}%`}
            icon={ExclamationCircleIcon}
            tone="danger"
          >
            <p className="text-xs text-gray-500">
              {sprint.kpis.delayedTasks} tareas retrasadas
            </p>
          </KpiCard>

          <KpiCard
            label="Tiempo de Ciclo"
            value={sprint.kpis.cycleTime}
            icon={ClockIcon}
            tone="info"
          >
            <Sparkline />
          </KpiCard>
        </section>

        {/* Features section */}
        <section
          aria-labelledby="features-heading"
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-5
                     shadow-sm shadow-gray-200/60"
        >
          <h2
            id="features-heading"
            className="flex items-center gap-3 text-xl font-bold text-gray-800"
          >
            <span className="h-5 w-1 bg-brand rounded-full" aria-hidden="true" />
            Features del Sprint
          </h2>

          <FeatureFilters
            developers={filterOptions.developers}
            statuses={filterOptions.statuses}
            priorities={filterOptions.priorities}
            storyPoints={filterOptions.storyPoints}
            values={filters}
            onChange={handleFilterChange}
          />

          <div className="border-t border-gray-100 pt-5 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            {/* Left: features list */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Features ({visibleFeatures.length})
              </h3>
              {visibleFeatures.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No hay features que coincidan con los filtros
                </p>
              ) : (
                <div className="space-y-2">
                  {visibleFeatures.map(f => (
                    <FeatureListItem
                      key={f.id}
                      name={f.name}
                      developer={f.developer}
                      storyPoints={f.storyPoints}
                      completedTasks={f.completedTasks}
                      totalTasks={f.totalTasks}
                      statusLabel={f.statusLabel}
                      statusTone={f.statusTone}
                      selected={f.id === selectedFeature.id}
                      onSelect={() => setSelectedFeatureId(f.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: feature detail */}
            <FeatureDetailPanel feature={detail} />
          </div>
        </section>
      </div>
    </div>
  );
}
