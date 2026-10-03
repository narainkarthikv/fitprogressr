import axios from 'axios';
import {
  clearAuthStorage,
  API_BASE_URL,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './api';

const backendURL = API_BASE_URL;

let interceptorInitialized = false;
let isRefreshing = false;
let pendingRequestsQueue = [];

const isBackendRequest = (requestUrl = '') => {
  if (!requestUrl) {
    return false;
  }

  if (requestUrl.startsWith('http://') || requestUrl.startsWith('https://')) {
    return requestUrl.startsWith(backendURL);
  }

  return requestUrl.startsWith('/api/');
};

const flushQueue = (error, accessToken = null) => {
  pendingRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
      return;
    }

    promise.resolve(accessToken);
  });

  pendingRequestsQueue = [];
};

const notifySessionExpired = () => {
  clearAuthStorage();
  window.dispatchEvent(new Event('auth:logout'));
};

const logApiEvent = (event, config, status) => {
  if (!import.meta.env.DEV && import.meta.env.VITE_API_LOGGING !== 'true') return;
  const url = new URL(config.url || '', config.baseURL || backendURL || window.location.origin);
  console.info(JSON.stringify({
    source: 'fitprogressr-api',
    event,
    method: (config.method || 'get').toUpperCase(),
    path: url.pathname,
    ...(status ? { status } : {}),
    ...(config.metadata?.startedAt ? { durationMs: Date.now() - config.metadata.startedAt } : {}),
  }));
};

const requestNewAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token is missing');
  }

  const response = await axios.post(
    `${backendURL}/api/user/refresh-token`,
    { refreshToken },
    {
      skipAuthRefresh: true,
    }
  );

  const newAccessToken = response.data?.accessToken;
  const newRefreshToken = response.data?.refreshToken;

  if (!newAccessToken || !newRefreshToken) {
    throw new Error('Refresh response does not contain valid tokens');
  }

  setAccessToken(newAccessToken);
  setRefreshToken(newRefreshToken);

  return newAccessToken;
};

export const initializeAxiosAuthInterceptor = () => {
  if (interceptorInitialized) {
    return;
  }

  axios.interceptors.request.use(
    (config) => {
      if (!isBackendRequest(config.url)) {
        return config;
      }

      config.metadata = { ...config.metadata, startedAt: Date.now() };
      const accessToken = getAccessToken();

      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      logApiEvent('request', config);
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => {
      if (isBackendRequest(response.config?.url)) {
        logApiEvent('response', response.config, response.status);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config || {};
      const statusCode = error.response?.status;
      if (isBackendRequest(originalRequest.url)) {
        logApiEvent('response_error', originalRequest, statusCode || 0);
      }
      const isRefreshRequest =
        typeof originalRequest.url === 'string' &&
        originalRequest.url.includes('/api/user/refresh-token');

      const shouldHandleAuthError =
        isBackendRequest(originalRequest.url) &&
        [401, 403].includes(statusCode) &&
        !originalRequest._retry &&
        !originalRequest.skipAuthRefresh &&
        !isRefreshRequest;

      if (!shouldHandleAuthError) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequestsQueue.push({ resolve, reject });
        })
          .then((accessToken) => {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await requestNewAccessToken();
        flushQueue(null, newToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        notifySessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  interceptorInitialized = true;
};
