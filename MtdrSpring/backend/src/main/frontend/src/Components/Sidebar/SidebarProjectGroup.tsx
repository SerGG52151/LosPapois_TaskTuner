import React, { useCallback, useState } from 'react';
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  FolderIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import SidebarItem from './SidebarItem';
import SidebarSectionLabel from './SidebarSectionLabel';

export interface SprintLite {
  id: number;
  name: string;
}

export interface SidebarProjectGroupProps {
  projectId: number;
  projectName: string;
  /** Sprints to render inside the group. Defaults to mock data while the API is wired. */
  sprints?: SprintLite[];
  /** Whether the group should start expanded (e.g. for the first project). */
  defaultOpen?: boolean;
  /** Optional callback fired when the "Add Sprint" CTA is clicked. */
  onAddSprint?: (projectId: number) => void;
}

// Visual-only mock data until the sprints endpoint is wired.
const MOCK_SPRINTS: SprintLite[] = [
  { id: 1, name: 'Sprint 1' },
  { id: 2, name: 'Sprint 2' },
  { id: 3, name: 'Sprint 3' },
];

/**
 * Expandable project node inside the sidebar.
 *
 * Layout (when expanded):
 *   ▸ 📁 Project name           ← clickable header toggles open/closed
 *      ├─ 👥 Equipo             ← link to /projects/:projectId/team
 *      ├─ SPRINTS               ← section label
 *      ├─ 📅 Sprint 1           ← links to /projects/:projectId/sprints/:sprintId
 *      ├─ 📅 Sprint 2           ← (active highlight handled by NavLink)
 *      ├─ 📅 Sprint 3
 *      └─ ➕ Añadir Sprint      ← CTA, brand-colored
 */
function SidebarProjectGroup({
  projectId,
  projectName,
  sprints = MOCK_SPRINTS,
  defaultOpen = false,
  onAddSprint,
}: SidebarProjectGroupProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
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

      {/* Children — Equipo + SPRINTS list */}
      {isOpen && (
        <div className="ml-4 mt-1 mb-1 border-l border-gray-100 pl-2 space-y-0.5">
          <SidebarItem
            icon={UserGroupIcon}
            label="Equipo"
            to={`/projects/${projectId}/team`}
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
          {/* an action. Same pattern is mirrored by "Añadir Proyecto" at */}
          {/* the bottom of the project list. */}
          <button
            type="button"
            onClick={handleAddSprint}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm font-medium
                       text-brand-dark hover:bg-brand-lighter
                       transition-colors text-left"
          >
            <PlusIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">Añadir Sprint</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default React.memo(SidebarProjectGroup);
