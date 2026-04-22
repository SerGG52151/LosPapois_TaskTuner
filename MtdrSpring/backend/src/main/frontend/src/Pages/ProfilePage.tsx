import React, { useState, useEffect } from 'react';
import { UserCircleIcon, EnvelopeIcon, ChatBubbleOvalLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { saveToStorage, getFromStorage, STORAGE_KEYS } from '../Utils/storage';

interface ProfileData {
  name: string;
  role: string;
  email: string;
  telegramId: string;
}

interface PasswordData {
  current: string;
  newPass: string;
  confirm: string;
}

const EMPTY_PASSWORD: PasswordData = { current: '', newPass: '', confirm: '' };

const DEFAULT_PROFILE: ProfileData = {
  name: 'Tung Tung Sahur',
  role: 'Gestor de Proyecto',
  email: 'triple@t.com',
  telegramId: '@manager',
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(() => {
    // Initialize with stored profile or default
    const stored = getFromStorage<ProfileData>(STORAGE_KEYS.PROFILE);
    return stored || DEFAULT_PROFILE;
  });
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [passwords, setPasswords] = useState<PasswordData>(EMPTY_PASSWORD);

  // Persist profile whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROFILE, profile);
  }, [profile]);

  function handleEdit() {
    setDraft(profile);
    setPasswords(EMPTY_PASSWORD);
    setIsEditing(true);
  }

  function handleCancel() {
    setDraft(profile);
    setPasswords(EMPTY_PASSWORD);
    setIsEditing(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setProfile(draft);
    setPasswords(EMPTY_PASSWORD);
    setIsEditing(false);
  }

  function handleChange(field: keyof ProfileData, value: string) {
    setDraft(prev => ({ ...prev, [field]: value }));
  }

  function handlePasswordChange(field: keyof PasswordData, value: string) {
    setPasswords(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-brand-dark px-8 py-10 flex items-center gap-6">
          <div className="bg-white rounded-full p-3">
            <UserCircleIcon className="h-16 w-16 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-brand-lighter text-sm mt-1">{profile.role}</p>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Información del Perfil</h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-5 py-2 border-2 border-brand text-brand rounded-full font-medium hover:bg-brand-lighter transition-colors"
              >
                Editar Perfil
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={draft.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <input
                  type="text"
                  required
                  value={draft.role}
                  onChange={e => handleChange('role', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={draft.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telegram ID</label>
                <input
                  type="text"
                  required
                  value={draft.telegramId}
                  onChange={e => handleChange('telegramId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="text-lg text-gray-900 font-medium">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rol</p>
                <p className="text-lg text-gray-900 font-medium">{profile.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg text-gray-900 font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChatBubbleOvalLeftIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Telegram</p>
                  <p className="text-lg text-gray-900 font-medium">{profile.telegramId}</p>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <LockClosedIcon className="h-5 w-5" />
                Cambiar Contraseña
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={e => handlePasswordChange('current', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={passwords.newPass}
                    onChange={e => handlePasswordChange('newPass', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={e => handlePasswordChange('confirm', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    autoComplete="new-password"
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
