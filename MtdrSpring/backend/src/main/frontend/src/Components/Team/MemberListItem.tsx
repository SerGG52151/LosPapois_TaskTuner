import React from 'react';
import MemberAvatar, { AvatarTone } from './MemberAvatar';

export interface MemberListItemProps {
  name: string;
  role: string;
  selected: boolean;
  avatarTone?: AvatarTone;
  onSelect: () => void;
}

/**
 * Selectable member entry shown in the left column of the Team page.
 * Highlights with a brand-colored border + light brand background when
 * `selected` is true so the chosen member stays obvious as the user
 * scrolls the right-hand detail panel.
 */
function MemberListItem({
  name,
  role,
  selected,
  avatarTone,
  onSelect,
}: MemberListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left
        ${
          selected
            ? 'border-brand bg-brand-lighter'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
      <MemberAvatar name={name} size="md" tone={avatarTone} />
      <div className="min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{name}</div>
        <div className="text-xs text-gray-500 truncate">{role}</div>
      </div>
    </button>
  );
}

export default React.memo(MemberListItem);
