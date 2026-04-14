import React, { useState } from 'react';
import { UserCircleIcon, EnvelopeIcon, ChatBubbleOvalLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';

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

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'tum tum sahur',
    role: 'Gestor de Proyecto',
    email: 'tripe@t.com',
    telegramId: '@manager',
  });
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [passwords, setPasswords] = useState<PasswordData>(EMPTY_PASSWORD);

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
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-8 py-10 flex items-center gap-6">
          <div className="bg-white rounded-full p-3">
            <UserCircleIcon className="h-16 w-16 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-red-100 text-sm mt-1">{profile.role}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Información del Perfil</h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-5 py-2 border-2 border-red-500 text-red-500 rounded-full font-medium hover:bg-red-50 transition-colors"
              >
                Editar Perfil
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Nombre Completo</label>
              <div className="flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                <UserCircleIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={draft.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-gray-700"
                  />
                ) : (
                  <span className="text-gray-700">{profile.name}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Correo Electrónico</label>
              <div className="flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                {isEditing ? (
                  <input
                    type="email"
                    value={draft.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-gray-700"
                  />
                ) : (
                  <span className="text-gray-700">{profile.email}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">ID de Telegram</label>
              <div className="flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                <ChatBubbleOvalLeftIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={draft.telegramId}
                    onChange={e => handleChange('telegramId', e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-gray-700"
                  />
                ) : (
                  <span className="text-gray-700">{profile.telegramId}</span>
                )}
              </div>
            </div>

            {isEditing && (
              <>
                <div className="border-t border-gray-200 pt-5 mt-5">
                  <h2 className="text-xl font-semibold text-gray-800 mb-5">Cambiar Contraseña</h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Contraseña Actual</label>
                      <div className="flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                        <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                        <input
                          type="password"
                          value={passwords.current}
                          onChange={e => handlePasswordChange('current', e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Nueva Contraseña</label>
                      <div className="flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                        <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                        <input
                          type="password"
                          value={passwords.newPass}
                          onChange={e => handlePasswordChange('newPass', e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Confirmar Nueva Contraseña</label>
                      <div className="flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                        <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                        <input
                          type="password"
                          value={passwords.confirm}
                          onChange={e => handlePasswordChange('confirm', e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <LockClosedIcon className="h-5 w-5" />
                    Guardar Cambios
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
