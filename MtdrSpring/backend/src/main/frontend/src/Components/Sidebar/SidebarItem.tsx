import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Generic sidebar entry. Renders as a NavLink when `to` is provided
 * (auto-handles active state via React Router), or as a button when
 * `onClick` is provided (for actions like Sign out, or items without
 * a real route yet — pass `active` to force the highlighted style).
 */
export interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to?: string;
  onClick?: () => void;
  /**
   * Forces the active visual state when the item is rendered as a button.
   * Ignored in NavLink mode — there React Router determines active state.
   */
  active?: boolean;
  /** Optional density override for nested items (sprints under a project). */
  dense?: boolean;
}

// `relative` is required so the active-state ::before bar can absolute-position
// itself against the item. The before:* utilities only render when the item
// is active (idle state strips them out via empty class).
const baseClasses =
  'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ' +
  'transition-colors w-full text-left';

const denseClasses =
  'relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ' +
  'transition-colors w-full text-left';

const idleClasses = 'text-gray-700 hover:bg-brand-lighter hover:text-brand-dark';

// Active state: brand-tinted bg + a small green bar pinned to the left edge.
// The bar uses `before:` so it doesn't push content (no padding compensation
// needed). 1px wide, rounded on the right, vertically inset 6px.
const activeClasses =
  'bg-brand-lighter text-brand-dark ' +
  "before:content-[''] before:absolute before:left-0 before:top-1.5 " +
  'before:bottom-1.5 before:w-1 before:bg-brand before:rounded-r-full';

function SidebarItem({ icon: Icon, label, to, onClick, active, dense }: SidebarItemProps) {
  const root = dense ? denseClasses : baseClasses;

  if (to) {
    return (
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `${root} ${isActive ? activeClasses : idleClasses}`
        }
      >
        <Icon className="size-5 shrink-0" />
        <span className="truncate">{label}</span>
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${root} ${active ? activeClasses : idleClasses}`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

// Memoized: items rarely change after mount; only re-render when props differ.
export default React.memo(SidebarItem);
