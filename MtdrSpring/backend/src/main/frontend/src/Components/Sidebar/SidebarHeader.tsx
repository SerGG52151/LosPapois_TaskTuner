import React from 'react';

/**
 * Sidebar brand header: TaskTuner logo + name.
 * Pure presentational, no props — memoized to skip re-renders.
 */
function SidebarHeader() {
  return (
    // Solid brand-dark background turns the brand row into a proper "wordmark"
    // bar — anchors the sidebar visually and uses the deepest green of the
    // palette (#004D40). Logo + text switch to white for AA contrast.
    // h-16 matches the main header so the seam between the two is flush.
    <div className="flex items-center gap-2 px-4 h-16 bg-brand-dark">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7 text-white shrink-0"
        aria-hidden="true"
      >
        <line x1="12" y1="4" x2="12" y2="8" />
        <line x1="20" y1="4" x2="20" y2="8" />
        <rect x="6" y="8" width="20" height="17" rx="5" />
        <rect x="9.5" y="12" width="13" height="9" rx="3" />
        <circle cx="13" cy="16.5" r="1.2" fill="currentColor" />
        <circle cx="19" cy="16.5" r="1.2" fill="currentColor" />
        <rect x="2.5" y="14" width="3.5" height="6" rx="1.2" />
        <rect x="26" y="14" width="3.5" height="6" rx="1.2" />
      </svg>
      <span className="text-lg font-bold text-white tracking-tight">TaskTuner</span>
    </div>
  );
}

export default React.memo(SidebarHeader);
