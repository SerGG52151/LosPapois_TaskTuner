import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

/**
 * Header button that navigates back to the post-login landing page (/home).
 * Sits next to the SidebarToggle so it's reachable from any project view.
 */
function HomeButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/home')}
      aria-label="Go to Home"
      title="Home"
      // Mirrors SidebarToggle: gray icon at rest, brand-tinted on hover.
      className="inline-flex items-center justify-center rounded-md p-2
                 text-gray-500 hover:bg-brand-lighter hover:text-brand-dark
                 transition-colors focus:outline-2 focus:outline-brand-dark"
    >
      <HomeIcon className="size-6" aria-hidden="true" />
    </button>
  );
}

export default React.memo(HomeButton);
