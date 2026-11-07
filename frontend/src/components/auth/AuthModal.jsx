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
import { setAccessToken, setRefreshToken } from '../../utils/api';
import { validateEmail, validateUsername } from '../../utils/validation';
import { useLoginMutation, useRegisterMutation } from '../../services/api';

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
  const [mode, setMode] = useState(initialMode);
  const lottieSize = mode === 'signup'
    ? (isMobile ? 112 : 290)
    : (isMobile ? 148 : 350);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginRequest, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerRequest, { isLoading: isRegistering }] = useRegisterMutation();
  const isSubmitting = isLoggingIn || isRegistering;
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
    setError('');

    try {
      const data = await loginRequest(loginCredentials).unwrap();

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
      setError(
        error.data?.message ||
          error.data?.error ||
          error.error ||
          error.message ||
          'Failed to login. Please try again.'
      );
      setSnackbar({
        show: true,
        message: 'Login failed!',
        type: 'failure',
      });
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

    const formData = { ...signupForm };
    delete formData.confirmpassword;

    try {
      await registerRequest(formData).unwrap();

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
      setError(
        error.data?.message ||
          error.data?.error ||
          error.error ||
          error.message ||
          'Failed to sign up. Please try again.'
      );
      setSnackbar({
        show: true,
        message: 'Sign up failed!',
        type: 'failure',
      });
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
        maxWidth="xl"
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
            width: { xs: '100%', md: 'min(1320px, calc(100vw - 48px))' },
            maxHeight: { xs: '100dvh', md: 'calc(100dvh - 48px)' },
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            borderRadius: { xs: 0, md: 4 },
            overflowX: 'hidden',
            overflowY: 'auto',
            maxHeight: { xs: '100dvh', md: 'calc(100dvh - 48px)' },
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: { md: 'center' },
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1320,
              mx: 'auto',
              my: 0,
              borderRadius: { xs: 0, md: 4 },
              overflow: 'hidden',
              boxShadow: { xs: 'none', md: '0 24px 56px rgba(8, 14, 28, 0.42)' },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              backgroundColor: 'background.paper',
              backgroundClip: 'padding-box',
              minHeight: { xs: '100dvh', md: 'min(740px, calc(100dvh - 48px))' },
              maxHeight: { md: 'calc(100dvh - 48px)' },
            }}
          >
            <Box
              sx={{
                flex: { xs: '0 0 auto', md: '0 0 52%' },
                background: `radial-gradient(ellipse at 70% 76%, ${alpha('#9FB6FF', 0.34)} 0%, transparent 34%), linear-gradient(150deg, ${alpha(theme.palette.primary.main, 0.96)} 0%, ${alpha(
                  theme.palette.primary.dark,
                  0.98
                )} 65%, ${alpha(theme.palette.primary.light, 0.82)} 100%)`,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: { xs: 'flex-start', md: 'space-between' },
                p: { xs: 2.5, sm: 3, md: 4.5 },
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
              <Stack spacing={{ xs: 1.5, md: 2 }} sx={{ zIndex: 1 }}>
                <Chip
                  label={mode === 'login' ? 'YOUR TRAINING SPACE' : 'START WITH A STRONG BASE'}
                  sx={{
                    alignSelf: 'flex-start',
                    fontWeight: 700,
                    letterSpacing: '.01em',
                    backgroundColor: alpha('#fff', 0.16),
                    color: '#fff',
                    border: `1px solid ${alpha('#fff', 0.22)}`,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.08,
                    letterSpacing: '-.035em',
                    fontSize: { xs: '1.55rem', md: 'clamp(2rem, 2.8vw, 2.75rem)' },
                    maxWidth: 520,
                  }}
                >
                  {mode === 'login'
                    ? 'Your progress is ready when you are.'
                    : 'Build a stronger routine, one session at a time.'}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: alpha('#fff', 0.85),
                    maxWidth: 420,
                    lineHeight: 1.55,
                  }}
                >
                  {mode === 'login'
                    ? 'Pick up your daily streak, review your goals, and keep your training momentum going.'
                    : 'Log workouts, follow your daily streak, and earn achievements as your consistency grows.'}
                </Typography>
                <Stack direction="row" flexWrap="wrap" columnGap={1} rowGap={1}>
                  {(mode === 'login'
                    ? ['Daily streaks', 'Goals & achievements', 'Workout history']
                    : ['Quick workout logging', 'Personal training goals', 'Unlockable milestones']
                  ).map((item) => (
                    <Chip
                      key={item}
                      icon={<CheckCircleOutline sx={{ fontSize: '16px !important', color: '#E1E9FF !important' }} />}
                      label={item}
                      size="small"
                      sx={{
                        minHeight: 32,
                        color: alpha('#fff', 0.96),
                        fontWeight: 650,
                        backgroundColor: alpha('#0C1738', 0.2),
                        border: `1px solid ${alpha('#fff', 0.18)}`,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
              <Box sx={{ mt: { xs: 1.5, md: 0 }, alignSelf: 'center', width: { xs: lottieSize, md: 'min(100%, 480px)' }, height: { xs: lottieSize, md: lottieSize }, minHeight: { md: mode === 'signup' ? 245 : 300 }, display: 'grid', placeItems: 'center', position: 'relative', zIndex: 1 }}>
                <Lottie options={lottieOptions} height={lottieSize} width={lottieSize} />
              </Box>
            </Box>

            <Box
              sx={{
                flex: '1 1 48%',
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
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  backgroundColor: alpha(theme.palette.text.primary, 0.035),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.12),
                    transform: 'translateY(-1px)',
                  },
                  transition: 'transform 160ms ease, background-color 160ms ease',
                }}
              >
                <CloseIcon />
              </IconButton>

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: { md: 'center' },
                  p: { xs: 2.5, sm: 3.5, md: '64px clamp(36px, 4vw, 68px)' },
                  pt: { xs: 7, md: '64px' },
                }}
              >
                <Stack spacing={.75} sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {mode === 'login' ? 'Welcome back' : 'Create your FitProgressr account'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
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
                    minHeight: 44,
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

                <Divider sx={{ my: 1.5 }} />

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ flex: { md: '0 1 auto' }, minHeight: 0, overflowY: { xs: 'visible', md: 'auto' }, overflowX: 'hidden', pt: 1.25, pr: { md: 1 }, scrollbarWidth: 'thin', '& .MuiTextField-root': { '& .MuiOutlinedInput-root': { minHeight: 58, borderRadius: '14px', backgroundColor: alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.48 : 0.55), transition: 'border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease', '& fieldset': { borderColor: alpha(theme.palette.divider, 0.9), transition: 'border-color 160ms ease' }, '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.62) }, '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.13)}`, backgroundColor: 'background.paper' }, '&.Mui-focused fieldset': { borderWidth: 1, borderColor: 'primary.main' } }, '& .MuiInputLabel-root': { fontWeight: 550 }, '& .MuiInputAdornment-root .MuiSvgIcon-root': { fontSize: 19 } }, '& .MuiFormHelperText-root': { mx: .5, mt: .75, lineHeight: 1.4 } }}>
                  {mode === 'login' ? (
                    <Box
                      component="form"
                      onSubmit={handleLogin}
                      sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                    >
                      <Stack spacing={2} sx={{ flex: 1 }}>
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: .75, mt: .5, color: 'text.secondary' }}>
                          <EmojiEmotions sx={{ color: 'primary.main', fontSize: 19 }} />
                          <Typography variant="caption" fontWeight={600}>
                            Your training progress is ready when you are.
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
                          mt: 2.5,
                          py: 1.35,
                          fontSize: '.98rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 24px rgba(75, 112, 240, .2)',
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
                                    aria-label={
                                      showConfirmPassword
                                        ? 'Hide confirm password'
                                        : 'Show confirm password'
                                    }
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
                          mt: 2.5,
                          py: 1.35,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 24px rgba(75, 112, 240, .2)',
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
