import React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarTone = 'brand' | 'neutral';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
};

const TONE_CLASSES: Record<AvatarTone, string> = {
  brand: 'bg-brand text-white',
  neutral: 'bg-gray-300 text-gray-700',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export interface MemberAvatarProps {
  name: string;
  size?: AvatarSize;
  tone?: AvatarTone;
}

/**
 * Circular avatar with the member's initials. Used in the team list and
 * detail header. Tone allows mixing brand-colored avatars with neutral
 * fallbacks (matches the screenshot where one member shows in gray).
 */
function MemberAvatar({ name, size = 'md', tone = 'brand' }: MemberAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-full flex items-center justify-center font-semibold shrink-0
                  ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]}`}
    >
      {getInitials(name)}
    </div>
  );
}

export default React.memo(MemberAvatar);
