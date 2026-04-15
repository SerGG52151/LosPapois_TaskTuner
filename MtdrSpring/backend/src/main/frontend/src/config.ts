const getApiBaseUrl = (): string => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';

  return `${protocol}//${hostname}${port}`;
};

export const API_BASE_URL = getApiBaseUrl();
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
  },
};

export default API_CONFIG;