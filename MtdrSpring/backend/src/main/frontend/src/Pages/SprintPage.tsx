import React, { useEffect, useMemo, useState } from 'react';
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
  DeveloperTaskBoard,
  FeatureDetailPanel,
  FeatureFilters,
  FeatureListItem,
} from '../Components/Sprint';
import type {
  DeveloperBoardKpis,
  DeveloperBoardMember,
  DeveloperBoardTask,
  FeatureDetailData,
  FilterKey,
  FilterValues,
  PriorityTone,
  TaskBoardMode,
} from '../Components/Sprint';
import type { StatusTone } from '../Components/Sprint';
import TaskDetailModal from '../Components/Common/TaskDetailModal';
import type { TaskDetailData } from '../Components/Common/TaskDetailModal';
import PageLoading from '../Components/Common/PageLoading';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../Utils/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — visual-only until the sprint endpoints are wired.
// All MOCK_* lives at the top so the swap to real hooks is mechanical.
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectDTO {
  pjId: number;
  namePj: string;
}

/** Backend SprintTT shape — only the fields this page consumes. */
interface SprintDTO {
  sprId: number;
  nameSprint: string;
  dateStartSpr: string | null;
  dateEndSpr: string | null;
  taskGoal: number | null;
  stateSprint: string;
  pjId: number;
}

/** Backend SprintTaskTT shape — the junction table row + workflow state. */
interface SprintTaskDTO {
  sprId: number;
  taskId: number;
  /** 'active' | 'done' | 'delayed' (Oracle CHECK constraint). */
  stateTask: string;
}

/** Backend TaskTT shape — fields used for KPIs, features, and task detail. */
interface TaskDTO {
  taskId: number;
  nameTask?: string | null;
  /** Long-text description of the task (TaskTT.infoTask, max 2000 chars). */
  infoTask?: string | null;
  priority?: string | null;
  storyPoints: number | null;
  dateStartTask: string | null;
  dateEndSetTask: string | null;
  dateEndRealTask: string | null;
  userId?: number;
  featureId?: number | null;
}

/** Backend FeatureTT shape. */
interface FeatureDTO {
  featureId: number;
  nameFeature: string;
  priorityFeature: string | null;
  sprId: number;
}

/** Joined view: a task with its workflow state inside the sprint. */
interface SprintTaskJoined extends TaskDTO {
  stateTask: string;
}

/** Computed KPIs for the sprint header cards. */
interface ComputedKpis {
  progress: number;
  carryRate: number;
  carriedFeatures: number;
  totalFeatures: number;
  taskDelay: number;
  delayedTasks: number;
  cycleTime: string;
  totalTasks: number;
}

const ZERO_KPIS: ComputedKpis = {
  progress: 0,
  carryRate: 0,
  carriedFeatures: 0,
  totalFeatures: 0,
  taskDelay: 0,
  delayedTasks: 0,
  cycleTime: '0.0 days',
  totalTasks: 0,
};

/**
 * Derive the four sprint KPIs from the joined task list. All math lives in
 * the frontend because the backend exposes only `totalPoints + taskCount`
 * via /metrics — not enough for progress, carry rate, delay, or cycle time.
 *
 * Definitions (matching the screenshot semantics):
 *   - progress   = % of tasks marked 'done'
 *   - carryRate  = % of tasks marked 'delayed' at sprint close
 *   - taskDelay  = % of non-done tasks past their planned end date today
 *   - cycleTime  = average days between dateStartTask and dateEndRealTask
 *                  for tasks marked 'done'
 */
function computeSprintKpis(tasks: SprintTaskJoined[]): ComputedKpis {
  const total = tasks.length;
  if (total === 0) return ZERO_KPIS;

  const done    = tasks.filter(t => t.stateTask === 'done').length;
  const delayed = tasks.filter(t => t.stateTask === 'delayed').length;

  const todayIso = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter(
    t => t.stateTask !== 'done' && t.dateEndSetTask != null && t.dateEndSetTask < todayIso
  ).length;

  // Cycle time only meaningful for tasks that actually closed.
  const completed = tasks.filter(
    t => t.stateTask === 'done' && t.dateStartTask && t.dateEndRealTask
  );
  const dayMs = 1000 * 60 * 60 * 24;
  const avgCycleDays = completed.length === 0
    ? 0
    : completed.reduce((sum, t) => {
        const start = new Date(t.dateStartTask!).getTime();
        const end   = new Date(t.dateEndRealTask!).getTime();
        return sum + Math.max(0, (end - start) / dayMs);
      }, 0) / completed.length;

  return {
    progress:        Math.round((done / total) * 100),
    carryRate:       Math.round((delayed / total) * 100),
    carriedFeatures: delayed,
    totalFeatures:   total,
    taskDelay:       Math.round((overdue / total) * 100),
    delayedTasks:    overdue,
    cycleTime:       `${avgCycleDays.toFixed(1)} days`,
    totalTasks:      total,
  };
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

/** Backend priority → display label. */
function priorityLabel(p: string | null | undefined): string {
  if (!p) return 'Not set';
  return p.charAt(0).toUpperCase() + p.slice(1);
}

/** Backend priority → visual tone for the priority text + chip. */
function priorityToTone(p: string | null | undefined): PriorityTone {
  switch ((p ?? '').toLowerCase()) {
    case 'high':   return 'danger';
    case 'medium': return 'warning';
    case 'low':    return 'success';
    default:       return 'neutral';
  }
}

function mapTaskPriority(p: string | null | undefined): 'high' | 'medium' | 'low' | 'none' {
  switch ((p ?? '').toLowerCase()) {
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'none';
  }
}

function normalizeTaskState(s: string | null | undefined): 'active' | 'done' | 'delayed' {
  const state = (s ?? '').toLowerCase();
  if (state === 'done') return 'done';
  if (state === 'delayed') return 'delayed';
  return 'active';
}

function displayTaskState(s: string | null | undefined): string {
  const state = normalizeTaskState(s);
  if (state === 'done') return 'Done';
  if (state === 'delayed') return 'Delayed';
  return 'Active';
}

/** Derive a status label + tone from task completion progress. */
function statusFromProgress(progress: number): { label: string; tone: StatusTone } {
  if (progress >= 100) return { label: 'Completed', tone: 'success' };
  if (progress > 0)    return { label: 'In Progress', tone: 'info' };
  return { label: 'Pending', tone: 'neutral' };
}

/** Display-friendly date: "15 mar 2026" from "2026-03-15". Empty on null. */
function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
    cycleTime: '0.0 days',
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

type SprintContentView = 'features' | 'developers';

interface SprintUiPreferences {
  contentView: SprintContentView;
  developerTaskMode: TaskBoardMode;
  selectedFeatureId: number | null;
  selectedDeveloperKey: string | null;
  filters: FilterValues;
}

const sprintUiPrefsKey = (sid: number) => `${STORAGE_KEYS.CURRENT_SPRINT}_ui_${sid}`;

// MockFeature stays as the page's internal display shape — the enrich step
// builds objects with this same structure so the existing list/detail
// components don't need any changes. The MOCK_FEATURES seed data was
// removed once /api/sprints/{sprId}/features started feeding live data.

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

/** Linear progress bar used by sprint progress KPI card. */
function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(value, 100));

  return (
    <div className="space-y-1.5">
      <div
        className="w-full h-2.5 rounded-full bg-green-50 border border-green-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 transition-[width] duration-500"
          style={{ width: `${safe}%` }}
        />
      </div>
      <div className="text-[11px] text-green-700 font-medium">Progress tracked at {safe}%</div>
    </div>
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
    return match?.namePj ?? projects[0]?.namePj ?? 'Project';
  }, [projectId]);

  // Real sprint detail from the backend — name + dates come from
  // /api/sprints/{sprintId}.
  const [sprintDto, setSprintDto] = useState<SprintDTO | null>(null);

  // Joined sprint-tasks (the workflow link rows + each task's full data).
  // Drives every KPI on this page — re-derived via useMemo so we don't
  // recompute unless the underlying list changes.
  const [sprintTasks, setSprintTasks] = useState<SprintTaskJoined[]>([]);

  // Real features for this sprint (replaces MOCK_FEATURES). Comes from
  // /api/sprints/{sprId}/features which reads FEATURE_TT.
  const [rawFeatures, setRawFeatures] = useState<FeatureDTO[]>([]);

  // userId → display name lookup, for "developer" badge on each feature.
  // Built from /api/users-tt — small payload, fetched once on mount.
  const [usersById, setUsersById] = useState<Map<number, string>>(new Map());
  const [sprintDataLoading, setSprintDataLoading] = useState(
    sprintId != null && sprintId >= 0
  );
  const [usersLoading, setUsersLoading] = useState(true);
  const [contentView, setContentView] = useState<SprintContentView>('features');

  useEffect(() => {
    if (sprintId == null || sprintId < 0) {
      setSprintDto(null);
      setSprintTasks([]);
      setRawFeatures([]);
      setSprintDataLoading(false);
      return;
    }

    setSprintDataLoading(true);
    let cancelled = false;

    // Sprint header fetch (separate so the title + dates show ASAP, even
    // if the heavier KPI fetch is still pending).
    const sprintRequest = fetch(`/api/sprints/${sprintId}`)
      .then(res => (res.ok ? res.json() : null))
      .then((data: SprintDTO | null) => {
        if (cancelled) return;
        setSprintDto(data);
      })
      .catch(() => {});

    // Features for this sprint (real data, replaces MOCK_FEATURES).
    // Endpoint lives on FeatureTTController which is the canonical owner.
    const featuresRequest = fetch(`/api/features/sprint/${sprintId}`)
      .then(res => (res.ok ? res.json() : []))
      .then((data: FeatureDTO[]) => {
        if (cancelled) return;
        setRawFeatures(data);
      })
      .catch(() => {});

    // KPI data: link rows for this sprint + the full task list, joined by taskId.
    // Two requests instead of N (one per task) — Map lookup makes the join O(N).
    const tasksRequest = Promise.all([
      fetch(`/api/sprint-tasks/sprint/${sprintId}`).then(r => (r.ok ? r.json() : [])),
      fetch('/api/tasks').then(r => (r.ok ? r.json() : [])),
    ])
      .then(([links, allTasks]: [SprintTaskDTO[], TaskDTO[]]) => {
        if (cancelled) return;
        const taskMap = new Map(allTasks.map(t => [t.taskId, t]));
        const joined: SprintTaskJoined[] = links
          .map(link => {
            const task = taskMap.get(link.taskId);
            return task ? { ...task, stateTask: link.stateTask } : null;
          })
          .filter((t): t is SprintTaskJoined => t !== null);
        setSprintTasks(joined);
      })
      .catch(() => {
        /* Leave KPIs empty on failure — page falls back to ZERO_KPIS via memo. */
      });

    Promise.allSettled([sprintRequest, featuresRequest, tasksRequest]).finally(() => {
      if (!cancelled) setSprintDataLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [sprintId]);

  // One-time fetch of all users for the developer-name lookup. Lives across
  // sprint navigations (deps: []) — same map serves every feature row.
  useEffect(() => {
    let cancelled = false;
    setUsersLoading(true);
    fetch('/api/users-tt')
      .then(r => (r.ok ? r.json() : []))
      .then((data: Array<{ userId: number; nameUser: string }>) => {
        if (cancelled) return;
        setUsersById(new Map(data.map(u => [u.userId, u.nameUser])));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isPageLoading =
    sprintId != null
    && sprintId >= 0
    && (sprintDataLoading || usersLoading);

  // KPIs are pure derivation — no extra state needed.
  const computedKpis = useMemo(
    () => computeSprintKpis(sprintTasks),
    [sprintTasks]
  );

  // Enrich each backend Feature with stats computed from this sprint's tasks:
  // total/done counts, summed story points, the assigned developer (if all
  // tasks share an owner), and a derived status label.
  const displayFeatures = useMemo<MockFeature[]>(() => {
    return rawFeatures.map(f => {
      const tasksOfFeature = sprintTasks.filter(t => t.featureId === f.featureId);
      const total = tasksOfFeature.length;
      const completed = tasksOfFeature.filter(t => t.stateTask === 'done').length;
      const sps = tasksOfFeature.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
      const status = statusFromProgress(progress);

      // Developer attribution: pick the most common owner. If multiple,
      // append "+N" to flag that more than one person works on this feature.
      const ownerIds = Array.from(
        new Set(tasksOfFeature.map(t => t.userId).filter((u): u is number => u != null))
      );
      const firstOwner = ownerIds.length > 0
        ? usersById.get(ownerIds[0]) ?? `User #${ownerIds[0]}`
        : 'Unassigned';
      const developer = ownerIds.length > 1
        ? `${firstOwner} +${ownerIds.length - 1}`
        : firstOwner;

      return {
        id: f.featureId,
        name: f.nameFeature,
        developer,
        storyPoints: sps,
        completedTasks: completed,
        totalTasks: total,
        statusLabel: status.label,
        statusTone:  status.tone,
        // Backend Feature has no description/long-text field today.
        description: 'No description available.',
        priority:     priorityLabel(f.priorityFeature),
        priorityTone: priorityToTone(f.priorityFeature),
        progress,
      };
    });
  }, [rawFeatures, sprintTasks, usersById]);

  // Merge real backend data over the mock base. The page still renders
  // sensibly while fetches are pending or if they fail.
  const sprint: SprintInfo = useMemo(
    () => ({
      id: sprintDto?.sprId ?? sprintId ?? 0,
      name:
        sprintDto?.nameSprint
        ?? (sprintId != null ? `Sprint ${sprintId}` : 'Sprint'),
      startDate: sprintDto
        ? formatDate(sprintDto.dateStartSpr)
        : MOCK_SPRINT_BASE.startDate,
      endDate: sprintDto
        ? formatDate(sprintDto.dateEndSpr)
        : MOCK_SPRINT_BASE.endDate,
      totalTasks: computedKpis.totalTasks,
      kpis: computedKpis,
    }),
    [sprintDto, sprintId, computedKpis]
  );

  // Filter state — visual-only filters wired so the dropdowns "feel" alive.
  const [filters, setFilters] = useState<FilterValues>({});
  const handleFilterChange = (key: FilterKey, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value || undefined }));

  // Derive filter options from the live feature list — empty until the
  // fetch resolves, so the dropdowns "fill in" as data arrives.
  const filterOptions = useMemo(() => {
    const developers = Array.from(new Set(displayFeatures.map(f => f.developer)));
    const statuses   = Array.from(new Set(displayFeatures.map(f => f.statusLabel)));
    const priorities = Array.from(new Set(displayFeatures.map(f => f.priority)));
    const sps        = Array.from(new Set(displayFeatures.map(f => String(f.storyPoints))));
    return {
      developers:  developers.map(d => ({ value: d, label: d })),
      statuses:    statuses.map(s => ({ value: s, label: s })),
      priorities:  priorities.map(p => ({ value: p, label: p })),
      storyPoints: sps.map(s => ({ value: s, label: `${s} SPs` })),
    };
  }, [displayFeatures]);

  // Apply filters over the live features.
  const visibleFeatures = useMemo(
    () =>
      displayFeatures.filter(f => {
        if (filters.developer && f.developer !== filters.developer) return false;
        if (filters.status && f.statusLabel !== filters.status) return false;
        if (filters.priority && f.priority !== filters.priority) return false;
        if (filters.sp && String(f.storyPoints) !== filters.sp) return false;
        return true;
      }),
    [displayFeatures, filters]
  );

  // Selection is nullable so we can render an empty state when no features.
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
  const [selectedDeveloperKey, setSelectedDeveloperKey] = useState<string | null>(null);
  const [developerTaskMode, setDeveloperTaskMode] = useState<TaskBoardMode>('list');

  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskDetailData | null>(null);

  // Load persisted UI selections for this sprint (view mode, filters, etc.).
  // If nothing was saved yet, fall back to sensible defaults.
  useEffect(() => {
    setSelectedTaskForModal(null);

    if (sprintId == null || sprintId < 0) {
      setContentView('features');
      setDeveloperTaskMode('list');
      setSelectedFeatureId(null);
      setSelectedDeveloperKey(null);
      setFilters({});
      return;
    }

    const prefs = getFromStorage<SprintUiPreferences>(sprintUiPrefsKey(sprintId));
    setContentView(prefs?.contentView === 'developers' ? 'developers' : 'features');
    setDeveloperTaskMode(prefs?.developerTaskMode === 'kanban' ? 'kanban' : 'list');
    setSelectedFeatureId(typeof prefs?.selectedFeatureId === 'number' ? prefs.selectedFeatureId : null);
    setSelectedDeveloperKey(typeof prefs?.selectedDeveloperKey === 'string' ? prefs.selectedDeveloperKey : null);
    setFilters(prefs?.filters ?? {});
  }, [sprintId]);

  // Persist all interactive selections per sprint so users can leave and
  // return without losing their preferred view/mode/filter state.
  useEffect(() => {
    if (sprintId == null || sprintId < 0) return;

    const prefs: SprintUiPreferences = {
      contentView,
      developerTaskMode,
      selectedFeatureId,
      selectedDeveloperKey,
      filters,
    };
    saveToStorage(sprintUiPrefsKey(sprintId), prefs);
  }, [
    sprintId,
    contentView,
    developerTaskMode,
    selectedFeatureId,
    selectedDeveloperKey,
    filters,
  ]);

  const developerBuckets = useMemo(() => {
    const grouped = new Map<string, SprintTaskJoined[]>();
    sprintTasks.forEach(task => {
      const key = task.userId != null ? String(task.userId) : 'unassigned';
      const existing = grouped.get(key) ?? [];
      existing.push(task);
      grouped.set(key, existing);
    });

    const rows: Array<DeveloperBoardMember & { tasks: SprintTaskJoined[] }> =
      Array.from(grouped.entries()).map(([key, tasks]) => {
        const name = key === 'unassigned'
          ? 'Unassigned'
          : usersById.get(Number(key)) ?? `User #${key}`;
        const subtitle = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
        return { key, name, subtitle, tasks };
      });

    return rows.sort((a, b) => {
      if (a.key === 'unassigned') return 1;
      if (b.key === 'unassigned') return -1;
      return a.name.localeCompare(b.name);
    });
  }, [sprintTasks, usersById]);

  useEffect(() => {
    if (developerBuckets.length === 0) {
      setSelectedDeveloperKey(null);
      return;
    }
    const exists = selectedDeveloperKey
      ? developerBuckets.some(d => d.key === selectedDeveloperKey)
      : false;
    if (!exists) setSelectedDeveloperKey(developerBuckets[0].key);
  }, [developerBuckets, selectedDeveloperKey]);

  const selectedDeveloper =
    developerBuckets.find(d => d.key === selectedDeveloperKey) ?? null;

  const selectedDeveloperKpis = useMemo<DeveloperBoardKpis>(() => {
    if (!selectedDeveloper) {
      return {
        tasksCompleted: 0,
        cycleTime: '—',
        assignedTasks: 0,
        totalStoryPoints: 0,
        progress: '—',
      };
    }

    const tasks = selectedDeveloper.tasks;
    if (tasks.length === 0) {
      return {
        tasksCompleted: 0,
        cycleTime: '—',
        assignedTasks: 0,
        totalStoryPoints: 0,
        progress: '—',
      };
    }

    const completed = tasks.filter(t => normalizeTaskState(t.stateTask) === 'done');
    const withDates = completed.filter(t => t.dateStartTask && t.dateEndRealTask);
    const dayMs = 1000 * 60 * 60 * 24;
    const avgCycleDays = withDates.length === 0
      ? 0
      : withDates.reduce((sum, t) => {
          const start = new Date(t.dateStartTask!).getTime();
          const end = new Date(t.dateEndRealTask!).getTime();
          return sum + Math.max(0, (end - start) / dayMs);
        }, 0) / withDates.length;

    return {
      tasksCompleted: completed.length,
      cycleTime: `${avgCycleDays.toFixed(1)} days`,
      assignedTasks: tasks.length,
      totalStoryPoints: tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0),
      progress: `${Math.round((completed.length / tasks.length) * 100)}%`,
    };
  }, [selectedDeveloper]);

  const featureNameById = useMemo(
    () => new Map(rawFeatures.map(f => [f.featureId, f.nameFeature])),
    [rawFeatures]
  );

  const selectedDeveloperTasks = useMemo<DeveloperBoardTask[]>(() => {
    if (!selectedDeveloper) return [];

    return selectedDeveloper.tasks
      .map(task => ({
        id: task.taskId,
        name: task.nameTask ?? `Task #${task.taskId}`,
        featureName: task.featureId != null ? featureNameById.get(task.featureId) : undefined,
        storyPoints: task.storyPoints,
        priority: mapTaskPriority(task.priority),
        state: normalizeTaskState(task.stateTask),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedDeveloper, featureNameById]);

  // Keep selection valid as the list changes — auto-pick first visible
  // when current selection drops out of the filtered set.
  const selectedFeature: MockFeature | null =
    visibleFeatures.find(f => f.id === selectedFeatureId) ?? visibleFeatures[0] ?? null;

  // Build the panel payload only when there's actually a selected feature.
  // Tasks list comes straight from the joined sprintTasks filtered by feature.
  const detail: FeatureDetailData | null = selectedFeature
    ? {
        id:             selectedFeature.id,
        name:           selectedFeature.name,
        description:    selectedFeature.description,
        developer:      selectedFeature.developer,
        storyPoints:    selectedFeature.storyPoints,
        priority:       selectedFeature.priority,
        priorityTone:   selectedFeature.priorityTone,
        progress:       selectedFeature.progress,
        completedTasks: selectedFeature.completedTasks,
        totalTasks:     selectedFeature.totalTasks,
        tasks: sprintTasks
          .filter(t => t.featureId === selectedFeature.id)
          .map(t => ({
            id: t.taskId,
            name: t.nameTask ?? `Task #${t.taskId}`,
            description: t.infoTask,
            storyPoints: t.storyPoints,
            priority: mapTaskPriority(t.priority),
            state: normalizeTaskState(t.stateTask),
          })),
      }
    : null;

  const handleTaskClick = (taskId: number) => {
    const taskDTO = sprintTasks.find(t => t.taskId === taskId);
    if (!taskDTO) return;

    const devName = taskDTO.userId ? (usersById.get(taskDTO.userId) ?? 'Unassigned') : 'Unassigned';

    setSelectedTaskForModal({
      id: taskDTO.taskId,
      name: taskDTO.nameTask ?? `Task #${taskDTO.taskId}`,
      description: taskDTO.infoTask ?? null,
      storyPoints: taskDTO.storyPoints ?? null,
      priority: mapTaskPriority(taskDTO.priority),
      developerName: devName,
      state: displayTaskState(taskDTO.stateTask),
    });
  };

  return (
    <div className="bg-gray-50 min-h-full px-6 py-8">
      <TaskDetailModal
        isOpen={selectedTaskForModal !== null}
        onClose={() => setSelectedTaskForModal(null)}
        task={selectedTaskForModal}
      />

      {isPageLoading ? (
        <div className="max-w-7xl mx-auto">
          <PageLoading
            title="Loading sprint..."
            subtitle="Fetching sprint data, tasks, features, and assignments for the full view."
          />
        </div>
      ) : (
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
              {sprint.totalTasks} total tasks
            </span>
          </div>
        </header>

        {/* Sprint KPIs */}
        <section
          aria-labelledby="sprint-kpis-heading"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <h2 id="sprint-kpis-heading" className="sr-only">
            Sprint KPIs
          </h2>

          <KpiCard
            label="Sprint Progress"
            value={`${sprint.kpis.progress}%`}
            icon={ArrowTrendingUpIcon}
            tone="success"
          >
            <ProgressBar value={sprint.kpis.progress} />
          </KpiCard>

          <KpiCard
            label="Carryover Rate"
            value={`${sprint.kpis.carryRate}%`}
            icon={ExclamationCircleIcon}
            tone="warning"
          >
            <p className="text-xs text-gray-500">
              {sprint.kpis.carriedFeatures} of {sprint.kpis.totalFeatures} carried over tasks
            </p>
          </KpiCard>

          <KpiCard
            label="Task Delay"
            value={`${sprint.kpis.taskDelay}%`}
            icon={ExclamationCircleIcon}
            tone="danger"
          >
            <p className="text-xs text-gray-500">
              {sprint.kpis.delayedTasks} delayed tasks
            </p>
          </KpiCard>

          <KpiCard
            label="Cycle Time"
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
            Sprint Status
          </h2>

          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setContentView('features')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                contentView === 'features'
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Feature View
            </button>
            <button
              type="button"
              onClick={() => setContentView('developers')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                contentView === 'developers'
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Task View
            </button>
          </div>

          {contentView === 'features' ? (
            <>
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
                      {displayFeatures.length === 0
                        ? 'This sprint has no features yet.'
                        : 'No features match the current filters.'}
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
                          selected={selectedFeature?.id === f.id}
                          onSelect={() => setSelectedFeatureId(f.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: feature detail (only when something is selected). */}
                {detail ? (
                  <FeatureDetailPanel feature={detail} onTaskClick={handleTaskClick} />
                ) : (
                  <p className="text-sm text-gray-400 self-center text-center">
                    Select a feature to view details.
                  </p>
                )}
              </div>
            </>
          ) : (
            <DeveloperTaskBoard
              developers={developerBuckets.map(({ key, name, subtitle }): DeveloperBoardMember => ({
                key,
                name,
                subtitle,
              }))}
              selectedDeveloperKey={selectedDeveloperKey}
              onSelectDeveloper={setSelectedDeveloperKey}
              selectedDeveloperName={selectedDeveloper?.name}
              kpis={selectedDeveloperKpis}
              tasks={selectedDeveloperTasks}
              mode={developerTaskMode}
              onModeChange={setDeveloperTaskMode}
              onTaskClick={handleTaskClick}
            />
          )}
        </section>
      </div>
      )}
    </div>
  );
}
