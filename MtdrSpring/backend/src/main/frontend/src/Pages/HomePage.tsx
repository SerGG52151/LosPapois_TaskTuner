import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  CalendarIcon,
  FolderIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../Utils/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectDTO {
  pjId: number;
  namePj: string;
  dateStartPj?: string | null;
  dateEndSetPj?: string | null;
  dateEndRealPj?: string | null;
}

interface MembershipDTO {
  pjId: number;
  userId: number;
}

interface SprintLite {
  id: number;
  name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const sprintsCacheKey = (pjId: number) => `${STORAGE_KEYS.SPRINTS}_${pjId}`;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Seed the sprint-count map from per-project caches that the sidebar
 * already populates on mount. Avoids a wave of fetches just to display
 * "N sprints" badges.
 */
function seedSprintCounts(projects: ProjectDTO[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const p of projects) {
    const cached = getFromStorage<SprintLite[]>(sprintsCacheKey(p.pjId));
    if (cached) counts[p.pjId] = cached.length;
  }
  return counts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();

  // Seed everything from cache for instant paint, then refresh in background.
  const [projects, setProjects] = useState<ProjectDTO[]>(
    () => getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS) ?? []
  );
  const [memberCounts, setMemberCounts] = useState<Record<number, number>>({});
  const [sprintCounts, setSprintCounts] = useState<Record<number, number>>(
    () => seedSprintCounts(getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS) ?? [])
  );

  // Refresh projects + grab all memberships in one shot (1 fetch instead of N).
  useEffect(() => {
    let cancelled = false;

    // /api/projects (no /open) returns ALL projects — same source as the
    // sidebar so the two views stay in sync, including closed projects.
    fetch('/api/projects')
      .then(r => (r.ok ? r.json() : null))
      .then((data: ProjectDTO[] | null) => {
        if (cancelled || !data) return;
        setProjects(data);
        saveToStorage(STORAGE_KEYS.PROJECTS, data);
      })
      .catch(() => {});

    fetch('/api/project-memberships')
      .then(r => (r.ok ? r.json() : null))
      .then((data: MembershipDTO[] | null) => {
        if (cancelled || !data) return;
        const counts: Record<number, number> = {};
        for (const m of data) {
          counts[m.pjId] = (counts[m.pjId] ?? 0) + 1;
        }
        setMemberCounts(counts);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // Fill in sprint counts for any project whose cache is missing.
  useEffect(() => {
    const missing = projects.filter(p => sprintCounts[p.pjId] == null);
    if (missing.length === 0) return;
    let cancelled = false;
    for (const p of missing) {
      fetch(`/api/sprints/project/${p.pjId}`)
        .then(r => (r.ok ? r.json() : null))
        .then((data: SprintLite[] | null) => {
          if (cancelled || !data) return;
          setSprintCounts(prev => ({ ...prev, [p.pjId]: data.length }));
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [projects, sprintCounts]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-50 min-h-full px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Selecciona un proyecto
          </h1>
          <p className="text-gray-500 mt-2">
            Elige un proyecto para ver sus sprints y gestionar tu equipo
          </p>
        </header>

        {projects.length === 0 ? (
          <p className="text-center text-gray-400 mt-12">
            Aún no hay proyectos abiertos. Crea uno desde el sidebar.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {projects.map(p => (
              <ProjectCard
                key={p.pjId}
                project={p}
                memberCount={memberCounts[p.pjId] ?? 0}
                sprintCount={sprintCounts[p.pjId] ?? 0}
                onSelect={() => navigate(`/projects/${p.pjId}/team`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: ProjectDTO;
  memberCount: number;
  sprintCount: number;
  onSelect: () => void;
}

const ProjectCard = React.memo(function ProjectCard({
  project,
  memberCount,
  sprintCount,
  onSelect,
}: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left bg-white border border-gray-200 rounded-2xl p-6
                 shadow-sm shadow-gray-200/60
                 hover:shadow-md hover:-translate-y-0.5 hover:border-brand
                 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <span
          className="flex items-center justify-center h-12 w-12 rounded-xl
                     bg-brand-lighter shrink-0"
          aria-hidden="true"
        >
          <FolderIcon className="h-6 w-6 text-brand-dark" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {project.namePj}
          </h2>
          <dl className="mt-3 space-y-1.5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>Finaliza: {formatDate(project.dateEndSetPj)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserGroupIcon
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <span>
                {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'} del equipo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <span>
                {sprintCount} {sprintCount === 1 ? 'sprint' : 'sprints'}
              </span>
            </div>
          </dl>
        </div>
      </div>
    </button>
  );
});
