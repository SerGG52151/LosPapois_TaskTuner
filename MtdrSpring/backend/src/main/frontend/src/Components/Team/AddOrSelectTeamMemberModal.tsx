import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface NewTeamMemberData {
  nameUser: string;
  idTelegram: string;
  mail: string;
}

export interface ExistingUser {
  userId: number;
  nameUser: string;
  mail?: string;
  idTelegram: string;
  role: string;
}

export interface AddOrSelectTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmNew: (data: NewTeamMemberData) => void;
  onConfirmExisting: (userId: number) => void;
  existingUsers: ExistingUser[];
  currentTeamMemberIds: Set<number>;
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

type Mode = 'create' | 'select';

export default function AddOrSelectTeamMemberModal({
  isOpen,
  onClose,
  onConfirmNew,
  onConfirmExisting,
  existingUsers,
  currentTeamMemberIds,
  submitting = false,
  error,
}: AddOrSelectTeamMemberModalProps) {
  const [mode, setMode] = useState<Mode>('create');
  const [form, setForm] = useState<NewTeamMemberData>(EMPTY_FORM);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [touched, setTouched] = useState<Record<keyof NewTeamMemberData, boolean>>({
    nameUser: false,
    idTelegram: false,
    mail: false,
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Available users for selection (not already in team)
  const availableUsers = useMemo(
    () =>
      existingUsers.filter(u => !currentTeamMemberIds.has(u.userId)),
    [existingUsers, currentTeamMemberIds]
  );

  // Filtered users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;
    
    const query = searchQuery.toLowerCase();
    return availableUsers.filter(user =>
      user.nameUser.toLowerCase().includes(query)
    );
  }, [availableUsers, searchQuery]);

  useEffect(() => {
    if (!isOpen) return;
    setForm(EMPTY_FORM);
    setTouched({ nameUser: false, idTelegram: false, mail: false });
    setSelectedUserId(null);
    setSearchQuery('');
    setMode('create');
    const t = setTimeout(() => nameInputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [isOpen]);

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

  const isCreateValid = Object.keys(errors).length === 0;
  const isSelectValid = selectedUserId !== null;

  const updateField = (key: keyof NewTeamMemberData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nameUser: true, idTelegram: true, mail: true });
    if (!isCreateValid) return;

    onConfirmNew({
      nameUser: form.nameUser.trim(),
      idTelegram: form.idTelegram.trim(),
      mail: form.mail.trim(),
    });
  };

  const onSubmitSelect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelectValid) return;
    onConfirmExisting(selectedUserId!);
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
          Add Team Member
        </h2>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setMode('create')}
            className={`pb-3 px-1 font-semibold text-sm transition-colors ${
              mode === 'create'
                ? 'text-brand border-b-2 border-brand'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create New Member
          </button>
          <button
            onClick={() => setMode('select')}
            className={`pb-3 px-1 font-semibold text-sm transition-colors ${
              mode === 'select'
                ? 'text-brand border-b-2 border-brand'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Add Existing User
          </button>
        </div>

        {/* Create New Member Form */}
        {mode === 'create' && (
          <form onSubmit={onSubmitCreate} className="space-y-4">
            <div>
              <label htmlFor="new-member-name" className="block text-sm font-semibold text-gray-800 mb-2">
                Member Name
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
                Telegram Username (@Name)
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
                Email
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
                disabled={!isCreateValid || submitting}
                className="flex-1 bg-brand hover:bg-brand-dark text-white py-3 rounded-xl
                           font-semibold shadow-sm transition-colors disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Create Member'}
              </button>
            </div>
          </form>
        )}

        {/* Select Existing User Form */}
        {mode === 'select' && (
          <form onSubmit={onSubmitSelect} className="space-y-4">
            {availableUsers.length === 0 ? (
              <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3">
                All users are already members of this team.
              </p>
            ) : (
              <>
                <div>
                  <label htmlFor="search-user" className="block text-sm font-semibold text-gray-800 mb-2">
                    Search User
                  </label>
                  <input
                    id="search-user"
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                               placeholder:text-gray-400
                               focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
                               transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="select-user" className="block text-sm font-semibold text-gray-800 mb-2">
                    Select User {filteredUsers.length < availableUsers.length && `(${filteredUsers.length}/${availableUsers.length})`}
                  </label>
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3">
                      No users match your search.
                    </p>
                  ) : (() => {
                    const selectedUser = selectedUserId == null
                      ? null
                      : availableUsers.find(user => user.userId === selectedUserId) ?? null;
                    const selectedUserMissingFromFilter = selectedUser != null
                      && !filteredUsers.some(user => user.userId === selectedUser.userId);

                    return (
                      <select
                        id="select-user"
                        value={selectedUserId ?? ''}
                        onChange={e => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                                   focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
                                   transition-colors"
                      >
                        <option value="">-- Choose a user --</option>
                        {selectedUserMissingFromFilter && (
                          <option value={selectedUser.userId}>
                            {selectedUser.nameUser}
                          </option>
                        )}
                        {filteredUsers.map(user => (
                          <option key={user.userId} value={user.userId}>
                            {user.nameUser}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </>
            )}

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
                disabled={!isSelectValid || submitting || availableUsers.length === 0}
                className="flex-1 bg-brand hover:bg-brand-dark text-white py-3 rounded-xl
                           font-semibold shadow-sm transition-colors disabled:opacity-60"
              >
                {submitting ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
