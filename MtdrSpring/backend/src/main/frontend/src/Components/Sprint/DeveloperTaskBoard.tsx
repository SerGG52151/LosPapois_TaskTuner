import React from 'react';
import { MemberListItem } from '../Team';

export type TaskPriority = 'high' | 'medium' | 'low' | 'none';
export type TaskState = 'active' | 'done' | 'delayed';
export type TaskBoardMode = 'list' | 'kanban';

export interface DeveloperBoardMember {
  key: string;
  name: string;
  subtitle: string;
}

export interface DeveloperBoardKpis {
  tasksCompleted: number;
  cycleTime: string;
  assignedTasks: number;
  totalStoryPoints: number;
  progress: string;
}

export interface DeveloperBoardTask {
  id: number;
  name: string;
  featureName?: string;
  storyPoints?: number | null;
  priority: TaskPriority;
  state: TaskState;
}

export interface DeveloperTaskBoardProps {
  developers: DeveloperBoardMember[];
  selectedDeveloperKey: string | null;
  onSelectDeveloper: (key: string) => void;
  selectedDeveloperName?: string;
  kpis: DeveloperBoardKpis;
  tasks: DeveloperBoardTask[];
  mode: TaskBoardMode;
  onModeChange: (mode: TaskBoardMode) => void;
  onTaskClick?: (taskId: number) => void;
}

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-green-100 text-green-700',
  none: 'bg-gray-100 text-gray-600',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'Not set',
};

const STATE_BADGE: Record<TaskState, string> = {
  active: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  delayed: 'bg-amber-100 text-amber-700',
};

const STATE_LABEL: Record<TaskState, string> = {
  active: 'Active',
  done: 'Done',
  delayed: 'Delayed',
};

function MiniKpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
      <div className="text-xs text-gray-500 mb-1 leading-snug">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

function TaskRow({
  task,
  onClick,
}: {
  task: DeveloperBoardTask;
  onClick?: (taskId: number) => void;
}) {
  return (
    <li
      className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onClick?.(task.id)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-800 truncate">{task.name}</div>
          {(task.featureName || task.storyPoints != null) && (
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              {task.featureName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 truncate max-w-[180px]">
                  {task.featureName}
                </span>
              )}
              {task.storyPoints != null && task.storyPoints > 0 && <span>{task.storyPoints} SP</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATE_BADGE[task.state]}`}
          >
            {STATE_LABEL[task.state]}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[task.priority]}`}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
        </div>
      </div>
    </li>
  );
}

function KanbanColumn({
  title,
  tasks,
  tone,
  onTaskClick,
}: {
  title: string;
  tasks: DeveloperBoardTask[];
  tone: string;
  onTaskClick?: (taskId: number) => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h5 className={`text-sm font-semibold ${tone}`}>{title}</h5>
        <span className="text-xs text-gray-500">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs text-gray-400">No tasks in this column.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <button
              key={task.id}
              type="button"
              onClick={() => onTaskClick?.(task.id)}
              className="w-full text-left bg-white border border-gray-200 rounded-lg p-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-800 truncate">{task.name}</div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${PRIORITY_BADGE[task.priority]}`}
                >
                  {PRIORITY_LABEL[task.priority]}
                </span>
                {task.storyPoints != null && task.storyPoints > 0 && (
                  <span className="text-[11px] text-gray-500">{task.storyPoints} SP</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DeveloperTaskBoard({
  developers,
  selectedDeveloperKey,
  onSelectDeveloper,
  selectedDeveloperName,
  kpis,
  tasks,
  mode,
  onModeChange,
  onTaskClick,
}: DeveloperTaskBoardProps) {
  const activeTasks = tasks.filter(t => t.state === 'active');
  const doneTasks = tasks.filter(t => t.state === 'done');
  const delayedTasks = tasks.filter(t => t.state === 'delayed');

  return (
    <div className="border-t border-gray-100 pt-5 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Developers ({developers.length})
        </h3>
        {developers.length === 0 ? (
          <p className="text-sm text-gray-400">No developers with tasks in this sprint.</p>
        ) : (
          <div className="space-y-2">
            {developers.map(d => (
              <MemberListItem
                key={d.key}
                name={d.name}
                role={d.subtitle}
                selected={selectedDeveloperKey === d.key}
                onSelect={() => onSelectDeveloper(d.key)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        {selectedDeveloperKey == null ? (
          <p className="text-sm text-gray-400 self-center text-center mt-12">
            Select a developer to view sprint KPIs and tasks.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-gray-800">{selectedDeveloperName}</h3>
              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => onModeChange('list')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    mode === 'list'
                      ? 'bg-brand text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange('kanban')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    mode === 'kanban'
                      ? 'bg-brand text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Kanban
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <MiniKpi label="Completed Tasks" value={kpis.tasksCompleted} />
              <MiniKpi label="Average Cycle Time" value={kpis.cycleTime} />
              <MiniKpi label="Assigned Tasks" value={kpis.assignedTasks} />
              <MiniKpi label="Total Story Points" value={`${kpis.totalStoryPoints} SP`} />
              <MiniKpi label="Current Progress" value={kpis.progress} />
            </div>

            {mode === 'list' ? (
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-3">
                  Assigned Tasks ({tasks.length})
                </h4>
                {tasks.length === 0 ? (
                  <p className="text-sm text-gray-400">No tasks assigned to this developer in this sprint.</p>
                ) : (
                  <ul className="space-y-2">
                    {tasks.map(t => (
                      <TaskRow key={t.id} task={t} onClick={onTaskClick} />
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-3">
                  Tasks by Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <KanbanColumn
                    title="Active"
                    tasks={activeTasks}
                    tone="text-blue-700"
                    onTaskClick={onTaskClick}
                  />
                  <KanbanColumn
                    title="Delayed"
                    tasks={delayedTasks}
                    tone="text-amber-700"
                    onTaskClick={onTaskClick}
                  />
                  <KanbanColumn
                    title="Done"
                    tasks={doneTasks}
                    tone="text-green-700"
                    onTaskClick={onTaskClick}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
