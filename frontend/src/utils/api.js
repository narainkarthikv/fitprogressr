export const ACCESS_TOKEN_KEY = 'accessToken';
const LEGACY_ACCESS_TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_ID_KEY = 'userId';
export const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/$/, '');

export const getAccessToken = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) return accessToken;
  const legacyToken = localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
  if (legacyToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, legacyToken);
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  }
  return legacyToken;
};

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAccessToken = (accessToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  }
};

export const setRefreshToken = (refreshToken) => {
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
};

export const getAuthConfig = () => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('User is not authenticated');
  }

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
};
