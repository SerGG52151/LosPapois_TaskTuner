import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getFromStorage, STORAGE_KEYS } from '../../Utils/storage';

interface ProjectDTO {
  pjId: number;
  namePj: string;
}

interface Crumb {
  label: string;
  /** When true the crumb is rendered as the current page (bolder, darker). */
  current?: boolean;
}

/**
 * Resolves the current pathname into a sequence of breadcrumb labels.
 * Project names are looked up against the cached PROJECTS list (filled by
 * the sidebar fetch / mock fallback), keeping this component zero-fetch.
 */
function buildCrumbs(pathname: string): Crumb[] {
  const projects = getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS) ?? [];
  const findProject = (id: number) =>
    projects.find(p => p.pjId === id)?.namePj ?? 'Proyecto';

  // Static top-level routes
  const staticMap: Record<string, string> = {
    '/tasks':    'Tareas',
    '/projects': 'Proyectos',
    '/profile':  'Perfil',
  };
  if (staticMap[pathname]) {
    return [{ label: staticMap[pathname], current: true }];
  }

  // /projects/:projectId/team
  const teamMatch = pathname.match(/^\/projects\/(-?\d+)\/team\/?$/);
  if (teamMatch) {
    const id = Number(teamMatch[1]);
    return [
      { label: findProject(id) },
      { label: 'Equipo', current: true },
    ];
  }

  // /projects/:projectId/sprints/:sprintId
  const sprintMatch = pathname.match(
    /^\/projects\/(-?\d+)\/sprints\/(-?\d+)\/?$/
  );
  if (sprintMatch) {
    const pid = Number(sprintMatch[1]);
    const sid = Number(sprintMatch[2]);
    return [
      { label: findProject(pid) },
      { label: `Sprint ${sid}`, current: true },
    ];
  }

  return [];
}

/**
 * Compact breadcrumb shown in the main header. Reads the URL and resolves
 * names from local cache — no fetches, no context, drop-in anywhere inside
 * the Router.
 */
export default function PageBreadcrumb() {
  const { pathname } = useLocation();
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center gap-2">
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-gray-300" aria-hidden="true">
                /
              </span>
            )}
            <span
              className={
                c.current
                  ? 'font-semibold text-brand-dark'
                  : 'text-gray-500'
              }
              aria-current={c.current ? 'page' : undefined}
            >
              {c.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
