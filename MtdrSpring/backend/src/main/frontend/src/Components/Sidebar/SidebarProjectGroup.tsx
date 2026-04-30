import React, { useCallback, useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronRightIcon,
  FolderIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import SidebarItem from './SidebarItem';
import SidebarSectionLabel from './SidebarSectionLabel';
import {
  getFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from '../../Utils/storage';

export interface SprintLite {
  id: number;
  name: string;
}

export interface SidebarProjectGroupProps {
  projectId: number;
  projectName: string;
  /** Whether the group should start expanded (e.g. for the first project). */
  defaultOpen?: boolean;
  /** Optional callback fired when the "Add Sprint" CTA is clicked. */
  onAddSprint?: (projectId: number) => void;
  /**
   * External nudge to re-fetch this project's sprints — incremented by the
   * parent after a successful sprint creation. Plain number used as a
   * useEffect dependency, no extra plumbing needed.
   */
  refreshToken?: number;
}

/** Backend SprintTT shape — fields the sidebar uses (id, name) plus the */
/** start date used for chronological sorting before render. */
interface SprintDTO {
  sprId: number;
  nameSprint: string;
  dateStartSpr: string | null;
}

/**
 * Fallback shown when the backend can't be reached *and* the project is a
 * mock demo (negative ID). Real projects (positive IDs) start empty and
 * fill in once the fetch resolves.
 */
const MOCK_SPRINTS: SprintLite[] = [
  { id: 1, name: 'Sprint 1' },
  { id: 2, name: 'Sprint 2' },
  { id: 3, name: 'Sprint 3' },
];

/** Per-project cache key — sprints are stored separately for each project. */
const sprintsCacheKey = (projectId: number) =>
  `${STORAGE_KEYS.SPRINTS}_${projectId}`;

/**
 * Expandable project node inside the sidebar.
 *
 * Layout (when expanded):
 *   ▸ 📁 Project name           ← clickable header toggles open/closed
 *      ├─ 👥 Team               ← link to /projects/:projectId/team
 *      ├─ SPRINTS               ← section label
 *      ├─ 📅 Sprint 1           ← links to /projects/:projectId/sprints/:sprintId
 *      ├─ 📅 Sprint 2           ← (active highlight handled by NavLink)
 *      ├─ 📅 Sprint 3
 *      └─ ➕ Add Sprint         ← CTA, brand-colored
 */
function SidebarProjectGroup({
  projectId,
  projectName,
  defaultOpen = false,
  onAddSprint,
  refreshToken = 0,
}: SidebarProjectGroupProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  // Sprints are seeded from the per-project cache for instant paint, then
  // refreshed from /api/sprints/project/{projectId} in the background.
  // Mock projects (negative IDs) skip the fetch entirely and use MOCK_SPRINTS
  // as their permanent display data.
  const [sprints, setSprints] = useState<SprintLite[]>(() => {
    if (projectId < 0) return MOCK_SPRINTS;
    return getFromStorage<SprintLite[]>(sprintsCacheKey(projectId)) ?? [];
  });

  useEffect(() => {
    if (projectId < 0) return; // demo project — no backend fetch
    let cancelled = false;
    fetch(`/api/sprints/project/${projectId}`)
      .then(res => (res.ok ? res.json() : null))
      .then((data: SprintDTO[] | null) => {
        if (cancelled || !data) return;
        // Sort chronologically by start date — sprints without a start date
        // go last (treated as Infinity), so dated ones lead the list.
        const sorted = [...data].sort((a, b) => {
          const aTime = a.dateStartSpr ? new Date(a.dateStartSpr).getTime() : Infinity;
          const bTime = b.dateStartSpr ? new Date(b.dateStartSpr).getTime() : Infinity;
          return aTime - bTime;
        });
        const mapped = sorted.map<SprintLite>(s => ({
          id: s.sprId,
          name: s.nameSprint,
        }));
        setSprints(mapped);
        saveToStorage(sprintsCacheKey(projectId), mapped);
      })
      .catch(() => {
        /* Keep cached/empty sprints on failure — no UI noise. */
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, refreshToken]);

  const toggle = useCallback(() => setIsOpen(o => !o), []);
  const handleAddSprint = useCallback(() => {
    onAddSprint?.(projectId);
  }, [onAddSprint, projectId]);

  return (
    <div>
      {/* Project header — toggles expansion */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium
                   text-gray-700 hover:bg-brand-lighter hover:text-brand-dark
                   transition-colors text-left"
      >
        <ChevronRightIcon
          className={`size-4 shrink-0 transition-transform duration-150
                      ${isOpen ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
        <FolderIcon className="size-5 shrink-0" aria-hidden="true" />
        <span className="truncate">{projectName}</span>
      </button>

      {/* Children — Team + SPRINTS list */}
      {isOpen && (
        <div className="ml-4 mt-1 mb-1 border-l border-gray-100 pl-2 space-y-0.5">
          <SidebarItem
            icon={UserGroupIcon}
            label="Team"
            to={`/projects/${projectId}/team`}
            dense
          />

          <SidebarItem
            icon={ChartBarIcon}
            label="Statistics"
            to={`/projects/${projectId}/statistics`}
            dense
          />

          <SidebarSectionLabel>Sprints</SidebarSectionLabel>

          {sprints.length === 0 ? (
            <p className="px-3 py-1.5 text-xs text-gray-400">No sprints yet</p>
          ) : (
            sprints.map(s => (
              <SidebarItem
                key={s.id}
                icon={CalendarDaysIcon}
                label={s.name}
                to={`/projects/${projectId}/sprints/${s.id}`}
                dense
              />
            ))
          )}

          {/* CTA — Add Sprint. Subtle brand-text style so the sprint list */}
          {/* stays the visual focus; the "+" + brand color still reads as */}
          {/* an action. Same pattern is mirrored by "Add Project" at */}
          {/* the bottom of the project list. */}
          <button
            type="button"
            onClick={handleAddSprint}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm font-medium
                       text-brand-dark hover:bg-brand-lighter
                       transition-colors text-left"
          >
            <PlusIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">Add Sprint</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default React.memo(SidebarProjectGroup);
