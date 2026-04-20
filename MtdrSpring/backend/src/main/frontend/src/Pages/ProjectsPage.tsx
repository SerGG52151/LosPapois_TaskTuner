import { useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  PlusIcon,
  XCircleIcon,
  PlayCircleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

type Project = {
  id: number;
  name: string;
};

type Sprint = {
  id: number;
  name: string;
  endDate: string;
  taskCount: number;
};

const mockProjects: Project[] = [
  { id: 1, name: 'Inventory Management System' },
  { id: 2, name: 'Delivery App' },
  { id: 3, name: 'Customer Portal' },
];

const mockSprint: Sprint = {
  id: 3,
  name: 'Sprint 3',
  endDate: 'Apr 4, 2026',
  taskCount: 12,
};

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const [projectName, setProjectName] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl shadow-brand-dark/30">
        <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              placeholder="E.g.: Management System"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 placeholder-gray-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand-lighter"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Expected End Date
            </label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 placeholder-gray-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand-lighter"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-brand py-3 text-base font-semibold text-white shadow-md shadow-brand/25 hover:bg-brand-dark"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

function NewSprintModal({
  currentSprint,
  onClose,
}: {
  currentSprint: Sprint;
  onClose: () => void;
}) {
  const [duration, setDuration] = useState('');
  const nextSprintNumber = currentSprint.id + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl shadow-brand-dark/30">
        <h2 className="text-2xl font-bold text-gray-900">Start New Sprint</h2>

        <p className="mt-3 text-base text-gray-500">
          {currentSprint.name} will end and Sprint {nextSprintNumber} will begin.
        </p>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700">
            Sprint Duration (days)
          </label>
          <input
            type="number"
            placeholder="E.g.: 14"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 placeholder-gray-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand-lighter"
          />
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-brand py-3 text-base font-semibold text-white shadow-md shadow-brand/25 hover:bg-brand-dark"
          >
            Start Sprint
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project>(mockProjects[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewSprint, setShowNewSprint] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-2xl" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-left text-lg font-semibold text-gray-800 shadow-md shadow-brand/10 hover:shadow-lg hover:shadow-brand/15 transition-shadow"
            >
              {selectedProject.name}
              <ChevronDownIcon
                className={`size-5 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-100 bg-white py-2 shadow-xl shadow-brand-dark/15">
                {mockProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      setDropdownOpen(false);
                    }}
                    className={`block w-full px-5 py-3 text-left text-base hover:bg-brand-lighter ${
                      selectedProject.id === project.id
                        ? 'bg-brand-lighter font-semibold text-brand-dark'
                        : 'text-gray-700'
                    }`}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowNewProject(true)}
              className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-base font-semibold text-white shadow-md shadow-brand/25 hover:bg-brand-dark"
            >
              <PlusIcon className="size-5" />
              New Project
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-base font-semibold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600">
              <XCircleIcon className="size-5" />
              End Project
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-lg shadow-brand/10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{mockSprint.name}</h2>
            <div className="mt-2 flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CalendarDaysIcon className="size-4" />
                Ends: {mockSprint.endDate}
              </span>
              <span className="flex items-center gap-1.5">
                <ChartBarIcon className="size-4" />
                {mockSprint.taskCount} tasks
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowNewSprint(true)}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-base font-semibold text-white shadow-md shadow-brand/25 hover:bg-brand-dark"
          >
            <PlayCircleIcon className="size-5" />
            Start New Sprint
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-lg shadow-brand/10 hover:shadow-xl hover:shadow-brand/15 transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Sprint Progress</span>
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-lighter">
                <ChartBarIcon className="size-5 text-brand" />
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold text-gray-900">42%</p>
            <p className="mt-1 text-sm text-gray-500">5 of 12 tasks completed</p>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark"
                style={{ width: '42%' }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-lg shadow-brand/10 hover:shadow-xl hover:shadow-brand/15 transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Cycle Time</span>
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-lighter">
                <ClockIcon className="size-5 text-secondary" />
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold text-gray-900">2.8 days</p>
            <p className="mt-1 text-sm text-gray-500">Average per completed task</p>
          </div>
        </div>

      </div>

      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
      {showNewSprint && (
        <NewSprintModal currentSprint={mockSprint} onClose={() => setShowNewSprint(false)} />
      )}
    </div>
  );
}
