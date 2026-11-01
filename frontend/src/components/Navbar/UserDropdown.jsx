import { useState } from 'react';
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { ExpandMore, Edit as EditIcon, Logout as LogoutIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const UserDropdown = ({ handleLogout, onEditProfileClick, username = '', email = '' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    handleClose();
    if (onEditProfileClick) {
      onEditProfileClick();
    }
  };

  const handleLogoutClick = () => {
    handleClose();
    handleLogout();
  };

  return (
    <>
      <Button
        aria-label={username ? `Account menu for ${username}` : 'Open account menu'}
        onClick={handleClick}
        size="medium"
        startIcon={
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '.82rem',
              fontWeight: 700,
            }}
          >
            {username?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
        }
        endIcon={<ExpandMore fontSize="small" />}
        sx={{
          minHeight: 44,
          px: 1,
          maxWidth: 230,
          color: 'text.primary',
          whiteSpace: 'nowrap',
          borderRadius: '11px',
          transition: 'background-color .18s ease, transform .18s ease',
          '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-1px)' },
        }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {username || 'Account'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '14px',
            boxShadow: '0 18px 48px rgba(0,0,0,.28)',
            minWidth: 264,
            maxWidth: 'calc(100vw - 24px)',
            p: 1,
            backgroundImage:
              'radial-gradient(ellipse at 100% 0%, rgba(102,132,255,.09), transparent 48%)',
          },
        }}
      >
        {(username || email) && (
          <Stack
            direction="row"
            alignItems="center"
            gap={1.25}
            sx={{ px: 1.25, py: 1.5, mb: 0.75, borderRadius: '10px', bgcolor: 'action.hover' }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 800,
              }}
            >
              {username?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={750} noWrap>
                {username || 'Your account'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', overflowWrap: 'anywhere' }}
              >
                {email}
              </Typography>
            </Box>
          </Stack>
        )}
        {(username || email) && <Divider sx={{ my: 0.5 }} />}
        <MenuItem
          onClick={handleEditProfile}
          sx={{
            minHeight: 46,
            px: 1.25,
            borderRadius: '9px',
            transition: 'transform .16s ease, color .16s ease',
            '&:hover': {
              backgroundColor: 'transparent',
              transform: 'translateX(3px)',
              color: 'primary.main',
            },
            '&:hover .account-menu-icon': { transform: 'scale(1.08)' },
          }}
        >
          <ListItemIcon
            className="account-menu-icon"
            sx={{ minWidth: 36, transition: 'transform .16s ease' }}
          >
            <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
          </ListItemIcon>
          Edit Profile
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={handleLogoutClick}
          sx={{
            minHeight: 46,
            px: 1.25,
            borderRadius: '9px',
            transition: 'transform .16s ease, color .16s ease',
            '&:hover': {
              backgroundColor: 'transparent',
              transform: 'translateX(3px)',
              color: 'error.main',
            },
            '&:hover .account-menu-icon': { transform: 'scale(1.08)' },
          }}
        >
          <ListItemIcon
            className="account-menu-icon"
            sx={{ minWidth: 36, transition: 'transform .16s ease' }}
          >
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

UserDropdown.propTypes = {
  handleLogout: PropTypes.func.isRequired,
  onEditProfileClick: PropTypes.func,
  username: PropTypes.string,
  email: PropTypes.string,
};

export default UserDropdown;
