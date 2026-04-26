import React, { useEffect, useMemo, useState } from 'react';
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
import type {
  AvatarTone,
  MemberTaskLite,
  MemberTaskPriority,
} from '../Components/Team';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../Utils/storage';
import TaskDetailModal from '../Components/Common/TaskDetailModal';
import type { TaskDetailData } from '../Components/Common/TaskDetailModal';
import PageLoading from '../Components/Common/PageLoading';

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

/** Backend ProjectUserTT shape — composite key (pjId, userId). */
interface MembershipDTO {
  pjId: number;
  userId: number;
}

/** Backend UserTT shape — only fields the team page consumes. */
interface UserDTO {
  userId: number;
  nameUser: string;
  mail: string | null;
  idTelegram: string;
  role: string;
}

interface MockMember {
  id: number;
  name: string;
  role: string;
  email: string;
  avatarTone: AvatarTone;
}

/** Backend TaskTT shape — fields used by KPI calc and the tasks list. */
interface TaskDTO {
  taskId: number;
  nameTask: string | null;
  /** Long-text description (TaskTT.infoTask). */
  infoTask: string | null;
  userId: number;
  pjId: number;
  storyPoints: number | null;
  priority: string | null;
  dateStartTask: string | null;
  dateEndRealTask: string | null;
  featureId: number | null;
}

/** Backend FeatureTT shape. */
interface FeatureDTO {
  featureId: number;
  nameFeature: string;
  priorityFeature: string | null;
  sprId: number;
}

/** Map backend priority strings to the panel's tagged union. */
function mapPriority(p: string | null | undefined): MemberTaskPriority {
  switch ((p ?? '').toLowerCase()) {
    case 'high':   return 'high';
    case 'medium': return 'medium';
    case 'low':    return 'low';
    default:       return 'none';
  }
}

/** Rank priorities so "Alta" sorts above "Media" etc. in the tasks list. */
const PRIORITY_ORDER: Record<MemberTaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

/** Per-project cache key — team rosters are stored separately for each project. */
const teamCacheKey = (projectId: number) =>
  `${STORAGE_KEYS.TEAM_MEMBERS}_${projectId}`;

/**
 * Compute the 4 KPI tiles shown in the member detail panel from the
 * backing task list. Pure function — easy to swap to a backend endpoint
 * later without touching the consumer.
 *
 * Definitions:
 *   - tasksCompleted = count of member's tasks with dateEndRealTask set
 *   - cycleTime      = avg days between dateStartTask and dateEndRealTask
 *                      across the member's completed tasks
 *   - features       = distinct featureId values across the member's tasks
 *                      (a feature "counts as assigned" if the user owns
 *                      at least one task in it)
 *   - progress       = % of the member's tasks that are completed
 */
function computeMemberKpis(
  projectTasks: TaskDTO[],
  memberId: number
): MemberKpis {
  const myTasks = projectTasks.filter(t => t.userId === memberId);
  const total = myTasks.length;
  if (total === 0) return EMPTY_MEMBER_KPIS;

  const completed = myTasks.filter(t => t.dateEndRealTask != null);
  const completedCount = completed.length;

  // Cycle time: only meaningful for tasks that have both dates.
  const dayMs = 1000 * 60 * 60 * 24;
  const withDates = completed.filter(t => t.dateStartTask && t.dateEndRealTask);
  const avgCycleDays = withDates.length === 0
    ? 0
    : withDates.reduce((sum, t) => {
        const start = new Date(t.dateStartTask!).getTime();
        const end   = new Date(t.dateEndRealTask!).getTime();
        return sum + Math.max(0, (end - start) / dayMs);
      }, 0) / withDates.length;

  const distinctFeatures = new Set(
    myTasks.map(t => t.featureId).filter((f): f is number => f != null)
  );

  return {
    tasksCompleted: completedCount,
    cycleTime:      `${avgCycleDays.toFixed(1)} days`,
    features:       distinctFeatures.size,
    progress:       `${Math.round((completedCount / total) * 100)}%`,
  };
}

/** Convert a backend UserTT into the display shape used by the page/components. */
function mapBackendUser(u: UserDTO): MockMember {
  return {
    id: u.userId,
    name: u.nameUser,
    // Backend role is just 'manager' | 'developer' — capitalize for display.
    // Real job titles ("Frontend Developer", etc.) live elsewhere; we only
    // have the platform-level role here.
    role: u.role
      ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
      : 'Member',
    email: u.mail ?? u.idTelegram, // fall back to telegram handle if no email
    avatarTone: 'brand',
  };
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
  1: { tasksCompleted: 2, cycleTime: '2.5 days', features: 2, progress: '50%' },
  2: { tasksCompleted: 0, cycleTime: '0 days',   features: 0, progress: '0%'  },
  3: { tasksCompleted: 0, cycleTime: '0 days',   features: 0, progress: '0%'  },
  4: { tasksCompleted: 0, cycleTime: '0 days',   features: 0, progress: '0%'  },
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
  cycleTime: '2.9 days',
  projectDelay: '0 days',
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
  // The route is /projects/:projectId/team — every "Team" link in the
  // sidebar carries its own projectId, so this param uniquely identifies
  // which project's team we're viewing (no more cross-group highlight bugs).
  const { projectId: rawProjectId } = useParams<{ projectId: string }>();
  const projectId = rawProjectId ? Number(rawProjectId) : undefined;

  // Members are seeded from per-project cache for instant paint, then
  // refreshed by the parallel fetch below. Mock projects (negative IDs)
  // permanently use MOCK_MEMBERS — they don't exist in the backend.
  const [members, setMembers] = useState<MockMember[]>(() => {
    if (projectId == null || projectId < 0) return MOCK_MEMBERS;
    return getFromStorage<MockMember[]>(teamCacheKey(projectId)) ?? [];
  });

  // All tasks across the system (cache shared with TasksPage). Filtered to
  // this project's tasks at compute time — keeps the cache simple (one key,
  // one fetch covers the whole app's task data).
  const [allTasks, setAllTasks] = useState<TaskDTO[]>(
    () => getFromStorage<TaskDTO[]>(STORAGE_KEYS.TASKS) ?? []
  );

  // All features across the system — used to map featureId → name when
  // showing "Features Asignadas" inside the member detail panel.
  const [allFeatures, setAllFeatures] = useState<FeatureDTO[]>([]);

  // Selection is nullable so we can render an empty state when no members.
  const [selectedId, setSelectedId] = useState<number | null>(
    () => members[0]?.id ?? null
  );

  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskDetailData | null>(null);
  const [membersLoading, setMembersLoading] = useState(
    projectId != null && projectId >= 0
  );
  const [tasksLoading, setTasksLoading] = useState(allTasks.length === 0);
  const [featuresLoading, setFeaturesLoading] = useState(true);

  // Re-seed + refetch whenever the project changes.
  useEffect(() => {
    if (projectId == null) return;
    setMembersLoading(false);

    if (projectId < 0) {
      // Demo project — keep mock data, no backend call.
      setMembers(MOCK_MEMBERS);
      setSelectedId(prev =>
        prev != null && MOCK_MEMBERS.some(m => m.id === prev)
          ? prev
          : MOCK_MEMBERS[0].id
      );
      return;
    }

    setMembersLoading(true);

    // Reset to whatever's cached for this project so the previous project's
    // members don't briefly leak across navigations.
    const cached = getFromStorage<MockMember[]>(teamCacheKey(projectId)) ?? [];
    setMembers(cached);
    setSelectedId(prev =>
      prev != null && cached.some(m => m.id === prev) ? prev : cached[0]?.id ?? null
    );

    // Two-step fetch: memberships give us the userIds in this project, then
    // we filter the full users list. Two requests instead of N+1 lookups.
    let cancelled = false;
    Promise.all([
      fetch(`/api/project-memberships/project/${projectId}`)
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch('/api/users-tt')
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(([memberships, allUsers]: [MembershipDTO[], UserDTO[]]) => {
      if (cancelled) return;
      const memberIds = new Set(memberships.map(m => m.userId));
      const mapped = allUsers
        .filter(u => memberIds.has(u.userId))
        .map(mapBackendUser);
      setMembers(mapped);
      setSelectedId(prev =>
        prev != null && mapped.some(m => m.id === prev)
          ? prev
          : mapped[0]?.id ?? null
      );
      saveToStorage(teamCacheKey(projectId), mapped);
      setMembersLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Background refresh of the task list (used by the per-member KPIs).
  // Runs once on mount — the cache holds across project switches so we
  // don't re-fetch the whole task table every time the user changes
  // projects in the sidebar.
  useEffect(() => {
    let cancelled = false;
    setTasksLoading(true);
    fetch('/api/tasks')
      .then(r => (r.ok ? r.json() : null))
      .then((data: TaskDTO[] | null) => {
        if (cancelled || !data) return;
        setAllTasks(data);
        saveToStorage(STORAGE_KEYS.TASKS, data);
      })
      .catch(() => {
        /* Keep cached tasks on failure. */
      })
      .finally(() => {
        if (!cancelled) setTasksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // One-time fetch of all features for the per-member feature list lookup.
  // Small payload, doesn't change often — no per-project caching needed.
  useEffect(() => {
    let cancelled = false;
    setFeaturesLoading(true);
    fetch('/api/features')
      .then(r => (r.ok ? r.json() : []))
      .then((data: FeatureDTO[]) => {
        if (cancelled) return;
        setAllFeatures(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFeaturesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isPageLoading =
    projectId != null
    && projectId >= 0
    && (membersLoading || tasksLoading || featuresLoading);

  // Tasks scoped to the current project — feeds every per-member KPI calc.
  const projectTasks = useMemo(
    () =>
      projectId != null ? allTasks.filter(t => t.pjId === projectId) : [],
    [allTasks, projectId]
  );

  // Resolve the project name from the cached project list (filled by the
  // sidebar fetch). The URL provides the ID; the name follows.
  const projectName = useMemo(() => {
    const projects = getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS) ?? [];
    const match = projectId != null
      ? projects.find(p => p.pjId === projectId)
      : undefined;
    return match?.namePj
      ?? projects[0]?.namePj
      ?? 'Inventory Management System';
  }, [projectId]);

  // Member KPIs:
  //   - Demo projects (negative IDs) keep the per-id MOCK_MEMBER_KPIS table.
  //   - Real projects compute live from the project's tasks filtered by user.
  const selectedMember = members.find(m => m.id === selectedId) ?? null;
  const selectedKpis = useMemo<MemberKpis>(() => {
    if (!selectedMember) return EMPTY_MEMBER_KPIS;
    if (projectId != null && projectId < 0) {
      return MOCK_MEMBER_KPIS[selectedMember.id] ?? EMPTY_MEMBER_KPIS;
    }
    return computeMemberKpis(projectTasks, selectedMember.id);
  }, [selectedMember, projectId, projectTasks]);

  // Tasks assigned to the selected member in this project. Each task is
  // enriched with its parent feature name (if any) for context. Skipped
  // for demo projects so the mock UI stays untouched.
  const selectedTasks = useMemo<MemberTaskLite[] | undefined>(() => {
    if (!selectedMember) return undefined;
    if (projectId != null && projectId < 0) return undefined;

    const myTasks = projectTasks.filter(t => t.userId === selectedMember.id);
    if (myTasks.length === 0) return [];

    const featuresById = new Map(allFeatures.map(f => [f.featureId, f]));

    return myTasks
      .map<MemberTaskLite>(t => {
        const f = t.featureId != null ? featuresById.get(t.featureId) : undefined;
        return {
          id: t.taskId,
          name: t.nameTask ?? `Task #${t.taskId}`,
          description: t.infoTask,
          featureName: f?.nameFeature,
          priority: mapPriority(t.priority),
          storyPoints: t.storyPoints,
          done: t.dateEndRealTask != null,
        };
      })
      // Pending tasks on top, then by priority (high → low), then by name.
      // Lets the member see what still needs doing at a glance.
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (pDiff !== 0) return pDiff;
        return a.name.localeCompare(b.name);
      });
  }, [selectedMember, projectId, projectTasks, allFeatures]);

  const handleTaskClick = (taskId: number) => {
    const taskDTO = projectTasks.find(t => t.taskId === taskId);
    if (!taskDTO) return;

    // Get developer name if needed, though they clicked from selectedMember list so it's selectedMember.name
    const dev = members.find(m => m.id === taskDTO.userId);

    setSelectedTaskForModal({
      id: taskDTO.taskId,
      name: taskDTO.nameTask ?? `Task #${taskDTO.taskId}`,
      description: taskDTO.infoTask ?? null,
      storyPoints: taskDTO.storyPoints,
      priority: mapPriority(taskDTO.priority),
      developerName: dev?.name ?? 'Unassigned',
      state: taskDTO.dateEndRealTask ? 'Closed' : 'Active',
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
            title="Loading project team..."
            subtitle="Fetching members, tasks, and features to render the full view."
          />
        </div>
      ) : (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            {projectName} - Team
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage team members and track their KPIs
          </p>
        </header>

        {/* Project-level KPIs */}
        <section aria-labelledby="project-kpis-heading">
          <h2
            id="project-kpis-heading"
            className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-4"
          >
            <span className="h-5 w-1 bg-brand rounded-full" aria-hidden="true" />
            Average Project KPIs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              label="Average Progress"
              value={`${PROJECT_KPIS.avgProgress}%`}
              icon={ArrowTrendingUpIcon}
              tone="success"
            >
              <DonutChart value={PROJECT_KPIS.avgProgress} />
            </KpiCard>

            <KpiCard
              label="Average Carryover Rate"
              value={`${PROJECT_KPIS.carryRate}%`}
              icon={ExclamationCircleIcon}
              tone="warning"
            >
              <p className="text-xs text-gray-500">
                Average across {PROJECT_KPIS.sprintsCount} sprints
              </p>
            </KpiCard>

            <KpiCard
              label="Average Task Delay"
              value={`${PROJECT_KPIS.taskDelay}%`}
              icon={ExclamationCircleIcon}
              tone="danger"
            >
              <p className="text-xs text-gray-500">
                {PROJECT_KPIS.delayedTasks} delayed tasks
              </p>
            </KpiCard>

            <KpiCard
              label="Average Cycle Time"
              value={PROJECT_KPIS.cycleTime}
              icon={ClockIcon}
              tone="info"
            >
              <Sparkline />
            </KpiCard>

            <KpiCard
              label="Project Delay"
              value={PROJECT_KPIS.projectDelay}
              icon={CalendarDaysIcon}
              tone="success"
            >
              <p className="text-xs text-gray-500">
                Expected date: {PROJECT_KPIS.expectedDate}
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
            Team Members
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
                  Members ({members.length})
                </span>
              </div>
              {members.length === 0 ? (
                <p className="text-sm text-gray-400 px-1">
                  No members yet in this project.
                </p>
              ) : (
                <div className="space-y-2">
                  {members.map(m => (
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
              )}
            </div>

            {/* Right: selected member detail */}
            {selectedMember ? (
              <MemberDetailPanel
                member={selectedMember}
                kpis={selectedKpis}
                tasks={selectedTasks}
                onEdit={() => console.log('[TeamPage] edit', selectedMember.id)}
                onDelete={() => console.log('[TeamPage] delete', selectedMember.id)}
                onTaskClick={handleTaskClick}
              />
            ) : (
              <p className="text-sm text-gray-400 self-center text-center">
                Select a member to view details.
              </p>
            )}
          </div>
        </section>
      </div>
      )}
    </div>
  );
}
