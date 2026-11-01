import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
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
  ListItemButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FitnessCenter as FaDumbbell,
  Menu as MenuIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
import EditProfileModal from '../profile/EditProfileModal';
import { useGetProfileQuery } from '../../services/api';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: userDetails = {}, isLoading: userDetailsLoading } = useGetProfileQuery(user, {
    skip: !user,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleEditProfileClick = () => {
    setEditProfileOpen(true);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 'min(88vw, 340px)', p: 2, pt: 'max(16px, env(safe-area-inset-top))' }}>
      <Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>
        ACCOUNT
      </Typography>
      <List disablePadding sx={{ mt: 0.5 }}>
        <ListItem disablePadding sx={{ px: 1.5, py: 1.25, gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 700,
            }}
          >
            {userDetails.username?.charAt(0)?.toUpperCase() || 'A'}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={650} noWrap>
              {userDetails.username || 'Your profile'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {userDetails.email}
            </Typography>
          </Box>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleEditProfileClick} sx={{ minHeight: 46, borderRadius: 2 }}>
            <Typography variant="body2">Edit profile</Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onToggleTheme} sx={{ minHeight: 46, borderRadius: 2, gap: 1.5 }}>
            {themeMode === 'dark' ? (
              <LightModeIcon color="primary" />
            ) : (
              <DarkModeIcon color="primary" />
            )}
            <Typography variant="body2">
              Use {themeMode === 'dark' ? 'light' : 'dark'} appearance
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            sx={{ minHeight: 46, borderRadius: 2, color: 'error.main' }}
          >
            <Typography variant="body2">Sign out</Typography>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderRadius: 0 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, xl: 4 } }}>
          <Toolbar
            disableGutters
            sx={{ justifyContent: 'space-between', minHeight: { xs: 64, sm: 68 } }}
          >
            {/* Logo */}
            <Box
              component={RouterLink}
              to="dashboard"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                letterSpacing: '-0.04em',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
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
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                {notifications.length > 0 && (
                  <NotificationDropdown
                    notifications={notifications}
                    toggleNotificationReadStatus={toggleNotificationReadStatus}
                  />
                )}
                <UserDropdown
                  handleLogout={handleLogout}
                  onEditProfileClick={handleEditProfileClick}
                  username={userDetails.username}
                  email={userDetails.email}
                />
              </Box>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileOpen}
                aria-controls="account-navigation-drawer"
                onClick={handleDrawerToggle}
                sx={{
                  width: 44,
                  height: 44,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2.5,
                }}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          id="account-navigation-drawer"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
              borderLeft: '1px solid',
              borderColor: 'divider',
              borderRadius: '20px 0 0 20px',
              maxWidth: '100vw',
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
