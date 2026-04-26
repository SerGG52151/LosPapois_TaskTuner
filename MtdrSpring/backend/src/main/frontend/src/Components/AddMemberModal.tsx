import React, { useState, useEffect } from 'react';

interface Member {
  name: string;
  role: string;
  email: string;
  telegramId: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
  initialData?: Member | null;
}

const EMPTY_MEMBER: Member = { name: '', role: '', email: '', telegramId: '' };

export default function AddMemberModal({ isOpen, onClose, onSave, initialData }: AddMemberModalProps) {
  const [form, setForm] = useState<Member>(EMPTY_MEMBER);
  const isEditing = !!initialData;

  useEffect(() => {
    setForm(initialData ?? EMPTY_MEMBER);
  }, [initialData, isOpen]);

  function handleChange(field: keyof Member, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl shadow-brand-dark/30 w-full max-w-md mx-4 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? 'Edit Member' : 'Add New Member'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Role</label>
            <input
              type="text"
              required
              value={form.role}
              onChange={e => handleChange('role', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Telegram ID</label>
            <input
              type="text"
              required
              value={form.telegramId}
              onChange={e => handleChange('telegramId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-brand hover:bg-brand-dark text-white py-3 rounded-full font-medium transition-colors"
            >
              {isEditing ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
