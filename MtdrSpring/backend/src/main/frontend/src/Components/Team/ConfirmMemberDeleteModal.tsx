import React, { useEffect } from 'react';

export interface ConfirmMemberDeleteModalProps {
  isOpen: boolean;
  memberName?: string;
  onClose: () => void;
  onConfirm: () => void;
  submitting?: boolean;
  error?: string | null;
}

export default function ConfirmMemberDeleteModal({
  isOpen,
  memberName,
  onClose,
  onConfirm,
  submitting = false,
  error,
}: ConfirmMemberDeleteModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, submitting]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="presentation"
      onClick={() => !submitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-member-title"
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7"
      >
        <h2 id="confirm-delete-member-title" className="text-xl font-bold text-gray-900 mb-3">
          Remove Team Member
        </h2>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {memberName
            ? `Are you sure you want to remove ${memberName} from this project?`
            : 'Are you sure you want to remove this member from this project?'}
        </p>

        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
          This will also delete all tasks currently assigned to this member in this project,
          including linked sprint-task entries.
        </p>

        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border border-gray-300 text-gray-800 py-3 rounded-xl
                       font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl
                       font-semibold shadow-sm transition-colors disabled:opacity-60"
          >
            {submitting ? 'Removing...' : 'Confirm Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
