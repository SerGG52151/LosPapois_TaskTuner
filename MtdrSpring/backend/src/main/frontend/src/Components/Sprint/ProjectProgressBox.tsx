import React, { useMemo } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

export interface ProjectProgressBoxProps {
  projectName: string;
  sprintEndDate: string | null;
  completionPercent: number;
}

/**
 * Green progress box displaying project name, remaining days, and completion percentage.
 */
function ProjectProgressBox({
  projectName,
  sprintEndDate,
  completionPercent,
}: ProjectProgressBoxProps) {
  const { daysLeft, hasEnded } = useMemo(() => {
    if (!sprintEndDate) return { daysLeft: null, hasEnded: false };
    // Parse date-only string as local date to avoid timezone offset issues
    const [y, m, d] = sprintEndDate.split('-').map(Number);
    const end = new Date(y, m - 1, d);
    end.setHours(23, 59, 59, 999); // Treat as end-of-day
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { daysLeft: 0, hasEnded: true };
    return { daysLeft: diffDays, hasEnded: false };
  }, [sprintEndDate]);

  const safePercent = Math.max(0, Math.min(completionPercent, 100));

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{projectName}</h3>
          <p className="text-sm text-gray-600 mt-1">Project Progress</p>
        </div>
        {daysLeft !== null && (
          <div className="flex items-center gap-1.5 text-sm text-green-700 font-semibold">
            <CalendarIcon className="h-4 w-4" aria-hidden="true" />
            {hasEnded
              ? 'Ended'
              : daysLeft === 0
                ? 'Today'
                : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div
          className="w-full h-3 rounded-full bg-green-100 border border-green-200 overflow-hidden"
          role="progressbar"
          aria-valuenow={safePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 transition-[width] duration-500"
            style={{ width: `${safePercent}%` }}
          />
        </div>
        <div className="text-sm font-semibold text-green-700 text-right">
          {safePercent}% Complete
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProjectProgressBox);
