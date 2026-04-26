import {
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface Member {
  name: string;
  role: string;
  initials?: string;
}

interface RatioMetric {
  value: number;
  total: number;
}

interface VelocityMetric {
  storyPoints: number;
}

interface TeamMemberKPIsProps {
  member: Member;
  sprintLabel?: string;
  progress: RatioMetric;
  carryover: RatioMetric;
  delayed: RatioMetric;
  velocity: VelocityMetric;
}

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

interface KpiTileProps {
  label: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  iconBg: string;
  barColor?: string;
  barPercent?: number;
}

function KpiTile({ label, value, caption, icon, iconBg, barColor, barPercent }: KpiTileProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition-shadow hover:shadow-md hover:shadow-brand/10">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className={`flex size-8 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{caption}</p>
      {barColor !== undefined && barPercent !== undefined && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function TeamMemberKPIs({
  member,
  sprintLabel,
  progress,
  carryover,
  delayed,
  velocity,
}: TeamMemberKPIsProps) {
  const progressPct = percent(progress.value, progress.total);
  const carryoverPct = percent(carryover.value, carryover.total);
  const delayedPct = percent(delayed.value, delayed.total);
  const initials = member.initials ?? getInitials(member.name);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-lg shadow-brand/10">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white font-bold text-sm shadow-md shadow-brand/30">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        </div>
        {sprintLabel && (
          <span className="rounded-full bg-brand-lighter px-3 py-1 text-xs font-semibold text-brand-dark">
            {sprintLabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Sprint Progress"
          value={`${progressPct}%`}
          caption={`${progress.value} of ${progress.total} tasks`}
          icon={<CheckCircleIcon className="size-4 text-green-600" />}
          iconBg="bg-green-50"
          barColor="bg-green-500"
          barPercent={progressPct}
        />
        <KpiTile
          label="Carryover Rate"
          value={`${carryoverPct}%`}
          caption={`${carryover.value} of ${carryover.total} tasks`}
          icon={<ArrowPathIcon className="size-4 text-orange-600" />}
          iconBg="bg-orange-50"
          barColor="bg-orange-500"
          barPercent={carryoverPct}
        />
        <KpiTile
          label="Delayed Tasks"
          value={`${delayedPct}%`}
          caption={`${delayed.value} of ${delayed.total} tasks`}
          icon={<ExclamationTriangleIcon className="size-4 text-red-600" />}
          iconBg="bg-red-50"
          barColor="bg-red-500"
          barPercent={delayedPct}
        />
        <KpiTile
          label="Velocity"
          value={`${velocity.storyPoints} SP`}
          caption="Completed this sprint"
          icon={<BoltIcon className="size-4 text-blue-600" />}
          iconBg="bg-blue-50"
        />
      </div>
    </div>
  );
}
