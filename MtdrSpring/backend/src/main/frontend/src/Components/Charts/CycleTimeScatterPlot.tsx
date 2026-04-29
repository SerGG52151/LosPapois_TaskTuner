import React, { useEffect, useMemo, useState } from 'react';

type ProjectTaskDTO = {
  taskId: number;
  nameTask: string | null;
  pjId: number;
  dateStartTask: string | null;
  dateEndRealTask: string | null;
};

type SprintDTO = {
  sprId: number;
  nameSprint: string;
  dateStartSpr: string | null;
};

type SprintTaskDTO = {
  sprId: number;
  taskId: number;
  stateTask: string;
};

type CycleTimePoint = {
  sprintIndex: number;
  sprintId: number;
  sprintName: string;
  taskName: string;
  days: number;
};

type CycleTimeScatterPlotProps = {
  projectId?: number;
  className?: string;
};

const DOT_COLORS = [
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

function toDateTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeTaskState(raw: string | null | undefined): 'active' | 'done' | 'delayed' {
  const state = (raw ?? '').toLowerCase();
  if (state === 'done') return 'done';
  if (state === 'delayed') return 'delayed';
  return 'active';
}

function buildYAxisTicks(maxValue: number): number[] {
  if (maxValue <= 0) return [0, 1, 2, 3, 4];
  const segments = 4;
  const step = Math.max(1, Math.ceil(maxValue / segments));
  return [0, step, step * 2, step * 3, step * 4];
}

function getProjectTaskName(task: ProjectTaskDTO | undefined, fallback: string): string {
  const name = task?.nameTask?.trim();
  return name && name.length > 0 ? name : fallback;
}

function buildLaneLayout(sprints: SprintDTO[], points: CycleTimePoint[]) {
  const pointsBySprintAndDay = new Map<number, Map<number, CycleTimePoint[]>>();

  sprints.forEach(sprint => {
    pointsBySprintAndDay.set(sprint.sprId, new Map<number, CycleTimePoint[]>());
  });

  points.forEach(point => {
    const dayBuckets = pointsBySprintAndDay.get(point.sprintId);
    if (!dayBuckets) return;
    const dayPoints = dayBuckets.get(point.days) ?? [];
    dayPoints.push(point);
    dayBuckets.set(point.days, dayPoints);
  });

  const maxClusterSize = Math.max(
    1,
    ...Array.from(pointsBySprintAndDay.values()).flatMap(dayBuckets =>
      Array.from(dayBuckets.values()).map(dayPoints => dayPoints.length)
    )
  );

  const laneWidth = Math.max(156, 92 + maxClusterSize * 18);

  return { laneWidth, pointsBySprintAndDay };
}

export default function CycleTimeScatterPlot({ projectId, className }: CycleTimeScatterPlotProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sprints, setSprints] = useState<SprintDTO[]>([]);
  const [points, setPoints] = useState<CycleTimePoint[]>([]);

  useEffect(() => {
    if (projectId == null || projectId < 0) {
      setSprints([]);
      setPoints([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/projects/${projectId}/tasks`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`/api/sprints/project/${projectId}`).then(r => (r.ok ? r.json() : [])).catch(() => []),
    ])
      .then(async ([projectTasks, projectSprints]: [ProjectTaskDTO[], SprintDTO[]]) => {
        if (cancelled) return;

        const sortedSprints = [...projectSprints].sort((a, b) => {
          const aTime = toDateTime(a.dateStartSpr) ?? Infinity;
          const bTime = toDateTime(b.dateStartSpr) ?? Infinity;
          return aTime - bTime;
        });

        const projectTasksById = new Map(projectTasks.map(task => [task.taskId, task]));
        const sprintLinksBySprint = await Promise.all(
          sortedSprints.map(sprint =>
            fetch(`/api/sprint-tasks/sprint/${sprint.sprId}`)
              .then(r => (r.ok ? r.json() : []))
              .catch(() => [] as SprintTaskDTO[])
          )
        );

        if (cancelled) return;

        const dayMs = 1000 * 60 * 60 * 24;
        const cyclePoints: CycleTimePoint[] = [];

        sortedSprints.forEach((sprint, sprintIndex) => {
          const sprintLinks = sprintLinksBySprint[sprintIndex] ?? [];
          sprintLinks
            .filter(link => normalizeTaskState(link.stateTask) === 'done')
            .forEach(link => {
              const task = projectTasksById.get(link.taskId);
              if (!task || task.pjId !== projectId) return;
              if (!task.dateStartTask || !task.dateEndRealTask) return;

              const startTime = toDateTime(task.dateStartTask);
              const endTime = toDateTime(task.dateEndRealTask);
              if (startTime == null || endTime == null) return;

              cyclePoints.push({
                sprintIndex,
                sprintId: sprint.sprId,
                sprintName: sprint.nameSprint,
                taskName: getProjectTaskName(task, `Task ${task.taskId}`),
                days: Math.max(1, Math.ceil((endTime - startTime) / dayMs)),
              });
            });
        });

        setSprints(sortedSprints);
        setPoints(cyclePoints);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load cycle time data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const maxDays = useMemo(() => {
    const highest = points.reduce((max, point) => Math.max(max, point.days), 0);
    return Math.max(1, highest);
  }, [points]);

  const yTicks = useMemo(() => buildYAxisTicks(maxDays), [maxDays]);
  const axisMax = yTicks[yTicks.length - 1] ?? maxDays;
  const hasPoints = points.length > 0;
  const { laneWidth, pointsBySprintAndDay } = useMemo(
    () => buildLaneLayout(sprints, points),
    [points, sprints]
  );

  const plotWidth = Math.max(laneWidth * sprints.length, 1);
  const plotMinWidth = Math.max(760, 100 + plotWidth);

  if (projectId == null || projectId < 0) {
    return null;
  }

  return (
    <section className={className ?? 'bg-white border border-gray-200 rounded-xl p-6 shadow-sm shadow-gray-200/60'}>
      <h2 className="text-lg font-bold text-gray-800 mb-1">Cycle Time</h2>
      <p className="text-sm text-gray-500 mb-5">
        X axis: Sprints. Y axis: Days to Complete Task.
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading cycle time data...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : sprints.length === 0 ? (
        <p className="text-sm text-gray-400">This project has no sprints yet.</p>
      ) : !hasPoints ? (
        <p className="text-sm text-gray-400">
          No completed tasks with both start and real end dates were found for this project.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="border border-gray-100 rounded-xl p-4 bg-gradient-to-b from-gray-50 to-white overflow-x-auto">
            <div style={{ minWidth: `${plotMinWidth}px` }}>
              <div className="grid grid-cols-[64px_1fr] gap-3 items-stretch">
                <div className="relative h-80">
                  {yTicks.map((tick, idx) => {
                    const ratio = yTicks.length > 1 ? idx / (yTicks.length - 1) : 0;
                    return (
                      <span
                        key={tick}
                        className="absolute right-0 translate-y-1/2 text-xs text-gray-400"
                        style={{ bottom: `${ratio * 100}%` }}
                      >
                        {tick}
                      </span>
                    );
                  })}
                </div>

                <div className="relative h-80 border-l border-gray-200 pl-3">
                  {yTicks.map((tick, idx) => {
                    const ratio = yTicks.length > 1 ? idx / (yTicks.length - 1) : 0;
                    return (
                      <div
                        key={tick}
                        className="absolute left-0 right-0 border-t border-dashed border-gray-200"
                        style={{ bottom: `${ratio * 100}%` }}
                      />
                    );
                  })}

                  <div className="absolute inset-0 pl-3 pr-2">
                    {sprints.map((sprint, sprintIndex) => {
                      const left = sprintIndex * laneWidth + laneWidth / 2;
                      return (
                        <div
                          key={sprint.sprId}
                          className="absolute top-0 bottom-0 border-l border-dashed border-gray-100"
                          style={{ left: `${left}px` }}
                        />
                      );
                    })}

                    {sprints.map((sprint, sprintIndex) => {
                      const dayBuckets = pointsBySprintAndDay.get(sprint.sprId);
                      if (!dayBuckets) return null;

                      const laneCenter = sprintIndex * laneWidth + laneWidth / 2;

                      return Array.from(dayBuckets.entries()).map(([day, dayPoints]) => {
                        const yPercent = axisMax > 0 ? (day / axisMax) * 100 : 0;
                        const clusterSize = dayPoints.length;
                        const spread = Math.min(36, Math.max(0, laneWidth * 0.34));
                        const step = clusterSize > 1 ? Math.min(18, spread / (clusterSize - 1)) : 0;
                        const startOffset = clusterSize > 1 ? -((clusterSize - 1) * step) / 2 : 0;

                        return dayPoints.map((point, pointIndex) => {
                          const xOffset = startOffset + pointIndex * step;
                          const color = DOT_COLORS[(sprintIndex + pointIndex) % DOT_COLORS.length];

                          return (
                            <button
                              key={`${point.sprintId}-${point.taskName}-${day}-${pointIndex}`}
                              type="button"
                              title={`${point.taskName} · ${point.sprintName} · ${point.days} day${point.days === 1 ? '' : 's'}`}
                              aria-label={`${point.taskName}, ${point.days} days, ${point.sprintName}`}
                              className="absolute h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-white shadow-sm transition-transform duration-150 hover:scale-125 focus:scale-125 focus:outline-none"
                              style={{
                                left: `${laneCenter + xOffset}px`,
                                bottom: `${Math.min(100, yPercent)}%`,
                                backgroundColor: color,
                                boxShadow: '0 1px 4px rgba(15, 23, 42, 0.22)',
                              }}
                            />
                          );
                        });
                      });
                    })}
                  </div>

                  <div className="absolute left-3 right-2 top-0 bottom-0 pointer-events-none">
                    {sprints.map((sprint, index) => (
                      <div
                        key={sprint.sprId}
                        className="absolute top-0 bottom-0"
                        style={{
                          left: sprints.length === 1
                            ? '50%'
                            : `${((index + 0.5) / sprints.length) * 100}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[64px_1fr] gap-3 mt-3">
                <div aria-hidden="true" />
                <div className="border-l border-transparent pl-3">
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: `repeat(${sprints.length}, ${laneWidth}px)` }}
                  >
                    {sprints.map((sprint, index) => (
                      <div
                        key={sprint.sprId}
                        className="text-center"
                        style={{
                          width: `${laneWidth}px`,
                          minWidth: `${laneWidth}px`,
                        }}
                      >
                        <span className="inline-block text-xs font-medium text-gray-600 leading-tight">
                          {sprint.nameSprint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}