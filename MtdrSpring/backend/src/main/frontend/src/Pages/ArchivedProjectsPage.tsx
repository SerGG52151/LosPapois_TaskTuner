import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArchiveBoxIcon,
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

/** A project is considered archived once its real end date is recorded. */
function isArchived(p: ProjectDTO): boolean {
  return p.dateEndRealPj != null && p.dateEndRealPj !== '';
}

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

/**
 * Mirror of HomePage that lists only finalized (closed) projects, so a
 * manager can revisit historical projects for reporting without those
 * cards cluttering the active-project landing screen.
 *
 * Note: archived ≠ deleted. The data is fully intact and reachable; this
 * page just gives finished projects a separate, calmer home.
 */
export default function ArchivedProjectsPage() {
  const navigate = useNavigate();

  // Seed from cache for instant paint, then refresh from /api/projects.
  const [allProjects, setAllProjects] = useState<ProjectDTO[]>(
    () => getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS) ?? []
  );
  const [memberCounts, setMemberCounts] = useState<Record<number, number>>({});
  const [sprintCounts, setSprintCounts] = useState<Record<number, number>>(
    () => seedSprintCounts(getFromStorage<ProjectDTO[]>(STORAGE_KEYS.PROJECTS) ?? [])
  );

  const [projectToDelete, setProjectToDelete] = useState<ProjectDTO | null>(null);

  // Filter to the archived subset for display, but keep the full list around
  // so the cache stays consistent with what other pages expect.
  const archivedProjects = useMemo(
    () => allProjects.filter(isArchived),
    [allProjects]
  );

  useEffect(() => {
    let cancelled = false;

    fetch('/api/projects')
      .then(r => (r.ok ? r.json() : null))
      .then((data: ProjectDTO[] | null) => {
        if (cancelled || !data) return;
        setAllProjects(data);
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

  // Fill in sprint counts only for the archived ones we'll actually render.
  useEffect(() => {
    const missing = archivedProjects.filter(p => sprintCounts[p.pjId] == null);
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
  }, [archivedProjects, sprintCounts]);

  const handleProjectDeleted = (deletedId: number) => {
    setAllProjects(prev => {
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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-50 min-h-full px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <span
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl
                       bg-gray-100 mb-4"
            aria-hidden="true"
          >
            <ArchiveBoxIcon className="h-7 w-7 text-gray-500" />
          </span>
          <h1 className="text-4xl font-bold text-gray-900">
            Archived projects
          </h1>
          <p className="text-gray-500 mt-2">
            Finalized projects kept for historical reporting. Open one to
            review its sprints, tasks, and statistics.
          </p>
        </header>

        {archivedProjects.length === 0 ? (
          <p className="text-center text-gray-400 mt-12">
            No archived projects yet. A project is moved here once it is
            finalized from its Statistics page.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {archivedProjects.map(p => (
              <ArchivedProjectCard
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

interface ArchivedProjectCardProps {
  project: ProjectDTO;
  memberCount: number;
  sprintCount: number;
  onSelect: () => void;
  onDelete: () => void;
}

const ArchivedProjectCard = React.memo(function ArchivedProjectCard({
  project,
  memberCount,
  sprintCount,
  onSelect,
  onDelete,
}: ArchivedProjectCardProps) {
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
                 hover:shadow-md hover:-translate-y-0.5 hover:border-gray-400
                 transition-all duration-200 cursor-pointer
                 focus:outline-2 focus:outline-gray-500"
    >
      {/* Closed badge — pinned top-right next to the delete affordance so
          archived state is obvious without burying it inside the body. */}
      <span
        className="absolute top-3 right-12 inline-flex items-center gap-1
                   rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600"
      >
        Closed
      </span>

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
                     bg-gray-100 shrink-0"
          aria-hidden="true"
        >
          <FolderIcon className="h-6 w-6 text-gray-500" />
        </span>

        <div className="min-w-0 flex-1 pr-8">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {project.namePj}
          </h2>
          <dl className="mt-3 space-y-1.5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>Closed: {formatDate(project.dateEndRealPj)}</span>
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
