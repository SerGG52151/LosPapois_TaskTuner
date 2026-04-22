interface StorageOptions {
  key: string;
  version?: number; 
}

export function saveToStorage<T>(key: string, data: T): boolean {
  try {
    const serialized = JSON.stringify({
      data,
      timestamp: Date.now(),
      version: 1,
    });
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`Failed to save to storage (${key}):`, error);
    return false;
  }
}

export function getFromStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue ?? null;

    const parsed = JSON.parse(item);
    return parsed.data ?? defaultValue ?? null;
  } catch (error) {
    console.warn(`Failed to retrieve from storage (${key}):`, error);
    return defaultValue ?? null;
  }
}

export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove from storage (${key}):`, error);
    return false;
  }
}

export function getStorageMetadata(key: string) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    return {
      timestamp: parsed.timestamp,
      version: parsed.version,
      age: Date.now() - parsed.timestamp, // in milliseconds
    };
  } catch (error) {
    console.warn(`Failed to get storage metadata (${key}):`, error);
    return null;
  }
}

export function clearStorageByPattern(pattern: RegExp): boolean {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && pattern.test(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.warn(`Failed to clear storage by pattern:`, error);
    return false;
  }
}

export const STORAGE_KEYS = {
  USER: 'task_tuner_user',
  TASKS: 'task_tuner_tasks',
  TEAM_MEMBERS: 'task_tuner_team_members',
  PROFILE: 'task_tuner_profile',
  PROJECTS: 'task_tuner_projects',
  CURRENT_PROJECT: 'task_tuner_current_project',
  SPRINTS: 'task_tuner_sprints',
  CURRENT_SPRINT: 'task_tuner_current_sprint',
  AUTH_TOKEN: 'task_tuner_auth_token',
} as const;
