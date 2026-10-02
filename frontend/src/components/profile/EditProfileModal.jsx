import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  alpha,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Person as FaUser,
  Email as FaEnvelope,
  Lock as FaLock,
  Visibility as FaEye,
  VisibilityOff as FaEyeSlash,
  Close as CloseIcon,
} from '@mui/icons-material';
import Snackbar from '../common/Snackbar';
import { API_BASE_URL, getAccessToken } from '../../utils/api';
import { validateEmail, validateStrongPassword, validateUsername } from '../../utils/validation';

const EditProfileModal = ({
  open,
  onClose,
  userId,
  currentUsername,
  currentEmail,
  profileLoading = false,
  onProfileUpdated,
}) => {
  const theme = useTheme();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const backendURL = API_BASE_URL;

  // Initialize form with current user data
  useEffect(() => {
    if (open && currentUsername && currentEmail) {
      setFormData((prev) => ({
        ...prev,
        username: currentUsername,
        email: currentEmail,
      }));
    }
  }, [open, currentUsername, currentEmail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateUsername(formData.username)) {
      setError('Username must be 3 to 40 characters and cannot contain markup characters.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Enter a valid email address.');
      return;
    }

    // If changing password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return;
      }

      if (!validateStrongPassword(formData.newPassword)) {
        setError('New password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const accessToken = getAccessToken();

      const updateData = {
        username: formData.username,
        email: formData.email,
      };

      // Include password fields only if changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(`${backendURL}/api/user/${userId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update profile');
      }

      setSnackbar({
        show: true,
        message: 'Profile updated successfully!',
        type: 'success',
      });

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      // Notify parent component
      if (onProfileUpdated) {
        onProfileUpdated(updateData);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
      setSnackbar({
        show: true,
        message: 'Failed to update profile!',
        type: 'failure',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: currentUsername || '',
      email: currentEmail || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
          },
        }}
      >
        <IconButton
          aria-label="Close profile editor"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            zIndex: 1,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.primary, 0.08),
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ p: 4 }}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  mb: 2,
                }}
              >
                {profileLoading ? (
                  <Skeleton variant="circular" width={64} height={64} />
                ) : (
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: 'primary.main',
                      fontSize: '2rem',
                      fontWeight: 700,
                    }}
                  >
                    {currentUsername?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                )}
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Edit Profile
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                Update your account information
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {profileLoading ? (
                  <Stack spacing={3} aria-label="Loading profile details">
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                  </Stack>
                ) : (
                  <>
                {/* Username */}
                <Box>
                  <TextField
                    fullWidth
                    name="username"
                    label="Username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaUser sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Email */}
                <Box>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email address"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaEnvelope sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                  </>
                )}

                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', px: 2 }}>
                    Change Password (Optional)
                  </Typography>
                </Divider>

                {/* Current Password */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}
                  >
                    Current Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showCurrentPassword ? 'text' : 'password'}
                    label="Current password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaLock sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                            size="small"
                          >
                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* New Password */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}
                  >
                    New Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showNewPassword ? 'text' : 'password'}
                    label="New password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaLock sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                            size="small"
                          >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Confirm New Password */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}
                  >
                    Confirm New Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm new password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaLock sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  fullWidth
                  size="large"
                  disabled={isSubmitting || profileLoading}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isSubmitting || profileLoading}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        show={snackbar.show}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, show: false })}
      />
    </>
  );
};

EditProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  currentUsername: PropTypes.string,
  currentEmail: PropTypes.string,
  profileLoading: PropTypes.bool,
  onProfileUpdated: PropTypes.func,
};

export default EditProfileModal;
