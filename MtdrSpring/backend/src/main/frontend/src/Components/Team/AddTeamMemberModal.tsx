import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface NewTeamMemberData {
  nameUser: string;
  idTelegram: string;
  mail: string;
}

export interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: NewTeamMemberData) => void;
  initialData?: NewTeamMemberData | null;
  title?: string;
  confirmLabel?: string;
  submitting?: boolean;
  error?: string | null;
}

const EMPTY_FORM: NewTeamMemberData = {
  nameUser: '',
  idTelegram: '',
  mail: '',
};

const TELEGRAM_USERNAME_RE = /^@[A-Za-z0-9_]{5,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddTeamMemberModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  title,
  confirmLabel,
  submitting = false,
  error,
}: AddTeamMemberModalProps) {
  const [form, setForm] = useState<NewTeamMemberData>(initialData ?? EMPTY_FORM);
  const [touched, setTouched] = useState<Record<keyof NewTeamMemberData, boolean>>({
    nameUser: false,
    idTelegram: false,
    mail: false,
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialData ?? EMPTY_FORM);
    setTouched({ nameUser: false, idTelegram: false, mail: false });
    const t = setTimeout(() => nameInputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, submitting]);

  const errors = useMemo(() => {
    const next: Partial<Record<keyof NewTeamMemberData, string>> = {};

    if (!form.nameUser.trim()) {
      next.nameUser = 'Name is required.';
    }

    if (!form.idTelegram.trim()) {
      next.idTelegram = 'Telegram username is required.';
    } else if (!TELEGRAM_USERNAME_RE.test(form.idTelegram.trim())) {
      next.idTelegram = 'Use a valid Telegram username like @john_dev (5-32 chars).';
    }

    if (!form.mail.trim()) {
      next.mail = 'Email is required.';
    } else if (!EMAIL_RE.test(form.mail.trim())) {
      next.mail = 'Use a valid email format.';
    }

    return next;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const updateField = (key: keyof NewTeamMemberData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nameUser: true, idTelegram: true, mail: true });
    if (!isValid) return;

    onConfirm({
      nameUser: form.nameUser.trim(),
      idTelegram: form.idTelegram.trim(),
      mail: form.mail.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => !submitting && onClose()}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-team-member-title"
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7"
      >
        <h2 id="add-team-member-title" className="text-xl font-bold text-gray-900 mb-5">
          {title ?? 'Add New Team Member'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-member-name" className="block text-sm font-semibold text-gray-800 mb-2">
              New Member Name
            </label>
            <input
              ref={nameInputRef}
              id="new-member-name"
              type="text"
              value={form.nameUser}
              onBlur={() => setTouched(prev => ({ ...prev, nameUser: true }))}
              onChange={e => updateField('nameUser', e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                         placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
                         transition-colors"
            />
            {touched.nameUser && errors.nameUser && (
              <p className="text-xs text-red-600 mt-1">{errors.nameUser}</p>
            )}
          </div>

          <div>
            <label htmlFor="new-member-telegram" className="block text-sm font-semibold text-gray-800 mb-2">
              New Member Telegram Username (@Name)
            </label>
            <input
              id="new-member-telegram"
              type="text"
              value={form.idTelegram}
              onBlur={() => setTouched(prev => ({ ...prev, idTelegram: true }))}
              onChange={e => updateField('idTelegram', e.target.value)}
              placeholder="@jane_doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                         placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
                         transition-colors"
            />
            {touched.idTelegram && errors.idTelegram && (
              <p className="text-xs text-red-600 mt-1">{errors.idTelegram}</p>
            )}
          </div>

          <div>
            <label htmlFor="new-member-email" className="block text-sm font-semibold text-gray-800 mb-2">
              New Member Email
            </label>
            <input
              id="new-member-email"
              type="email"
              value={form.mail}
              onBlur={() => setTouched(prev => ({ ...prev, mail: true }))}
              onChange={e => updateField('mail', e.target.value)}
              placeholder="jane.doe@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                         placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
                         transition-colors"
            />
            {touched.mail && errors.mail && (
              <p className="text-xs text-red-600 mt-1">{errors.mail}</p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-3">
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
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 bg-brand hover:bg-brand-dark text-white py-3 rounded-xl
                         font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              {submitting ? 'Saving...' : (confirmLabel ?? 'Add Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
