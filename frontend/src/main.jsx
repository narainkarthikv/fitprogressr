import { createElement, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AppRoot } from './AppRoot';
import { initializeAxiosAuthInterceptor } from './utils/axiosAuthInterceptor';

initializeAxiosAuthInterceptor();

const root = ReactDOM.createRoot(document.getElementById('root'));
if (!import.meta.env.VITE_API_URL && !import.meta.env.DEV) {
  root.render(createElement('p', { role: 'alert' }, 'The app is not configured: set VITE_API_URL to the backend URL.'));
} else {
  root.render(createElement(StrictMode, null, createElement(AppRoot)));
}
