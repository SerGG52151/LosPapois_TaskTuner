import React from 'react';

export type KpiTone = 'success' | 'warning' | 'danger' | 'info' | 'brand';

const TONE_CLASSES: Record<KpiTone, string> = {
  success: 'bg-green-100 text-green-600',
  warning: 'bg-orange-100 text-orange-500',
  danger: 'bg-red-100 text-red-500',
  info: 'bg-blue-100 text-blue-500',
  brand: 'bg-brand-lighter text-brand-dark',
};

export interface KpiCardProps {
  /** Small label shown in the top-left of the card. */
  label: string;
  /** Big bold value shown beneath the label (e.g. "50%", "2.9 days"). */
  value: string;
  /** Heroicon component rendered inside the colored badge in the top-right. */
  icon: React.ComponentType<{ className?: string }>;
  /** Visual tone applied to the icon badge. Defaults to brand. */
  tone?: KpiTone;
  /**
   * Optional content rendered below the value — typically a chart, sparkline,
   * or contextual subtitle. Kept generic so the same card supports many shapes.
   */
  children?: React.ReactNode;
}

/**
 * Generic KPI card used in the Team page (and reusable elsewhere).
 *
 * Layout:
 *   ┌──────────────────────────┐
 *   │ label           [icon]   │
 *   │ BIG VALUE                │
 *   │ {children: chart/note}   │
 *   └──────────────────────────┘
 */
function KpiCard({ label, value, icon: Icon, tone = 'brand', children }: KpiCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col
                 shadow-sm shadow-gray-200/60 hover:shadow-md hover:-translate-y-0.5
                 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-gray-500">{label}</span>
        <span
          className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0
                      ${TONE_CLASSES[tone]}`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {/* Brand-dark color tints every KPI value with the green palette — */}
      {/* one of the small accent points that distributes the brand across */}
      {/* the page instead of concentrating it in headers. */}
      <div className="mt-2 text-3xl font-bold text-brand-dark">{value}</div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default React.memo(KpiCard);
