import React from 'react';
import { EnvelopeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MemberCardProps {
  name: string;
  role: string;
  email: string;
  telegramId: string;
  onEdit: () => void;
  onDelete: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function MemberCard({ name, role, email, telegramId, onEdit, onDelete }: MemberCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-brand text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-sm">
          {getInitials(name)}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors">
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-400 transition-colors">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-500 mb-3">{role}</p>

      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <EnvelopeIcon className="h-4 w-4 text-gray-400 shrink-0" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{telegramId}</span>
        </div>
      </div>
    </div>
  );
}
