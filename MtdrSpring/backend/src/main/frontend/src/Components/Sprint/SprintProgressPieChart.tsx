import React from 'react';

export interface SprintProgressPieChartProps {
  activeTasks: number;
  delayedTasks: number;
  doneTasks: number;
}

/**
 * Pie chart visualization for sprint task status breakdown.
 * Displays Active, Delayed, and Done tasks as proportional slices.
 */
function SprintProgressPieChart({
  activeTasks,
  delayedTasks,
  doneTasks,
}: SprintProgressPieChartProps) {
  const total = activeTasks + delayedTasks + doneTasks;
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">No tasks in sprint yet</p>
      </div>
    );
  }

  const activePercent = (activeTasks / total) * 100;
  const delayedPercent = (delayedTasks / total) * 100;
  const donePercent = (doneTasks / total) * 100;

  // SVG pie chart using conic gradient approach
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dashoffsets for each slice
  const activeOffset = (activePercent / 100) * circumference;
  const delayedOffset = (delayedPercent / 100) * circumference;
  const doneOffset = (donePercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg
        viewBox="0 0 120 120"
        className="w-48 h-48"
        aria-label="Sprint task status breakdown"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="20"
        />

        {/* Active slice (blue) */}
        {activePercent > 0 && (
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="20"
            strokeDasharray={`${activeOffset} ${circumference}`}
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
          />
        )}

        {/* Delayed slice (amber) */}
        {delayedPercent > 0 && (
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="20"
            strokeDasharray={`${delayedOffset} ${circumference}`}
            strokeDashoffset={-activeOffset}
            transform="rotate(-90 60 60)"
          />
        )}

        {/* Done slice (green) */}
        {donePercent > 0 && (
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#10b981"
            strokeWidth="20"
            strokeDasharray={`${doneOffset} ${circumference}`}
            strokeDashoffset={-(activeOffset + delayedOffset)}
            transform="rotate(-90 60 60)"
          />
        )}

        {/* Center text */}
        <text
          x="60"
          y="55"
          textAnchor="middle"
          className="text-xl font-bold fill-gray-900"
        >
          {total}
        </text>
        <text
          x="60"
          y="70"
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          Tasks
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-6 space-y-2 w-full">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500" aria-hidden="true" />
          <span className="text-sm text-gray-700">
            Active: <span className="font-semibold">{activeTasks}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500" aria-hidden="true" />
          <span className="text-sm text-gray-700">
            Delayed: <span className="font-semibold">{delayedTasks}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
          <span className="text-sm text-gray-700">
            Done: <span className="font-semibold">{doneTasks}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SprintProgressPieChart);
