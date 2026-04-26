import React, { useEffect, useRef, useState } from 'react';

export interface NewSprintData {
  name: string;
  /** ISO date string (yyyy-mm-dd) — comes straight from <input type="date">. */
  startDate: string;
  endDate: string;
}

export interface AddSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the form values when the user submits a valid form. */
  onCreate?: (data: NewSprintData) => void;
}

const EMPTY_FORM: NewSprintData = { name: '', startDate: '', endDate: '' };

/**
 * Modal for creating a new sprint.
 *
 * Visual-only for now — `onCreate` receives the validated payload but the
 * parent decides what to do with it (POST to backend, push to local cache,
 * etc.). The modal handles its own form state, focus, escape-to-close and
 * backdrop click.
 */
export default function AddSprintModal({
  isOpen,
  onClose,
  onCreate,
}: AddSprintModalProps) {
  const [form, setForm] = useState<NewSprintData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form whenever the modal opens, and pull focus to the name input.
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setError(null);
      // Defer focus to next tick so the input is mounted.
      const t = setTimeout(() => nameInputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Escape closes the modal — small UX win, no library needed.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (field: keyof NewSprintData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Light validation — just enough to avoid garbage payloads.
    if (!form.name.trim()) return setError('El nombre del sprint es requerido.');
    if (!form.startDate) return setError('La fecha de inicio es requerida.');
    if (!form.endDate) return setError('La fecha de fin es requerida.');
    if (form.endDate < form.startDate)
      return setError('La fecha de fin no puede ser anterior a la de inicio.');

    setError(null);
    onCreate?.({ ...form, name: form.name.trim() });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-sprint-title"
        // Stop bubbling so clicks inside the dialog don't close it.
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7"
      >
        <h2
          id="add-sprint-title"
          className="text-xl font-bold text-gray-900 mb-5"
        >
          Añadir Nuevo Sprint
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="sprint-name"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Nombre del Sprint
            </label>
            <input
              ref={nameInputRef}
              id="sprint-name"
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Ej: Sprint MVP Launch"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                         placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
                         transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="sprint-start"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Fecha de Inicio
            </label>
            <input
              id="sprint-start"
              type="date"
              value={form.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                         text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
                         transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="sprint-end"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Fecha de Fin
            </label>
            <input
              id="sprint-end"
              type="date"
              value={form.endDate}
              onChange={e => handleChange('endDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                         text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
                         transition-colors"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-800 py-3 rounded-xl
                         font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-brand hover:bg-brand-dark text-white py-3 rounded-xl
                         font-semibold shadow-sm transition-colors"
            >
              Crear Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
