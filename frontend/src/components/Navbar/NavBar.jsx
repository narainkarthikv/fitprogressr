import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FitnessCenter as FaDumbbell,
  Menu as MenuIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
import EditProfileModal from '../profile/EditProfileModal';
import { API_BASE_URL, getAccessToken } from '../../utils/api';

const NavBar = ({
  user,
  handleLogout,
  notifications = [],
  toggleNotificationReadStatus = () => {},
  themeMode,
  onToggleTheme,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ username: '', email: '' });
  const [userDetailsLoading, setUserDetailsLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const backendURL = API_BASE_URL;

  useEffect(() => {
    let isCurrent = true;

    const fetchUserDetails = async () => {
      try {
        const accessToken = getAccessToken();
        const response = await axios.get(`${backendURL}/api/user/${user}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (isCurrent) {
          setUserDetails({
            username: response.data.username,
            email: response.data.email,
          });
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
      } finally {
        if (isCurrent) setUserDetailsLoading(false);
      }
    };

    if (user) {
      setUserDetailsLoading(true);
      fetchUserDetails();
    } else {
      setUserDetailsLoading(false);
    }

    return () => {
      isCurrent = false;
    };
  }, [user, backendURL]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleEditProfileClick = () => {
    setEditProfileOpen(true);
    setMobileOpen(false);
  };

  const handleProfileUpdated = (updatedData) => {
    setUserDetails((prev) => ({
      ...prev,
      username: updatedData.username,
      email: updatedData.email,
    }));
  };

  const drawer = (
    <Box sx={{ width: 250, p: 2 }}>
      <List>
        <ListItem>
          <Tooltip title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              aria-label={themeMode === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
              onClick={onToggleTheme}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.light',
                  outlineOffset: 2,
                },
              }}
            >
              {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </ListItem>
        <ListItem>
          <NotificationDropdown
            notifications={notifications}
            toggleNotificationReadStatus={toggleNotificationReadStatus}
          />
        </ListItem>
        <ListItem>
          <UserDropdown
            handleLogout={handleLogout}
            onEditProfileClick={handleEditProfileClick}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderRadius: 0 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3, xl: 4 } }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 72 }}>
            {/* Logo */}
            <Box
              component={RouterLink}
              to="dashboard"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                fontSize: '1.125rem',
                letterSpacing: '-0.04em',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 2.5,
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <FaDumbbell sx={{ fontSize: '1.15rem' }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                FitProgressr
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Tooltip
                  title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <IconButton
                    aria-label={
                      themeMode === 'dark' ? 'switch to light mode' : 'switch to dark mode'
                    }
                    onClick={onToggleTheme}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.light',
                        outlineOffset: 2,
                      },
                    }}
                  >
                    {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
                <NotificationDropdown
                  notifications={notifications}
                  toggleNotificationReadStatus={toggleNotificationReadStatus}
                />
                <UserDropdown
                  handleLogout={handleLogout}
                  onEditProfileClick={handleEditProfileClick}
                />
              </Box>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="toggle navigation"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        userId={user}
        currentUsername={userDetails.username}
        currentEmail={userDetails.email}
        profileLoading={userDetailsLoading}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
};

NavBar.propTypes = {
  user: PropTypes.string.isRequired,
  userDetails: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
  handleLogout: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      message: PropTypes.string,
      read: PropTypes.bool,
    })
  ),
  toggleNotificationReadStatus: PropTypes.func,
  themeMode: PropTypes.oneOf(['light', 'dark']).isRequired,
  onToggleTheme: PropTypes.func.isRequired,
};

export default NavBar;
