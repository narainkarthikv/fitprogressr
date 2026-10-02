import { Component, lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import NavBar from './components/Navbar/NavBar';
import {
  USER_ID_KEY,
  clearAuthStorage,
  getAccessToken,
} from './utils/api';

const Home = lazy(() => import('./pages/Home'));
const DashBoard = lazy(() => import('./pages/Dashboard'));

class RouteErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <Box role="alert" sx={{ p: 4, textAlign: 'center' }}>This page hit a problem. Refresh to try again.</Box>;
    }
    return this.props.children;
  }
}

RouteErrorBoundary.propTypes = { children: PropTypes.node.isRequired };

// Private Route wrapper component
const PrivateRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

PrivateRoute.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

const App = ({ themeMode, onToggleTheme }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState('');
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const accessToken = getAccessToken();
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    if (accessToken && storedUserId) {
      setIsLoggedIn(true);
      setUserID(storedUserId);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserID('');
    clearAuthStorage();
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const logoutListener = () => {
      handleLogout();
    };

    window.addEventListener('auth:logout', logoutListener);
    return () => {
      window.removeEventListener('auth:logout', logoutListener);
    };
  }, [handleLogout]);

  const handleAuthSuccess = (userId) => {
    setIsLoggedIn(true);
    setUserID(userId);
    localStorage.setItem(USER_ID_KEY, userId);
    navigate('/dashboard');
  };

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <RouteErrorBoundary>
        <>
          {/* Only render NavBar if user is logged in */}
          {isLoggedIn && (
            <NavBar
              user={userID}
              handleLogout={handleLogout}
              userDetails={{ userId: userID }}
              themeMode={themeMode}
              onToggleTheme={onToggleTheme}
            />
          )}

          <Suspense fallback={<Box role="status" sx={{ p: 4, textAlign: 'center' }}>Loading…</Box>}>
            <Routes>
              {/* Landing Page - Public route */}
              <Route
                path="/"
                element={
                  !isLoggedIn ? (
                    <DashBoard isLoggedIn={false} onAuthSuccess={handleAuthSuccess} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              {/* Dashboard - Private route */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute isLoggedIn={isLoggedIn}>
                    <Home user={userID} />
                  </PrivateRoute>
                }
              />

              {/* Redirect all undefined routes */}
              <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/'} replace />} />
            </Routes>
          </Suspense>
        </>
      </RouteErrorBoundary>
    </Box>
  );
};

App.propTypes = {
  themeMode: PropTypes.oneOf(['light', 'dark']).isRequired,
  onToggleTheme: PropTypes.func.isRequired,
};

const WrappedApp = ({ themeMode, onToggleTheme }) => (
  <BrowserRouter>
    <App themeMode={themeMode} onToggleTheme={onToggleTheme} />
  </BrowserRouter>
);

WrappedApp.propTypes = {
  themeMode: PropTypes.oneOf(['light', 'dark']).isRequired,
  onToggleTheme: PropTypes.func.isRequired,
};

export default WrappedApp;
