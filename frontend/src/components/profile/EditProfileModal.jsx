import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Person as FaUser,
  Email as FaEnvelope,
  Lock as FaLock,
  Visibility as FaEye,
  VisibilityOff as FaEyeSlash,
  ExpandMore,
  LockReset,
  Save,
} from '@mui/icons-material';
import Snackbar from '../common/Snackbar';
import ModalShell from '../common/ModalShell';
import { validateStrongPassword, validateUsername } from '../../utils/validation';
import { useUpdateProfileMutation } from '../../services/api';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [updateProfile, { isLoading: isSubmitting }] = useUpdateProfileMutation();
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

    // If changing password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return;
      }

      if (!validateStrongPassword(formData.newPassword)) {
        setError(
          'New password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
        );
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    try {
      const updateData = {
        username: formData.username,
      };

      // Include password fields only if changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await updateProfile({ userId, body: updateData }).unwrap();

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
        onProfileUpdated({ ...updateData, email: currentEmail });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Update error:', error);
      setError(
        error.data?.error ||
          error.data?.message ||
          error.error ||
          error.message ||
          'Failed to update profile. Please try again.'
      );
      setSnackbar({
        show: true,
        message: 'Failed to update profile!',
        type: 'failure',
      });
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
    setPasswordOpen(false);
    onClose();
  };

  return (
    <>
      <ModalShell
        open={open}
        onClose={handleClose}
        busy={isSubmitting}
        fullScreen={isMobile}
        maxWidth="md"
        closeLabel="Close profile settings"
        title="Profile settings"
        subtitle="Manage your account details and password"
        leading={
          profileLoading ? (
            <Skeleton animation="wave" variant="circular" width={48} height={48} />
          ) : (
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                fontWeight: 800,
                boxShadow: '0 0 0 5px rgba(109,140,255,.12)',
              }}
            >
              {currentUsername?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          )
        }
        actions={
          <>
            <Button
              onClick={handleClose}
              disabled={isSubmitting || profileLoading}
              sx={{ minHeight: 44, borderRadius: '11px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="profile-edit-form"
              variant="contained"
              startIcon={<Save />}
              disabled={isSubmitting || profileLoading}
              sx={{
                minHeight: 44,
                px: 2.5,
                borderRadius: '11px',
                fontWeight: 750,
                boxShadow: '0 8px 20px rgba(76,112,240,.2)',
              }}
            >
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" id="profile-edit-form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={750}
                letterSpacing=".1em"
                sx={{ display: 'block', mb: 1.25 }}
              >
                ACCOUNT DETAILS
              </Typography>
              {profileLoading ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' },
                    gap: 1.5,
                  }}
                >
                  <Skeleton animation="wave" variant="rounded" height={56} />
                  <Skeleton animation="wave" variant="rounded" height={56} />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' },
                    gap: 1.5,
                  }}
                >
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
                  <TextField
                    fullWidth
                    type="email"
                    label="Email address"
                    name="email"
                    value={formData.email}
                    helperText="Email is managed by your account and can’t be changed here."
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaEnvelope sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <FaLock sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              )}
            </Box>
            <Accordion
              expanded={passwordOpen}
              onChange={(_, expanded) => setPasswordOpen(expanded)}
              disableGutters
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '13px !important',
                bgcolor: 'rgba(255,255,255,.018)',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { mt: '24px !important', mb: '0 !important' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ px: 1.75, minHeight: 62, '& .MuiAccordionSummary-content': { my: 1.25 } }}
              >
                <Stack direction="row" alignItems="center" gap={1.25}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.main',
                      bgcolor: 'rgba(109,140,255,.12)',
                      borderRadius: '10px',
                    }}
                  >
                    <LockReset fontSize="small" />
                  </Box>
                  <Box>
                    <Typography fontWeight={700}>Change password</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Optional · requires your current password
                    </Typography>
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1.75, pt: 0, pb: 2 }}>
                <Stack spacing={2}>
                  {[
                    [
                      'currentPassword',
                      'Current password',
                      showCurrentPassword,
                      setShowCurrentPassword,
                    ],
                    ['newPassword', 'New password', showNewPassword, setShowNewPassword],
                    [
                      'confirmPassword',
                      'Confirm new password',
                      showConfirmPassword,
                      setShowConfirmPassword,
                    ],
                  ].map(([name, label, visible, setVisible]) => (
                    <TextField
                      key={name}
                      fullWidth
                      type={visible ? 'text' : 'password'}
                      label={label}
                      name={name}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      value={formData[name]}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaLock sx={{ color: 'text.secondary', fontSize: 19 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
                              onClick={() => setVisible(!visible)}
                              edge="end"
                              size="small"
                            >
                              {visible ? <FaEyeSlash /> : <FaEye />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  ))}
                  <Typography variant="caption" color="text.secondary">
                    Use at least 8 characters with uppercase, lowercase, number, and special
                    character.
                  </Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>
      </ModalShell>

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
