import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  CalendarIcon,
  FolderIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../Utils/storage';
import DeleteProjectModal from '../Components/Common/DeleteProjectModal';

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
  return d.toLocaleDateString('en-US', {
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

  // Project pending deletion — non-null means the confirmation modal is open.
  const [projectToDelete, setProjectToDelete] = useState<ProjectDTO | null>(null);

  // Optimistically drop the project from the local list once the modal
  // reports a successful delete; the cache is also refreshed so the sidebar
  // stays in sync after a navigation.
  const handleProjectDeleted = (deletedId: number) => {
    setProjects(prev => {
      const next = prev.filter(p => p.pjId !== deletedId);
      saveToStorage(STORAGE_KEYS.PROJECTS, next);
      return next;
    });
    setMemberCounts(prev => {
      const { [deletedId]: _omit, ...rest } = prev;
      return rest;
    });
    setSprintCounts(prev => {
      const { [deletedId]: _omit, ...rest } = prev;
      return rest;
    });
  };

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
            Select a project
          </h1>
          <p className="text-gray-500 mt-2">
            Choose a project to view its sprints and manage your team
          </p>
        </header>

        {projects.length === 0 ? (
          <p className="text-center text-gray-400 mt-12">
            No open projects yet. Create one from the sidebar.
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
                onDelete={() => setProjectToDelete(p)}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteProjectModal
        isOpen={projectToDelete != null}
        projectId={projectToDelete?.pjId ?? null}
        projectName={projectToDelete?.namePj ?? ''}
        onClose={() => setProjectToDelete(null)}
        onDeleted={() => {
          if (projectToDelete) handleProjectDeleted(projectToDelete.pjId);
        }}
      />
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
  onDelete: () => void;
}

const ProjectCard = React.memo(function ProjectCard({
  project,
  memberCount,
  sprintCount,
  onSelect,
  onDelete,
}: ProjectCardProps) {
  // Container is a clickable div instead of a <button> so we can nest a
  // dedicated delete button inside without producing invalid HTML.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className="relative text-left bg-white border border-gray-200 rounded-2xl p-6
                 shadow-sm shadow-gray-200/60
                 hover:shadow-md hover:-translate-y-0.5 hover:border-brand
                 transition-all duration-200 cursor-pointer
                 focus:outline-2 focus:outline-brand-dark"
    >
      {/* Floating delete affordance — stops propagation so it doesn't trigger
          the card's main onSelect. */}
      <button
        type="button"
        aria-label={`Delete project ${project.namePj}`}
        title="Delete project"
        onClick={e => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 inline-flex items-center justify-center
                   rounded-md p-1.5 text-gray-400
                   hover:bg-red-50 hover:text-red-600
                   transition-colors focus:outline-2 focus:outline-red-500"
      >
        <TrashIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex items-start gap-4">
        <span
          className="flex items-center justify-center h-12 w-12 rounded-xl
                     bg-brand-lighter shrink-0"
          aria-hidden="true"
        >
          <FolderIcon className="h-6 w-6 text-brand-dark" />
        </span>

        <div className="min-w-0 flex-1 pr-8">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {project.namePj}
          </h2>
          <dl className="mt-3 space-y-1.5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>Ends: {formatDate(project.dateEndSetPj)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserGroupIcon
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <span>
                {memberCount} {memberCount === 1 ? 'team member' : 'team members'}
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
    </div>
  );
});
