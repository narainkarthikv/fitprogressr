import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import {
  ArrowForward,
  CheckCircleOutline,
  EmojiEvents,
  FitnessCenter,
  LocalFireDepartment,
  ShowChart,
  TrackChanges,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

const PreviewStat = ({ label, value, icon, color, bars }) => (
  <Box
    sx={{
      p: 1.5,
      minWidth: 0,
      borderRadius: '14px',
      bgcolor: 'background.default',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
      <Typography variant="caption" color="text.secondary" noWrap>
        {label}
      </Typography>
      <Box sx={{ color, display: 'grid', placeItems: 'center' }}>{icon}</Box>
    </Stack>
    <Typography sx={{ mt: 0.5, fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>
      {value}
    </Typography>
    <Stack
      direction="row"
      alignItems="end"
      spacing={0.5}
      sx={{ height: 30, mt: 1 }}
      aria-hidden="true"
    >
      {bars.map((height, index) => (
        <Box
          key={index}
          sx={{
            flex: 1,
            height: `${height}%`,
            minHeight: 4,
            borderRadius: '5px 5px 2px 2px',
            bgcolor: alpha(color, index === bars.length - 1 ? 0.9 : 0.3),
          }}
        />
      ))}
    </Stack>
  </Box>
);

PreviewStat.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  icon: PropTypes.node,
  color: PropTypes.string,
  bars: PropTypes.arrayOf(PropTypes.number),
};

const Hero = ({ isLoggedIn, onGetStartedClick }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const accent = theme.palette.success.main;

  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 12, md: 15 },
        pb: { xs: 7, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'background.default',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 760,
          height: 620,
          top: -250,
          right: '-8%',
          background: `radial-gradient(ellipse, ${alpha(primary, 0.18)} 0%, transparent 68%)`,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 420,
          height: 420,
          bottom: -260,
          left: '-8%',
          background: `radial-gradient(circle, ${alpha(accent, 0.09)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 6, md: 5 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ maxWidth: 610 }}>
              <Chip
                icon={<CheckCircleOutline />}
                label="Your training, all in one place"
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: alpha(primary, 0.1),
                  color: 'primary.main',
                  fontWeight: 700,
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '2.7rem', sm: '3.5rem', lg: '4.3rem' },
                  lineHeight: 1.07,
                  fontWeight: 800,
                  letterSpacing: '-.055em',
                }}
              >
                Make every workout{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  move you forward.
                </Box>
              </Typography>
              <Typography
                sx={{
                  maxWidth: 540,
                  color: 'text.secondary',
                  fontSize: { xs: '1rem', md: '1.12rem' },
                  lineHeight: 1.8,
                }}
              >
                Log your sessions, build a weekly streak, set a goal, and see the progress you earn
                one workout at a time.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 0.5 }}>
                {isLoggedIn ? (
                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ px: 2.75 }}
                  >
                    Open your dashboard
                  </Button>
                ) : (
                  <Button
                    onClick={onGetStartedClick}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ px: 2.75 }}
                  >
                    Start your training log
                  </Button>
                )}
                <Button href="#features" variant="outlined" size="large" sx={{ px: 2.5 }}>
                  Explore the features
                </Button>
              </Stack>
              <Stack
                direction="row"
                spacing={{ xs: 1.5, sm: 2.5 }}
                flexWrap="wrap"
                useFlexGap
                sx={{ pt: 0.5 }}
              >
                {['Workout history', 'Weekly streaks', 'Goals & milestones'].map((item) => (
                  <Stack key={item} direction="row" spacing={0.75} alignItems="center">
                    <CheckCircleOutline sx={{ color: 'success.main', fontSize: 17 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ maxWidth: 560, ml: { md: 'auto' }, position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: '12% -5% -6% 12%',
                  borderRadius: '32px',
                  background: `linear-gradient(135deg, ${alpha(primary, 0.2)}, ${alpha(accent, 0.12)})`,
                  filter: 'blur(28px)',
                }}
              />
              <Box
                sx={{
                  position: 'relative',
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: { xs: '22px', sm: '28px' },
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: `0 28px 80px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.35 : 0.12)}`,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2.25 }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '12px',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'primary.main',
                        bgcolor: alpha(primary, 0.12),
                      }}
                    >
                      <FitnessCenter fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>
                        Training overview
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        A clearer view of your work
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    size="small"
                    label="THIS WEEK"
                    sx={{
                      fontSize: '.62rem',
                      letterSpacing: '.07em',
                      fontWeight: 800,
                      bgcolor: 'action.hover',
                    }}
                  />
                </Stack>
                <Box
                  sx={{
                    p: 1.75,
                    mb: 1.5,
                    borderRadius: '16px',
                    background: `linear-gradient(125deg, ${alpha(primary, 0.15)}, ${alpha(primary, 0.04)})`,
                    border: '1px solid',
                    borderColor: alpha(primary, 0.18),
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        WEEKLY ACTIVITY
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.8}>
                        <LocalFireDepartment sx={{ color: '#F59E0B', fontSize: 21 }} />
                        <Typography variant="h6" fontWeight={800}>
                          Build your rhythm
                        </Typography>
                      </Stack>
                    </Box>
                    <Typography variant="subtitle2" color="primary.main" fontWeight={800}>
                      3 / 7 days
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.8} sx={{ mt: 1.5 }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <Box key={`${day}-${index}`} sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {day}
                        </Typography>
                        <Box
                          sx={{
                            mt: 0.45,
                            aspectRatio: '1',
                            maxHeight: 38,
                            borderRadius: '10px',
                            display: 'grid',
                            placeItems: 'center',
                            color: index < 3 ? '#fff' : 'text.disabled',
                            bgcolor:
                              index < 3
                                ? index === 2
                                  ? 'success.main'
                                  : 'primary.main'
                                : 'action.hover',
                            fontSize: '.72rem',
                            fontWeight: 800,
                          }}
                        >
                          {index < 3 ? '✓' : '·'}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                    gap: 1.25,
                  }}
                >
                  <PreviewStat
                    label="Training days"
                    value="3"
                    icon={<FitnessCenter sx={{ fontSize: 17 }} />}
                    color={primary}
                    bars={[35, 70, 48, 20, 14, 9, 8]}
                  />
                  <PreviewStat
                    label="Completed minutes"
                    value="95"
                    icon={<ShowChart sx={{ fontSize: 17 }} />}
                    color={accent}
                    bars={[25, 60, 38, 85, 30, 16, 10]}
                  />
                </Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1.5}
                  sx={{
                    mt: 1.5,
                    px: 1.5,
                    py: 1.2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '14px',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '10px',
                        color: '#D18A24',
                        bgcolor: alpha('#F59E0B', 0.13),
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: 17 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        NEXT MILESTONE
                      </Typography>
                      <Typography variant="body2" fontWeight={750}>
                        First workout · 25 XP
                      </Typography>
                    </Box>
                  </Stack>
                  <TrackChanges color="action" fontSize="small" />
                </Stack>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: 'block', mt: 1.2, textAlign: 'center' }}
                >
                  Illustrative preview · your dashboard reflects your own workouts
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

Hero.propTypes = { isLoggedIn: PropTypes.bool, onGetStartedClick: PropTypes.func };

export default Hero;
