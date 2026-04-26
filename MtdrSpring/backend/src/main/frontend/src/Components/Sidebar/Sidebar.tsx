import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightStartOnRectangleIcon,
  PlusIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import SidebarHeader from './SidebarHeader';
import SidebarItem from './SidebarItem';
import SidebarProjectGroup from './SidebarProjectGroup';
import { AddSprintModal } from '../Sprint';
import type { NewSprintData } from '../Sprint';
import {
  getFromStorage,
  removeFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from '../../Utils/storage';

interface ProjectDTO {
  pjId: number;
  namePj: string;
}

// Visual fallback while the backend / proxy is offline. Lets the new sidebar
// structure (expandable groups, sprints, etc.) be reviewed without a live API.
// Remove or empty this array once the backend wiring is back in place.
const MOCK_PROJECTS: ProjectDTO[] = [
  { pjId: -1, namePj: 'Proyecto Demo Alpha' },
  { pjId: -2, namePj: 'Proyecto Demo Beta' },
  { pjId: -3, namePj: 'Proyecto Demo Gamma' },
];

export interface SidebarProps {
  /** Controls whether the sidebar is visible (true) or collapsed off-screen (false). */
  isOpen: boolean;
}

/**
 * Side navigation panel.
 *
 * Sections:
 *   - Header  → TaskTuner brand
 *   - Nav     → Project list (fetched from /api/projects/open, cached locally)
 *   - Footer  → Profile link + Sign out action
 *
 * Width transitions from w-64 to w-0 when isOpen toggles, so the rest of
 * the layout reflows smoothly via Tailwind's transition utilities.
 */
function Sidebar({ isOpen }: SidebarProps) {
  const navigate = useNavigate();

  // Seed projects from cache for instant paint, refresh from backend in background.
  // Falls back to MOCK_PROJECTS so the new sidebar structure stays visible while
  // the backend / proxy is offline.
  const [projects, setProjects] = useState<ProjectDTO[]>(() => {
    const cached = getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS);
    return cached && cached.length > 0 ? cached : MOCK_PROJECTS;
  });

  useEffect(() => {
    let cancelled = false;
    // /api/projects (no /open) returns ALL projects, including closed ones.
    // The sidebar shows everything so archived/closed projects stay reachable.
    fetch('/api/projects')
      .then(res => (res.ok ? res.json() : null))
      .then((data: ProjectDTO[] | null) => {
        if (cancelled || !data || data.length === 0) return;
        setProjects(data);
        saveToStorage(STORAGE_KEYS.PROJECTS, data);
      })
      .catch(() => {
        /* Keep current projects (cache or mock) if network fails — graceful degradation. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = useCallback(() => {
    removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
    removeFromStorage(STORAGE_KEYS.USER);
    navigate('/login');
  }, [navigate]);

  // Single shared "Add Sprint" modal — opened by any project group via the
  // onAddSprint callback. Tracks which project the new sprint belongs to so
  // the POST has the right parent ID.
  const [addSprintFor, setAddSprintFor] = useState<number | null>(null);
  const openAddSprint = useCallback(
    (pid: number) => setAddSprintFor(pid),
    []
  );
  const closeAddSprint = useCallback(() => setAddSprintFor(null), []);

  // Per-project version counter — bumped after a successful sprint creation
  // for *that project*, so its SidebarProjectGroup re-fetches sprints. Other
  // groups stay unaffected (no wasted refetches).
  const [sprintVersions, setSprintVersions] = useState<Record<number, number>>({});

  const handleCreateSprint = useCallback(
    async (data: NewSprintData) => {
      if (addSprintFor === null) return;
      try {
        const res = await fetch('/api/sprints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nameSprint:   data.name,
            dateStartSpr: data.startDate,
            dateEndSpr:   data.endDate,
            taskGoal:     null,
            stateSprint:  'active',
            pjId:         addSprintFor,
          }),
        });
        if (!res.ok) throw new Error(`POST /api/sprints failed: ${res.status}`);
        // Trigger a re-fetch of just this project's sprints.
        setSprintVersions(prev => ({
          ...prev,
          [addSprintFor]: (prev[addSprintFor] ?? 0) + 1,
        }));
      } catch (err) {
        // TODO: surface to the user via toast/snackbar.
        console.error('[Sidebar] create sprint failed', err);
      }
    },
    [addSprintFor]
  );

  // Visual-only stub for "Add Project" — wire to a modal + POST when
  // the project-creation flow is designed.
  const handleAddProject = useCallback(() => {
    console.log('[Sidebar] add project clicked');
  }, []);

  return (
    <aside
      aria-label="Main navigation"
      aria-hidden={!isOpen}
      // Directional right-only shadow tinted with brand-dark so it reads as
      // part of the green palette instead of a generic gray drop-shadow.
      // Border kept for crisp definition at the edge.
      className={`flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden
                  shadow-[4px_0_16px_-4px_rgba(0,77,64,0.08)]
                  transition-[width] duration-200 ease-in-out
                  ${isOpen ? 'w-64' : 'w-0'}`}
    >
      {/* Inner container keeps fixed width while parent animates → no jittery contents */}
      <div className="flex flex-col h-full w-64">
        <SidebarHeader />

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Projects">
          {projects.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">No projects yet</p>
          ) : (
            projects.map((p, idx) => (
              <SidebarProjectGroup
                key={p.pjId}
                projectId={p.pjId}
                projectName={p.namePj}
                // Open the first project by default so the new structure is
                // discoverable on first paint. Subsequent groups stay collapsed.
                defaultOpen={idx === 0}
                onAddSprint={openAddSprint}
                refreshToken={sprintVersions[p.pjId] ?? 0}
              />
            ))
          )}

          {/* CTA at the end of the projects list — mirrors the "Añadir Sprint" */}
          {/* pattern inside each project so the user learns one convention: */}
          {/* "+ Añadir X" always closes its respective list. */}
          <button
            type="button"
            onClick={handleAddProject}
            className="flex items-center gap-2 w-full mt-2 px-3 py-2 rounded-lg
                       text-sm font-medium text-brand-dark hover:bg-brand-lighter
                       transition-colors text-left"
          >
            <PlusIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">Añadir Proyecto</span>
          </button>
        </nav>

        <div className="px-3 py-3 border-t border-gray-100 space-y-1">
          <SidebarItem icon={UserCircleIcon} label="Profile" to="/profile" />
          <SidebarItem
            icon={ArrowRightStartOnRectangleIcon}
            label="Sign out"
            onClick={handleSignOut}
          />
        </div>
      </div>

      <AddSprintModal
        isOpen={addSprintFor !== null}
        onClose={closeAddSprint}
        onCreate={handleCreateSprint}
      />
    </aside>
  );
}

export default Sidebar;
