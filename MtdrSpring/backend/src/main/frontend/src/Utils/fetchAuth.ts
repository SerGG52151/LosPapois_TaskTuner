import { getFromStorage, STORAGE_KEYS } from './storage';

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  let [resource, config] = args;
  
  if (typeof resource === 'string' && resource.includes('/api/')) {
    const token = getFromStorage<string>(STORAGE_KEYS.AUTH_TOKEN);
    config = config || {};
    
    const headers = new Headers(config.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Explicitly let Spring backend know this is an API call, not browser
    headers.set('X-Requested-With', 'XMLHttpRequest');
    
    config.headers = headers;
  }
  
  return originalFetch(resource, config);
};
