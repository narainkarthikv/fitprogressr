import { useState, useCallback, useMemo, useEffect } from 'react';
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
  Divider,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Person as FaUser,
  Email as FaEnvelope,
  Lock as FaLock,
  Visibility as FaEye,
  VisibilityOff as FaEyeSlash,
  Close as CloseIcon,
  EmojiEmotions,
  CheckCircleOutline,
  Cancel,
} from '@mui/icons-material';
import Lottie from 'react-lottie';
import loginAnimation from '../../assets/lottie/login-lottie.json';
import signupAnimation from '../../assets/lottie/signup-lottie.json';
import Snackbar from '../common/Snackbar';
import { API_BASE_URL, setAccessToken, setRefreshToken } from '../../utils/api';
import { validateEmail, validateUsername } from '../../utils/validation';

const passwordChecks = [
  {
    label: 'At least 8 characters',
    test: (password = '') => password.length >= 8,
    mandatory: true,
  },
  {
    label: 'Contains an uppercase letter',
    test: (password = '') => /[A-Z]/.test(password),
    mandatory: true,
  },
  {
    label: 'Contains a lowercase letter',
    test: (password = '') => /[a-z]/.test(password),
    mandatory: true,
  },
  {
    label: 'Contains a number',
    test: (password = '') => /\d/.test(password),
    mandatory: true,
  },
  {
    label: 'Contains a special character',
    test: (password = '') => /[^A-Za-z0-9]/.test(password),
    mandatory: true,
  },
  {
    label: '12+ characters (bonus security)',
    test: (password = '') => password.length >= 12,
    mandatory: false,
  },
];

const calculatePasswordStrength = (password = '') => {
  const checks = passwordChecks.map((check) => ({
    ...check,
    met: check.test(password),
  }));

  const mandatoryChecks = checks.filter((check) => check.mandatory);
  const mandatoryMet = mandatoryChecks.filter((check) => check.met).length;
  const bonusMet = checks.filter((check) => !check.mandatory && check.met).length;
  const percentage = (checks.filter((check) => check.met).length / checks.length) * 100;

  let level = 'weak';
  if (mandatoryMet >= 3 && mandatoryMet < mandatoryChecks.length) {
    level = 'medium';
  } else if (mandatoryMet === mandatoryChecks.length && bonusMet === 0) {
    level = 'strong';
  } else if (mandatoryMet === mandatoryChecks.length && bonusMet > 0) {
    level = 'very-strong';
  }

  return {
    level,
    percentage: password ? percentage : 0,
    checks,
    meetsBaseline: mandatoryMet === mandatoryChecks.length,
  };
};

const AuthModal = ({ open, onClose, initialMode = 'login', onAuthSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const lottieSize = isMobile ? 220 : 300;
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  // Login state
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: '',
  });

  // Signup state
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmpassword: '',
  });

  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("Let's Get Started!");

  const backendURL = API_BASE_URL;
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(signupForm.password),
    [signupForm.password]
  );

  const strengthStyles = {
    weak: {
      label: 'Weak',
      color: theme.palette.error.main,
    },
    medium: {
      label: 'Medium',
      color: theme.palette.warning.main,
    },
    strong: {
      label: 'Strong',
      color: theme.palette.info.main,
    },
    'very-strong': {
      label: 'Very Strong',
      color: theme.palette.success.main,
    },
  };

  const strengthMeta = strengthStyles[passwordStrength.level] || strengthStyles.weak;
  const passwordsMismatch =
    Boolean(signupForm.confirmpassword) && signupForm.password !== signupForm.confirmpassword;
  const canSubmitSignup =
    passwordStrength.meetsBaseline &&
    !passwordsMismatch &&
    validateUsername(signupForm.username) &&
    validateEmail(signupForm.email) &&
    signupForm.password &&
    signupForm.confirmpassword;
  const canSubmitLogin = loginCredentials.email && loginCredentials.password;

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [initialMode, open]);

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      setError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  };

  const handleLoginInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const handleSignupInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setSignupForm((prev) => ({ ...prev, [name]: value }));
      setError('');

      const filledFields = Object.values({ ...signupForm, [name]: value }).filter(
        (field) => field !== ''
      ).length;
      const newProgress = (filledFields / 4) * 100;
      setProgress(newProgress);
      updateProgressMessage(newProgress);
    },
    [signupForm]
  );

  const updateProgressMessage = (progress) => {
    if (progress === 0) setProgressMessage("Let's Get Started!");
    else if (progress <= 25) setProgressMessage('Warming Up!');
    else if (progress <= 50) setProgressMessage('Hitting Your Stride!');
    else if (progress <= 75) setProgressMessage('Almost There!');
    else setProgressMessage('Final Stretch!');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const loginResponse = await fetch(`${backendURL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginCredentials),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      const accessToken = data.accessToken;
      if (accessToken) {
        setAccessToken(accessToken);
      }

      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }

      const authenticatedUser = data.user;

      if (!authenticatedUser || !(authenticatedUser._id || authenticatedUser.id)) {
        throw new Error('Unable to retrieve user details');
      }

      setSnackbar({
        show: true,
        message: 'Welcome back! Redirecting...',
        type: 'success',
      });

      const userId = authenticatedUser._id || authenticatedUser.id;

      setTimeout(() => {
        onAuthSuccess(userId);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please try again.');
      setSnackbar({
        show: true,
        message: 'Login failed!',
        type: 'failure',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (signupForm.password !== signupForm.confirmpassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validateUsername(signupForm.username)) {
      setError('Username must be 3 to 40 characters and cannot contain markup characters.');
      return;
    }
    if (!validateEmail(signupForm.email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!passwordStrength.meetsBaseline) {
      const strengthError =
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
      setError(strengthError);
      setSnackbar({
        show: true,
        message: strengthError,
        type: 'failure',
      });
      return;
    }

    setIsSubmitting(true);

    const formData = { ...signupForm };
    delete formData.confirmpassword;

    try {
      const response = await fetch(`${backendURL}/api/user/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to sign up');
      }

      setSnackbar({
        show: true,
        message: 'Account created! Please sign in.',
        type: 'success',
      });

      setTimeout(() => {
        setMode('login');
        setSignupForm({
          username: '',
          email: '',
          password: '',
          confirmpassword: '',
        });
        setProgress(0);
        setProgressMessage("Let's Get Started!");
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to sign up. Please try again.');
      setSnackbar({
        show: true,
        message: 'Sign up failed!',
        type: 'failure',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: mode === 'login' ? loginAnimation : signupAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        BackdropProps={{
          sx: {
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(10px)',
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, md: 4 },
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
            maxHeight: '100vh',
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            borderRadius: { xs: 0, md: 4 },
            overflowX: 'hidden',
            overflowY: 'auto',
            maxHeight: { xs: '100vh', md: 'calc(100vh - 64px)' },
            backgroundColor: 'transparent',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1180,
              mx: 'auto',
              my: 0,
              borderRadius: { xs: 0, md: 4 },
              overflow: 'hidden',
              boxShadow: { xs: 'none', md: '0 24px 56px rgba(8, 14, 28, 0.42)' },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              backgroundColor: 'background.paper',
              backgroundClip: 'padding-box',
              minHeight: { xs: '100vh', md: 620 },
            }}
          >
            <Box
              sx={{
                flex: { xs: '0 0 38%', md: '0 0 45%' },
                background: `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.85)} 0%, ${alpha(
                  theme.palette.primary.dark,
                  0.9
                )} 60%, ${alpha(theme.palette.primary.light, 0.65)} 100%)`,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: { xs: 4, md: 5 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-20%',
                  right: '-10%',
                  width: 260,
                  height: 260,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha('#fff', 0.22)} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-30%',
                  left: '-15%',
                  width: 320,
                  height: 320,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha('#fff', 0.12)} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                },
              }}
            >
              <Stack spacing={2.5} sx={{ zIndex: 1 }}>
                <Chip
                  label="Athlete Workspace"
                  sx={{
                    alignSelf: 'flex-start',
                    fontWeight: 600,
                    backgroundColor: alpha('#fff', 0.2),
                    color: '#fff',
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {mode === 'login'
                    ? 'Sign in and pick up exactly where you left off'
                    : 'Create an account and start building consistent momentum'}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: alpha('#fff', 0.85),
                    maxWidth: 360,
                  }}
                >
                  Personalized insights, streak tracking, and smart nudges keep you honest with your
                  goals.
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    'Progress dashboards updated in real time',
                    'Workout logging that takes seconds',
                    'Secure, private and synced across devices',
                  ].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutline sx={{ fontSize: 18, color: '#fff' }} />
                      <Typography
                        variant="body2"
                        sx={{ color: alpha('#fff', 0.9), fontWeight: 500 }}
                      >
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
              <Box sx={{ mt: 4, alignSelf: 'center', width: lottieSize, height: lottieSize }}>
                <Lottie options={lottieOptions} height={lottieSize} width={lottieSize} />
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                position: 'relative',
                backgroundColor: 'background.paper',
                display: 'flex',
              }}
            >
              <IconButton
                aria-label="Close authentication dialog"
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  right: { xs: 16, md: 20 },
                  top: { xs: 16, md: 20 },
                  zIndex: 2,
                  color: 'text.secondary',
                  backgroundColor: alpha(theme.palette.text.primary, 0.04),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.12),
                  },
                }}
              >
                <CloseIcon />
              </IconButton>

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: { xs: 3, md: 5 },
                  pt: { xs: 7, md: 6 },
                }}
              >
                <Stack spacing={1} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {mode === 'login' ? 'Welcome back' : 'Create your FitProgressr account'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {mode === 'login'
                      ? 'Securely access your streaks, routines, and saved workouts.'
                      : 'A few quick details and you are ready to track every rep.'}
                  </Typography>
                </Stack>

                <Tabs
                  value={mode}
                  onChange={handleModeChange}
                  sx={{
                    alignSelf: 'flex-start',
                    '& .MuiTab-root': {
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      minWidth: 120,
                    },
                  }}
                >
                  <Tab label="Sign In" value="login" />
                  <Tab label="Sign Up" value="signup" />
                </Tabs>

                <Divider sx={{ my: 2 }} />

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ flex: 1, overflowY: 'auto', pr: { md: 1 } }}>
                  {mode === 'login' ? (
                    <Box
                      component="form"
                      onSubmit={handleLogin}
                      sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                    >
                      <Stack spacing={2.5} sx={{ flex: 1 }}>
                        <Box>
                          <TextField
                            fullWidth
                            type="email"
                            label="Email address"
                            name="email"
                            placeholder="Enter your email"
                            value={loginCredentials.email}
                            onChange={handleLoginInputChange}
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

                        <Box>
                          <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            name="password"
                            placeholder="Enter your password"
                            value={loginCredentials.password}
                            onChange={handleLoginInputChange}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FaLock sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    size="small"
                                  >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <EmojiEmotions sx={{ color: 'primary.main', mr: 1, fontSize: 24 }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Feeling 💪 today?
                          </Typography>
                        </Box>
                      </Stack>

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting || !canSubmitLogin}
                        sx={{
                          mt: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                        }}
                      >
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      component="form"
                      onSubmit={handleSignup}
                      sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                    >
                      <Stack spacing={2.5} sx={{ flex: 1 }}>
                        {progress > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {progressMessage}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {Math.round(progress)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                              }}
                            />
                          </Box>
                        )}

                        <Box>
                          <TextField
                            fullWidth
                            name="username"
                            label="Username"
                            placeholder="Choose a username"
                            value={signupForm.username}
                            onChange={handleSignupInputChange}
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

                        <Box>
                          <TextField
                            fullWidth
                            type="email"
                            label="Email address"
                            name="email"
                            placeholder="Enter your email"
                            value={signupForm.email}
                            onChange={handleSignupInputChange}
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

                        <Box>
                          <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            name="password"
                            placeholder="Create a password"
                            value={signupForm.password}
                            onChange={handleSignupInputChange}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FaLock sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    size="small"
                                  >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {signupForm.password && (
                            <Box sx={{ mt: 1.5 }}>
                              <LinearProgress
                                variant="determinate"
                                value={passwordStrength.percentage}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: alpha(strengthMeta.color, 0.12),
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: strengthMeta.color,
                                  },
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  mt: 0.75,
                                  fontWeight: 600,
                                  color: strengthMeta.color,
                                }}
                              >
                                Password strength: {strengthMeta.label}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, minmax(0, 1fr))',
                                  },
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                {passwordStrength.checks.map((check) => (
                                  <Box
                                    key={check.label}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      color: check.met ? 'success.main' : 'text.secondary',
                                    }}
                                  >
                                    {check.met ? (
                                      <CheckCircleOutline
                                        sx={{ fontSize: 16, color: 'success.main' }}
                                      />
                                    ) : (
                                      <Cancel sx={{ fontSize: 16, color: 'text.disabled' }} />
                                    )}
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {check.label}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        <Box>
                          <TextField
                            fullWidth
                            type={showConfirmPassword ? 'text' : 'password'}
                            label="Confirm password"
                            name="confirmpassword"
                            placeholder="Confirm your password"
                            value={signupForm.confirmpassword}
                            onChange={handleSignupInputChange}
                            required
                            error={passwordsMismatch}
                            helperText={
                              signupForm.confirmpassword
                                ? passwordsMismatch
                                  ? 'Passwords do not match'
                                  : 'Passwords match'
                                : ''
                            }
                            FormHelperTextProps={{
                              sx: {
                                mt: 1,
                                fontWeight: 600,
                                color: passwordsMismatch ? 'error.main' : 'success.main',
                              },
                            }}
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
                          {signupForm.confirmpassword && !passwordsMismatch && (
                            <Chip
                              size="small"
                              label="Great! Passwords match"
                              icon={<CheckCircleOutline sx={{ fontSize: 16 }} />}
                              sx={{
                                mt: 1.5,
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                                backgroundColor: alpha(theme.palette.success.main, 0.08),
                                color: 'success.main',
                              }}
                            />
                          )}
                        </Box>
                      </Stack>

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting || !canSubmitSignup}
                        sx={{
                          mt: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                        }}
                      >
                        {isSubmitting ? 'Creating Account...' : 'Start Your Journey'}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
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

AuthModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialMode: PropTypes.oneOf(['login', 'signup']),
  onAuthSuccess: PropTypes.func.isRequired,
};

export default AuthModal;
