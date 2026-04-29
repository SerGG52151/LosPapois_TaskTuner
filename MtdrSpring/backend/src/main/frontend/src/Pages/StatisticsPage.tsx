import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  ChevronDownIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import PageLoading from '../Components/Common/PageLoading';
import CycleTimeScatterPlot from '../Components/Charts/CycleTimeScatterPlot';
import { getFromStorage, STORAGE_KEYS } from '../Utils/storage';

interface ProjectDTO {
  pjId: number;
  namePj: string;
}

interface MembershipDTO {
  pjId: number;
  userId: number;
}

interface UserDTO {
  userId: number;
  nameUser: string;
}

interface SprintDTO {
  sprId: number;
  nameSprint: string;
  dateStartSpr: string | null;
}

interface SprintTaskDTO {
  sprId: number;
  taskId: number;
  stateTask: string;
}

interface TaskDTO {
  taskId: number;
  userId?: number;
  storyPoints: number | null;
}

type MetricKey = 'tasksCompleted' | 'storyPointsCompleted';

interface MemberOption {
  id: number;
  name: string;
}

interface SprintSeriesPoint {
  sprintId: number;
  sprintName: string;
  tasksCompletedByMemberId: Record<number, number>;
  storyPointsCompletedByMemberId: Record<number, number>;
}

const METRIC_LABEL: Record<MetricKey, string> = {
  tasksCompleted: 'Tasks Completed',
  storyPointsCompleted: 'SPs Completed',
};

const BAR_COLORS = [
  '#2563EB',
  '#16A34A',
  '#EA580C',
  '#7C3AED',
  '#0891B2',
  '#DC2626',
  '#4F46E5',
  '#059669',
  '#9333EA',
  '#D97706',
];

function normalizeTaskState(raw: string | null | undefined): 'active' | 'done' | 'delayed' {
  const s = (raw ?? '').toLowerCase();
  if (s === 'done') return 'done';
  if (s === 'delayed') return 'delayed';
  return 'active';
}

function buildYAxisTicks(maxValue: number): number[] {
  if (maxValue <= 0) return [0, 1, 2, 3, 4];
  const segments = 4;
  const step = Math.ceil(maxValue / segments);
  return [0, step, step * 2, step * 3, step * 4];
}

export default function StatisticsPage() {
  const { projectId: rawProjectId } = useParams<{ projectId: string }>();
  const projectId = rawProjectId ? Number(rawProjectId) : undefined;

  const projectName = useMemo(() => {
    const projects = getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS) ?? [];
    const match = projectId != null
      ? projects.find(p => p.pjId === projectId)
      : undefined;
    return match?.namePj ?? projects[0]?.namePj ?? 'Project';
  }, [projectId]);

  const [members, setMembers] = useState<MemberOption[]>([]);
  const [sprints, setSprints] = useState<SprintDTO[]>([]);
  const [seriesBySprint, setSeriesBySprint] = useState<SprintSeriesPoint[]>([]);
  const [loading, setLoading] = useState(projectId != null && projectId >= 0);

  const [pendingMemberIds, setPendingMemberIds] = useState<number[]>([]);
  const [pendingMetric, setPendingMetric] = useState<MetricKey>('tasksCompleted');
  const [isMemberMenuOpen, setIsMemberMenuOpen] = useState(false);
  const memberMenuRef = useRef<HTMLDivElement | null>(null);

  const [appliedMemberIds, setAppliedMemberIds] = useState<number[]>([]);
  const [appliedMetric, setAppliedMetric] = useState<MetricKey>('tasksCompleted');

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!memberMenuRef.current) return;
      if (!memberMenuRef.current.contains(event.target as Node)) {
        setIsMemberMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (projectId == null || projectId < 0) {
      setMembers([]);
      setSprints([]);
      setSeriesBySprint([]);
      setPendingMemberIds([]);
      setAppliedMemberIds([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetch(`/api/project-memberships/project/${projectId}`)
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch('/api/users-tt')
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`/api/sprints/project/${projectId}`)
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch('/api/tasks')
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
    ])
      .then(async ([
        memberships,
        users,
        projectSprints,
        allTasks,
      ]: [MembershipDTO[], UserDTO[], SprintDTO[], TaskDTO[]]) => {
        if (cancelled) return;

        const memberIds = new Set(memberships.map(m => m.userId));
        const projectMembers = users
          .filter(u => memberIds.has(u.userId))
          .map<MemberOption>(u => ({ id: u.userId, name: u.nameUser }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const sortedSprints = [...projectSprints].sort((a, b) => {
          const aTime = a.dateStartSpr ? new Date(a.dateStartSpr).getTime() : Infinity;
          const bTime = b.dateStartSpr ? new Date(b.dateStartSpr).getTime() : Infinity;
          return aTime - bTime;
        });

        const tasksById = new Map(allTasks.map(t => [t.taskId, t]));

        const sprintLinks = await Promise.all(
          sortedSprints.map(s =>
            fetch(`/api/sprint-tasks/sprint/${s.sprId}`)
              .then(r => (r.ok ? r.json() : []))
              .catch(() => [] as SprintTaskDTO[])
          )
        );
        if (cancelled) return;

        const computedSeries: SprintSeriesPoint[] = sortedSprints.map((sprint, i) => {
          const links = sprintLinks[i] ?? [];
          const tasksCompletedByMemberId: Record<number, number> = {};
          const storyPointsCompletedByMemberId: Record<number, number> = {};

          projectMembers.forEach(member => {
            const doneTaskLinks = links.filter(link => {
              if (normalizeTaskState(link.stateTask) !== 'done') return false;
              const task = tasksById.get(link.taskId);
              return task?.userId === member.id;
            });

            const tasksCompleted = doneTaskLinks.length;
            const storyPointsCompleted = doneTaskLinks.reduce((sum, link) => {
              const task = tasksById.get(link.taskId);
              return sum + (task?.storyPoints ?? 0);
            }, 0);

            tasksCompletedByMemberId[member.id] = tasksCompleted;
            storyPointsCompletedByMemberId[member.id] = storyPointsCompleted;
          });

          return {
            sprintId: sprint.sprId,
            sprintName: sprint.nameSprint,
            tasksCompletedByMemberId,
            storyPointsCompletedByMemberId,
          };
        });

        setMembers(projectMembers);
        setSprints(sortedSprints);
        setSeriesBySprint(computedSeries);

        // Start with no members selected so the user explicitly chooses
        // who to graph before applying filters.
        setPendingMemberIds([]);
        setAppliedMemberIds([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // pendingMetric intentionally excluded so raw series stays stable;
    // we derive displayed values from appliedMetric below.
  }, [projectId]);

  const chartRows = useMemo(() => {
    return seriesBySprint.map(point => ({
      sprintId: point.sprintId,
      sprintName: point.sprintName,
      values: appliedMemberIds.map(memberId => ({
        memberId,
        value:
          appliedMetric === 'tasksCompleted'
            ? (point.tasksCompletedByMemberId[memberId] ?? 0)
            : (point.storyPointsCompletedByMemberId[memberId] ?? 0),
      })),
    }));
  }, [seriesBySprint, appliedMemberIds, appliedMetric]);

  const memberNameById = useMemo(
    () => new Map(members.map(m => [m.id, m.name])),
    [members]
  );

  const maxValue = useMemo(() => {
    const vals = chartRows.flatMap(row => row.values.map(v => v.value));
    return vals.length > 0 ? Math.max(...vals) : 0;
  }, [chartRows]);

  const yTicks = useMemo(() => buildYAxisTicks(maxValue), [maxValue]);
  const axisMax = yTicks[yTicks.length - 1] ?? maxValue;

  const {
    barWidthPx,
    barGapPx,
    sprintGroupWidthPx,
    chartMinWidthPx,
  } = useMemo(() => {
    const developerCount = Math.max(appliedMemberIds.length, 1);
    const sprintCount = Math.max(chartRows.length, 1);

    const computedBarWidth = developerCount <= 3
      ? 18
      : developerCount <= 6
        ? 14
        : developerCount <= 10
          ? 10
          : 8;

    const computedBarGap = developerCount <= 3
      ? 10
      : developerCount <= 6
        ? 8
        : developerCount <= 10
          ? 6
          : 4;

    const groupInnerWidth =
      developerCount * computedBarWidth + (developerCount - 1) * computedBarGap;
    const computedGroupWidth = Math.max(120, groupInnerWidth + 24);
    const computedChartMinWidth = Math.max(
      760,
      64 + sprintCount * (computedGroupWidth + 16)
    );

    return {
      barWidthPx: computedBarWidth,
      barGapPx: computedBarGap,
      sprintGroupWidthPx: computedGroupWidth,
      chartMinWidthPx: computedChartMinWidth,
    };
  }, [appliedMemberIds.length, chartRows.length]);

  const handleApply = () => {
    setAppliedMemberIds(pendingMemberIds);
    setAppliedMetric(pendingMetric);
    setIsMemberMenuOpen(false);
  };

  const togglePendingMember = (memberId: number) => {
    setPendingMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    setPendingMemberIds(members.map(m => m.id));
  };

  const clearMemberSelection = () => {
    setPendingMemberIds([]);
  };

  const selectedMembersLabel = useMemo(() => {
    if (pendingMemberIds.length === 0) return 'No members selected';
    if (pendingMemberIds.length === members.length) return 'All members selected';
    if (pendingMemberIds.length === 1) {
      return memberNameById.get(pendingMemberIds[0]) ?? '1 member selected';
    }
    return `${pendingMemberIds.length} members selected`;
  }, [pendingMemberIds, members.length, memberNameById]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <PageLoading
            title="Loading project statistics..."
            subtitle="Fetching project members, sprint history, and completion metrics."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            {projectName} - Statistics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Compare member performance by sprint with configurable chart metrics.
          </p>
        </header>

        <section
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm shadow-gray-200/60"
          aria-labelledby="statistics-controls-heading"
        >
          <h2
            id="statistics-controls-heading"
            className="flex items-center gap-3 text-xl font-bold text-gray-800"
          >
            <span className="h-5 w-1 bg-brand rounded-full" aria-hidden="true" />
            Graph Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <label className="block">
              <span className="text-sm font-semibold text-gray-700 inline-flex items-center gap-1.5 mb-2">
                <UserGroupIcon className="h-4 w-4" aria-hidden="true" />
                Team Members
              </span>
              <div ref={memberMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsMemberMenuOpen(open => !open)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700
                             hover:border-gray-300 focus:border-brand focus:outline-none inline-flex items-center justify-between gap-2"
                >
                  <span className="truncate">{selectedMembersLabel}</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-gray-500 transition-transform ${isMemberMenuOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                {isMemberMenuOpen && (
                  <div
                    className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-200/70"
                    role="menu"
                    aria-label="Team members selection"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                      <button
                        type="button"
                        onClick={selectAllMembers}
                        className="text-xs font-semibold text-brand hover:text-brand-dark"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={clearMemberSelection}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="max-h-56 overflow-auto py-1">
                      {members.map(member => {
                        const checked = pendingMemberIds.includes(member.id);
                        return (
                          <label
                            key={member.id}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePendingMember(member.id)}
                              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                            />
                            <span className="truncate">{member.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Pick one or more developers from the dropdown checklist.</p>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700 inline-flex items-center gap-1.5 mb-2">
                <ArrowTrendingUpIcon className="h-4 w-4" aria-hidden="true" />
                Data to Display
              </span>
              <select
                value={pendingMetric}
                onChange={e => setPendingMetric(e.target.value as MetricKey)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-brand focus:outline-none"
              >
                <option value="tasksCompleted">Tasks Completed</option>
                <option value="storyPointsCompleted">SPs Completed</option>
              </select>
            </label>

            <div className="flex items-center translate-y-0.5">
              <button
                type="button"
                onClick={handleApply}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-4 py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
                Update Graph
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm shadow-gray-200/60">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Bar Graph by Sprint</h2>
          <p className="text-sm text-gray-500 mb-5">
            X axis: Sprints. Y axis: {METRIC_LABEL[appliedMetric]}.
          </p>

          {sprints.length === 0 ? (
            <p className="text-sm text-gray-400">This project has no sprints yet.</p>
          ) : appliedMemberIds.length === 0 ? (
            <p className="text-sm text-gray-400">Select at least one member and click Update Graph.</p>
          ) : (
            <div className="space-y-5">
              <div className="border border-gray-100 rounded-xl p-4 bg-gradient-to-b from-gray-50 to-white overflow-x-auto">
                <div style={{ minWidth: `${chartMinWidthPx}px` }}>
                  <div className="grid grid-cols-[64px_1fr] gap-3 items-stretch">
                    <div className="relative h-80">
                      {yTicks.map((tick, idx) => {
                        const ratio = yTicks.length > 1 ? idx / (yTicks.length - 1) : 0;
                        const bottom = `${ratio * 100}%`;
                        return (
                          <span
                            key={tick}
                            className="absolute right-0 translate-y-1/2 text-xs text-gray-400"
                            style={{ bottom }}
                          >
                            {tick}
                          </span>
                        );
                      })}
                    </div>

                    <div className="relative h-80 border-l border-gray-200 pl-3">
                      {yTicks.map((tick, idx) => {
                        const ratio = yTicks.length > 1 ? idx / (yTicks.length - 1) : 0;
                        const bottom = `${ratio * 100}%`;
                        return (
                          <div
                            key={tick}
                            className="absolute left-0 right-0 border-t border-dashed border-gray-200"
                            style={{ bottom }}
                          />
                        );
                      })}

                      <div className="h-full flex items-end justify-start gap-4 pb-2">
                        {chartRows.map(row => (
                          <div
                            key={row.sprintId}
                            className="flex-none h-full flex items-end justify-center"
                            style={{
                              width: `${sprintGroupWidthPx}px`,
                              minWidth: `${sprintGroupWidthPx}px`,
                              gap: `${barGapPx}px`,
                            }}
                          >
                            {row.values.map((bar, index) => {
                              const pct = axisMax > 0 ? (bar.value / axisMax) * 100 : 0;
                              const barHeight = bar.value === 0 ? 0 : Math.max(pct, 2);
                              return (
                                <div
                                  key={bar.memberId}
                                  className="h-full flex items-end"
                                  style={{ width: `${barWidthPx}px` }}
                                >
                                  <div
                                    className="w-full rounded-t-md transition-[height] duration-500"
                                    style={{
                                      height: `${barHeight}%`,
                                      backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                                    }}
                                    title={`${memberNameById.get(bar.memberId) ?? `Member ${bar.memberId}`}: ${bar.value}`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[64px_1fr] gap-3 mt-3">
                    <div aria-hidden="true" />
                    <div className="border-l border-transparent pl-3">
                      <div className="flex justify-start gap-4 mb-2">
                        {chartRows.map(row => (
                          <div
                            key={row.sprintId}
                            className="flex-none"
                            style={{
                              width: `${sprintGroupWidthPx}px`,
                              minWidth: `${sprintGroupWidthPx}px`,
                            }}
                          >
                            <div className="flex flex-wrap justify-center gap-1.5">
                              {row.values.map((v, idx) => (
                                <span
                                  key={v.memberId}
                                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-700"
                                >
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                                    aria-hidden="true"
                                  />
                                  {v.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-start gap-4">
                        {chartRows.map(row => (
                          <div
                            key={row.sprintId}
                            className="flex-none text-center"
                            style={{
                              width: `${sprintGroupWidthPx}px`,
                              minWidth: `${sprintGroupWidthPx}px`,
                            }}
                          >
                            <span className="inline-block text-xs font-medium text-gray-600 leading-tight">
                              {row.sprintName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-1 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
                <div className="flex flex-wrap gap-3">
                  {appliedMemberIds.map((memberId, idx) => (
                    <div key={memberId} className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <span
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                        aria-hidden="true"
                      />
                      <span>{memberNameById.get(memberId) ?? `Member ${memberId}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <CycleTimeScatterPlot projectId={projectId} />
      </div>
    </div>
  );
}
