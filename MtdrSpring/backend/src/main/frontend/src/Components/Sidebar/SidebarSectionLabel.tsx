import React from 'react';

export interface SidebarSectionLabelProps {
  children: React.ReactNode;
}

/**
 * Small uppercase label used to title sub-sections inside the sidebar
 * (e.g. "SPRINTS" header under an expanded project).
 */
function SidebarSectionLabel({ children }: SidebarSectionLabelProps) {
  return (
    <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {children}
    </p>
  );
}

export default React.memo(SidebarSectionLabel);
