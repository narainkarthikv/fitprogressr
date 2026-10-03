import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import {
  AccountCircle as PersonIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const UserDropdown = ({ handleLogout, onEditProfileClick }) => {
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
      <IconButton
        aria-label="Open account menu"
        onClick={handleClick}
        size="small"
        sx={{
          ml: 2,
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <PersonIcon sx={{ fontSize: '1.5rem' }} />
      </IconButton>
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
            borderRadius: 2,
            boxShadow: 6,
          },
        }}
      >
        <MenuItem
          onClick={handleEditProfile}
          sx={{
            py: 1.25,
            px: 1.5,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
          </ListItemIcon>
          Edit Profile
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={handleLogoutClick}
          sx={{
            py: 1.25,
            px: 1.5,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemIcon>
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
};

export default UserDropdown;
