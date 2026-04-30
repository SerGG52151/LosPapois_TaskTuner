import React, { useEffect, useState } from 'react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { API_CONFIG } from '../../config';
import { getFromStorage, STORAGE_KEYS } from '../../Utils/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SessionUser {
  userId: number;
  nameUser: string;
  mail: string;
  role: string;
  idTelegram: string;
  token?: string;
}

export interface DeleteProjectModalProps {
  isOpen: boolean;
  projectId: number | null;
  projectName: string;
  /** Called after the project has been successfully deleted. */
  onDeleted: () => void;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Confirmation modal that requires the user to re-enter their email and
 * password before a project is permanently deleted. Designed to prevent
 * accidental clicks on a destructive action that cascades to sprints,
 * tasks, and documents.
 */
export default function DeleteProjectModal({
  isOpen,
  projectId,
  projectName,
  onDeleted,
  onClose,
}: DeleteProjectModalProps) {
  const sessionUser = getFromStorage<SessionUser>(STORAGE_KEYS.USER);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Reset form whenever the modal is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Close on Escape — same pattern used by the other modals in the app.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || projectId == null) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Local guard: the entered email must match the active session — we
    // don't want a passing-by user to delete a project with their own
    // credentials.
    if (
      !sessionUser ||
      email.trim().toLowerCase() !== sessionUser.mail.trim().toLowerCase()
    ) {
      setError('The email does not match the currently signed-in user.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      // Re-verify credentials by hitting the login endpoint. A 200 response
      // means the password is correct for that email.
      const authRes = await fetch(API_CONFIG.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: email, password }),
      });

      if (!authRes.ok) {
        setError('Incorrect email or password. Please try again.');
        setLoading(false);
        return;
      }

      // Credentials confirmed — proceed with the destructive call.
      const delRes = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!delRes.ok) {
        setError('The project could not be deleted. Please try again later.');
        setLoading(false);
        return;
      }

      onDeleted();
      onClose();
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header — red accent makes the destructive intent obvious. */}
        <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100">
          <span
            className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 shrink-0"
            aria-hidden="true"
          >
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">Delete project</h2>
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

        {/* Warning + form */}
        <form onSubmit={handleConfirm} className="px-6 py-5 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <p className="font-semibold">This action cannot be undone.</p>
            <p className="mt-1">
              Deleting this project will permanently remove all of its sprints,
              tasks, features, and documents. To prevent accidental deletions,
              please re-enter your email and password to continue.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirm-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="confirm-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              placeholder="Your account password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
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
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white
                         bg-red-600 hover:bg-red-700 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting…' : 'Delete project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
