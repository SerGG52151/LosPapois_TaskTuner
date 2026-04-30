import React, { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export interface CloseProjectModalProps {
  isOpen: boolean;
  projectId: number | null;
  projectName: string;
  /** Called after the project has been successfully closed. */
  onClosed: () => void;
  onClose: () => void;
}

/**
 * Two-step confirmation modal for finalizing (closing) a project.
 *
 *   Step 1 — Info   : explains what "finalizing" means and asks for an
 *                     initial confirmation.
 *   Step 2 — Warning: shows a hard warning that no further changes will be
 *                     possible, and requires the user to type the full
 *                     project name before the destructive action becomes
 *                     available. This prevents accidental clicks while
 *                     keeping the flow self-contained in one window.
 */
export default function CloseProjectModal({
  isOpen,
  projectId,
  projectName,
  onClosed,
  onClose,
}: CloseProjectModalProps) {
  type Step = 'info' | 'warning';

  const [step, setStep] = useState<Step>('info');
  const [typedName, setTypedName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Reset every piece of state whenever the modal is (re)opened so the
  // user always lands on the info step with empty inputs.
  useEffect(() => {
    if (isOpen) {
      setStep('info');
      setTypedName('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Close on Escape — same pattern as the rest of the app's modals.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || projectId == null) return null;

  // Strict equality (whitespace-trimmed) — the user must reproduce the
  // project name exactly. Case-sensitive on purpose to make the gesture
  // deliberate.
  const nameMatches = typedName.trim() === projectName.trim();

  const handleAdvanceToWarning = () => {
    setError('');
    setTypedName('');
    setStep('warning');
  };

  const handleConfirm = async () => {
    if (!nameMatches) {
      setError('The project name does not match. Please type it exactly as shown.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/close`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        setError('The project could not be finalized. Please try again later.');
        setLoading(false);
        return;
      }

      onClosed();
      onClose();
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Header colors swap between steps so the visual weight matches the
  //    severity of the current message (brand-green for info, red for the
  //    final warning).
  const headerIcon =
    step === 'info' ? (
      <CheckCircleIcon className="h-6 w-6 text-brand-dark" />
    ) : (
      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
    );

  const headerIconBg = step === 'info' ? 'bg-brand-lighter' : 'bg-red-100';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100">
          <span
            className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${headerIconBg}`}
            aria-hidden="true"
          >
            {headerIcon}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">
              {step === 'info' ? 'Finalize project' : 'Final confirmation'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {projectName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body — content swaps based on the current step. */}
        <div className="px-6 py-5 space-y-4">
          {step === 'info' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <p className="font-semibold">
                Are you sure you want to finalize this project?
              </p>
              <p className="mt-1">
                Finalizing marks the project as closed and records today's date
                as its end date. Sprints, tasks, and historical data will remain
                available for reporting, but the project will no longer be
                treated as active.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                <p className="font-semibold">
                  You are about to finalize this project.
                </p>
                <p className="mt-1">
                  Once finalized, no further changes will be allowed — sprints,
                  tasks, and members can no longer be added or modified. This
                  action cannot be undone from the application.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm-project-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  To confirm, type the project's full name:{' '}
                  <span className="font-semibold text-gray-900">
                    {projectName}
                  </span>
                </label>
                <input
                  id="confirm-project-name"
                  type="text"
                  autoComplete="off"
                  autoFocus
                  value={typedName}
                  onChange={e => {
                    setTypedName(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                  placeholder={projectName}
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Footer actions — content also swaps based on the current step. */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700
                         bg-gray-100 hover:bg-gray-200 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            {step === 'info' ? (
              <button
                type="button"
                onClick={handleAdvanceToWarning}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white
                           bg-brand hover:bg-brand-dark transition-colors"
              >
                Finalize project
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading || !nameMatches}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white
                           bg-red-600 hover:bg-red-700 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Finalizing…' : 'Finalize project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
