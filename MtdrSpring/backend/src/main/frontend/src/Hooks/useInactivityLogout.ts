import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFromStorage, removeFromStorage, STORAGE_KEYS } from '../Utils/storage';

const INACTIVITY_TIMEOUT = 45 * 60 * 1000;
const ACTIVITY_CHANNEL = 'task_tuner_activity';
const LAST_ACTIVITY_KEY = 'task_tuner_last_activity';
const LAST_TAB_VISIBLE_KEY = 'task_tuner_last_tab_visible';

interface UseInactivityLogoutReturn {
  isInactive: boolean;
}

/**
 * Hook that monitors user inactivity and logs out automatically after 45 minutes.
 * Uses BroadcastChannel to sync activity across multiple tabs/windows.
 * Also uses Page Visibility API to detect when user switches to other applications.
 * Only logs out if user is completely inactive (no activity in TaskTuner AND tab is hidden) for 45 minutes.
 */
export default function useInactivityLogout(): UseInactivityLogoutReturn {
  const navigate = useNavigate();
  const inactivityTimerRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isInactiveRef = useRef<boolean>(false);

  useEffect(() => {
    // Check if user is logged in
    const token = getFromStorage<string>(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      return;
    }

    // Initialize BroadcastChannel for cross-tab communication
    try {
      broadcastChannelRef.current = new BroadcastChannel(ACTIVITY_CHANNEL);
    } catch (e) {
      console.warn('BroadcastChannel not supported, inactivity detection will be per-tab only', e);
    }

    // Initialize last activity timestamp
    const updateLastActivity = () => {
      const now = Date.now();
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      
      // If tab is visible, update visibility timestamp too
      if (document.visibilityState === 'visible') {
        localStorage.setItem(LAST_TAB_VISIBLE_KEY, now.toString());
      }
      
      // Broadcast activity to other tabs
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'ACTIVITY', timestamp: now });
      }

      // Reset inactivity timer
      isInactiveRef.current = false;
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Set new inactivity check
      inactivityTimerRef.current = setTimeout(() => {
        checkInactivity();
      }, INACTIVITY_TIMEOUT);
    };

    const checkInactivity = () => {
      const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      const lastTabVisibleStr = localStorage.getItem(LAST_TAB_VISIBLE_KEY);
      
      if (!lastActivityStr) return;

      const lastActivity = parseInt(lastActivityStr, 10);
      const lastTabVisible = lastTabVisibleStr ? parseInt(lastTabVisibleStr, 10) : lastActivity;
      const now = Date.now();
      
      const timeSinceLastActivity = now - lastActivity;
      const timeSinceTabWasVisible = now - lastTabVisible;
      const isTabCurrentlyVisible = document.visibilityState === 'visible';

      console.log('[Inactivity Check]', {
        timeSinceLastActivity: `${timeSinceLastActivity}ms`,
        timeSinceTabWasVisible: `${timeSinceTabWasVisible}ms`,
        isTabCurrentlyVisible,
        threshold: `${INACTIVITY_TIMEOUT}ms`
      });

      // Only logout if BOTH conditions are true:
      // 1. No activity in TaskTuner for 30 minutes AND
      // 2. Tab has been hidden (or never visible) for 30 minutes
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT && timeSinceTabWasVisible > INACTIVITY_TIMEOUT) {
        isInactiveRef.current = true;
        performLogout();
      } else {
        // Schedule next check
        const timeUntilTimeout = INACTIVITY_TIMEOUT - Math.max(timeSinceLastActivity, timeSinceTabWasVisible);
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        inactivityTimerRef.current = setTimeout(checkInactivity, timeUntilTimeout);
      }
    };

    const performLogout = () => {
      // Clear auth data
      removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
      removeFromStorage(STORAGE_KEYS.USER);
      
      // Close BroadcastChannel
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }

      // Redirect to login
      navigate('/login', { replace: true });
      
      console.log('Session expired due to inactivity');
    };

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible - update the visible timestamp
        const now = Date.now();
        localStorage.setItem(LAST_TAB_VISIBLE_KEY, now.toString());
        console.log('[Visibility] Tab is now visible');
      } else {
        // Tab became hidden
        console.log('[Visibility] Tab is now hidden');
      }
    };

    // Listen for activity from other tabs via BroadcastChannel
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data.type === 'ACTIVITY') {
          const remoteActivity = event.data.timestamp;
          const lastLocalActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
          
          if (lastLocalActivity) {
            const lastLocal = parseInt(lastLocalActivity, 10);
            // Update to the most recent activity across all tabs
            if (remoteActivity > lastLocal) {
              localStorage.setItem(LAST_ACTIVITY_KEY, remoteActivity.toString());
            }
          } else {
            localStorage.setItem(LAST_ACTIVITY_KEY, remoteActivity.toString());
          }
        }
      };
    }

    // User activity events (within TaskTuner window only)
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    // Listen to visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial activity timestamp and visibility
    updateLastActivity();
    if (document.visibilityState === 'visible') {
      localStorage.setItem(LAST_TAB_VISIBLE_KEY, Date.now().toString());
    }

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [navigate]);

  return { isInactive: isInactiveRef.current };
}
