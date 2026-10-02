import { useEffect, useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Notifications as FaBell,
  MailOutline as FaEnvelope,
  Mail as FaEnvelopeOpen,
  Delete as FaTrashAlt,
  DoneAll as CheckAllIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const NotificationDropdown = ({ notifications = [], toggleNotificationReadStatus }) => {
  const defaultNotifications = [
    { id: 1, message: 'Welcome to FitProgressr!', read: false },
    {
      id: 2,
      message: 'Your profile is 80% complete. Complete it for full',
      read: false,
    },
  ];
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifs, setNotifs] = useState(
    notifications.length > 0 ? notifications : defaultNotifications
  );

  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (notifications.length > 0) {
      setNotifs(notifications);
    }
  }, [notifications]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleNotificationRead = (id) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
    if (toggleNotificationReadStatus) {
      toggleNotificationReadStatus(id);
    }
  };

  const markAllAsRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
    handleClose();
  };

  const deleteNotification = (id) => {
    setNotifs(notifs.filter((n) => n.id !== id));
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <>
      <IconButton
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        onClick={handleClick}
        size="small"
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }}
        aria-controls={open ? 'notification-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <FaBell sx={{ fontSize: '1.5rem' }} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        MenuListProps={{ disablePadding: true }}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            width: { xs: '92vw', sm: 360, md: 420 },
            maxWidth: { xs: '92vw', sm: 420 },
            maxHeight: { xs: 320, sm: 420 },
            boxShadow: 6,
            overflow: 'hidden',
            borderRadius: 2,
          },
        }}
      >
        <Box
          sx={{
            p: isMobile ? 1.5 : 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <IconButton
              size="small"
              onClick={markAllAsRead}
              aria-label="mark all notifications as read"
            >
              <CheckAllIcon fontSize="small" sx={{ color: 'primary.main' }} />
            </IconButton>
          )}
        </Box>
        <Divider />
        <Box
          sx={{
            maxHeight: { xs: 250, sm: 320 },
            overflowY: 'auto',
          }}
        >
          {notifs.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No notifications
              </Typography>
            </MenuItem>
          ) : (
            notifs.map((notification) => (
              <MenuItem
                key={notification.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  px: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-of-type': {
                    borderBottom: 0,
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    cursor: 'pointer',
                    fontWeight: notification.read ? 400 : 600,
                    color: notification.read ? 'text.secondary' : 'text.primary',
                  }}
                  onClick={() => toggleNotificationRead(notification.id)}
                >
                  {notification.message}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, color: 'text.secondary' }}>
                  {notification.read ? (
                    <FaEnvelopeOpen fontSize="small" />
                  ) : (
                    <FaEnvelope fontSize="small" />
                  )}
                  <IconButton
                    aria-label={`Delete notification: ${notification.message}`}
                    size="small"
                    onClick={() => deleteNotification(notification.id)}
                    sx={{
                      p: 0,
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <FaTrashAlt fontSize="small" />
                  </IconButton>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>
      </Menu>
    </>
  );
};

NotificationDropdown.propTypes = {
  notifications: PropTypes.array,
  toggleNotificationReadStatus: PropTypes.func,
};

export default NotificationDropdown;
