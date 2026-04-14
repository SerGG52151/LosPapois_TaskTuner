import React, { useState } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import MemberCard from '../Components/MemberCard';
import AddMemberModal from '../Components/AddMemberModal';

interface Member {
  id: number;
  name: string;
  role: string;
  email: string;
  telegramId: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: 1, name: 'rolandito', role: 'xkqw', email: 'rld@zv.com', telegramId: '@bnxq' },
];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  function handleAdd(data: Omit<Member, 'id'>) {
    const newMember: Member = { ...data, id: Date.now() };
    setMembers(prev => [...prev, newMember]);
  }

  function handleEdit(member: Member) {
    setEditingMember(member);
    setIsModalOpen(true);
  }

  function handleSave(data: Omit<Member, 'id'>) {
    if (editingMember) {
      setMembers(prev =>
        prev.map(m => m.id === editingMember.id ? { ...data, id: m.id } : m)
      );
      setEditingMember(null);
    } else {
      handleAdd(data);
    }
  }

  function handleDelete(id: number) {
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  function openAddModal() {
    setEditingMember(null);
    setIsModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Equipo</h1>
            <p className="text-sm text-gray-500 mt-1">miembros de tu equipo</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <UserGroupIcon className="h-5 w-5" />
            Agregar Miembro
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map(member => (
            <MemberCard
              key={member.id}
              name={member.name}
              role={member.role}
              email={member.email}
              telegramId={member.telegramId}
              onEdit={() => handleEdit(member)}
              onDelete={() => handleDelete(member.id)}
            />
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <UserGroupIcon className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">No hay miembros en el equipo</p>
          </div>
        )}
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMember(null); }}
        onSave={handleSave}
        initialData={editingMember}
      />
    </div>
  );
}
