import { Box, Container, LinearProgress, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  CheckCircle,
  EmojiEvents,
  FitnessCenter,
  LocalFireDepartment,
  TrackChanges,
} from '@mui/icons-material';

const ProgressShowcase = () => {
  const theme = useTheme();
  const activity = [
    0, 1, 0, 2, 3, 0, 0, 1, 2, 0, 0, 3, 1, 0, 2, 0, 1, 3, 0, 0, 1, 2, 0, 3, 1, 0, 0, 2, 1, 3, 0, 1,
    0, 2, 3, 0, 1, 0, 2, 1, 0, 3, 0, 1, 2, 0, 0, 1, 3, 0, 2, 0, 1, 0, 3, 2,
  ];
  const levelColors = [
    alpha(theme.palette.primary.main, 0.1),
    alpha(theme.palette.primary.main, 0.3),
    alpha(theme.palette.primary.main, 0.58),
    theme.palette.primary.main,
  ];

  return (
    <Box
      component="section"
      id="track-your-progress"
      sx={{
        py: { xs: 8, md: 12 },
        scrollMarginTop: '88px',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0,.82fr) minmax(0,1.18fr)' },
            alignItems: 'center',
            gap: { xs: 4, md: 8 },
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="primary.main"
              fontWeight={800}
              letterSpacing=".13em"
            >
              CONSISTENCY, MADE VISIBLE
            </Typography>
            <Typography
              component="h2"
              sx={{
                mt: 0.8,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                lineHeight: 1.12,
                fontWeight: 800,
                letterSpacing: '-.045em',
              }}
            >
              See the effort
              <br />
              add up.
            </Typography>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.85, mb: 3 }}>
              Your progress comes from the sessions you complete. FitProgressr brings that work
              together in a history, activity calendar, goals, and earned milestones.
            </Typography>
            <Stack spacing={1.75}>
              {[
                {
                  icon: <FitnessCenter />,
                  title: 'Log a session',
                  detail: 'Record exercises, time, sets, and notes.',
                },
                {
                  icon: <TrackChanges />,
                  title: 'Choose a target',
                  detail: 'Track workout days or exercise minutes.',
                },
                {
                  icon: <EmojiEvents />,
                  title: 'Celebrate progress',
                  detail: 'Unlock badges and XP as you reach milestones.',
                },
              ].map((step, index) => (
                <Stack key={step.title} direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      borderRadius: '11px',
                      color: 'primary.main',
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={750}>
                      {step.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.detail}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ ml: 'auto !important', fontWeight: 800 }}
                  >
                    0{index + 1}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: '20px', md: '26px' },
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: `0 24px 70px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.22 : 0.07)}`,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="start"
              gap={2}
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  Activity at a glance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  A sample of how completed training appears
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1.1,
                  py: 0.5,
                  borderRadius: '9px',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'success.main',
                  fontSize: '.68rem',
                  fontWeight: 800,
                }}
              >
                SAMPLE
              </Box>
            </Stack>
            <Box
              sx={{
                p: { xs: 1.25, sm: 2 },
                borderRadius: '15px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  RECENT TRAINING
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  LAST 8 WEEKS
                </Typography>
              </Stack>
              <Box
                role="img"
                aria-label="Sample activity chart over eight weeks"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(14,minmax(0,1fr))',
                  gridTemplateRows: 'repeat(4,16px)',
                  gap: { xs: 0.45, sm: 0.65 },
                }}
              >
                {activity.map((level, index) => (
                  <Box key={index} sx={{ borderRadius: '4px', bgcolor: levelColors[level] }} />
                ))}
              </Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.1 }}>
                <Typography variant="caption" color="text.disabled">
                  8 weeks ago
                </Typography>
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <Typography variant="caption" color="text.disabled">
                    Less
                  </Typography>
                  {levelColors.map((color, index) => (
                    <Box
                      key={index}
                      sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: color }}
                    />
                  ))}
                  <Typography variant="caption" color="text.disabled">
                    More
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.disabled">
                  This week
                </Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.25,
                mt: 1.5,
              }}
            >
              <Box
                sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '14px' }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    WEEKLY ACTIVITY
                  </Typography>
                  <LocalFireDepartment sx={{ color: '#E89B26', fontSize: 18 }} />
                </Stack>
                <Typography variant="h6" fontWeight={800} sx={{ mt: 0.4 }}>
                  Keep your rhythm
                </Typography>
                <Stack direction="row" spacing={0.55} sx={{ mt: 1 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Box key={`${day}${index}`} sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ fontSize: '.62rem' }}
                      >
                        {day}
                      </Typography>
                      <Box
                        sx={{
                          mt: 0.35,
                          height: 22,
                          borderRadius: '7px',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: index < 3 ? 'primary.main' : 'action.hover',
                          color: index < 3 ? '#fff' : 'text.disabled',
                          fontSize: '.68rem',
                        }}
                      >
                        {index < 3 ? '✓' : '·'}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
              <Box
                sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '14px' }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    GOAL PROGRESS
                  </Typography>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                </Stack>
                <Typography variant="h6" fontWeight={800} sx={{ mt: 0.4 }}>
                  Workout days
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  A target with a date range
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={62}
                  sx={{
                    mt: 1.35,
                    height: 7,
                    borderRadius: 9,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': { borderRadius: 9 },
                  }}
                />
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.55 }}>
                  <Typography variant="caption" color="text.secondary">
                    Progress updates from completed workouts
                  </Typography>
                  <Typography variant="caption" fontWeight={800} color="primary.main">
                    62%
                  </Typography>
                </Stack>
              </Box>
            </Box>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: 'block', textAlign: 'center', mt: 1.4 }}
            >
              Illustrative preview · your data is based on your training log
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProgressShowcase;
