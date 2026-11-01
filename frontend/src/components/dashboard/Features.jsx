import { Box, Container, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  CalendarMonth,
  EmojiEvents,
  EditNote,
  Insights,
  LocalFireDepartment,
  TrackChanges,
} from '@mui/icons-material';

const FEATURES = [
  {
    icon: <EditNote />,
    index: '01',
    title: 'A training log that stays clear',
    body: 'Save sessions by date, track exercise duration and sets, mark work complete, and update an exercise when your plan changes.',
    color: '#6684F5',
  },
  {
    icon: <Insights />,
    index: '02',
    title: 'Progress you can read at a glance',
    body: 'See training days, completed minutes, exercises, XP, and activity patterns in a dashboard built around your actual log.',
    color: '#28B879',
  },
  {
    icon: <LocalFireDepartment />,
    index: '03',
    title: 'Consistency with context',
    body: 'Follow active days through a weekly calendar and keep a weekly streak as you show up week after week.',
    color: '#F2A52B',
  },
  {
    icon: <TrackChanges />,
    index: '04',
    title: 'Goals with a finish line',
    body: 'Set a target for workout days or exercise minutes, choose a date range, and watch completed training count toward it.',
    color: '#9A75E8',
  },
  {
    icon: <EmojiEvents />,
    index: '05',
    title: 'Milestones worth celebrating',
    body: 'Unlock achievement badges for training milestones and streaks, with XP rewards recorded to your account.',
    color: '#E58E54',
  },
  {
    icon: <CalendarMonth />,
    index: '06',
    title: 'Your training, day by day',
    body: 'Use the activity calendar and session history to spot patterns, revisit past workouts, and keep your progress connected.',
    color: '#3FA4C5',
  },
];

const Features = () => {
  const theme = useTheme();
  return (
    <Box
      component="section"
      id="features"
      sx={{
        py: { xs: 8, md: 12 },
        scrollMarginTop: '88px',
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 500,
          height: 500,
          top: -280,
          left: -180,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent 68%)`,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'end' }}
          gap={2}
          sx={{ mb: { xs: 4, md: 6 } }}
        >
          <Box>
            <Typography
              variant="overline"
              color="primary.main"
              fontWeight={800}
              letterSpacing=".13em"
            >
              BUILT FOR THE LONG GAME
            </Typography>
            <Typography
              component="h2"
              sx={{
                mt: 0.7,
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 800,
                letterSpacing: '-.045em',
                lineHeight: 1.1,
              }}
            >
              Every part of progress,
              <br />
              working together.
            </Typography>
          </Box>
          <Typography sx={{ color: 'text.secondary', maxWidth: 420, lineHeight: 1.8 }}>
            From the first log to a training habit, your sessions power the numbers, goals, and
            milestones you see.
          </Typography>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2,minmax(0,1fr))',
              lg: 'repeat(3,minmax(0,1fr))',
            },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {FEATURES.map((feature) => (
            <Box
              key={feature.index}
              sx={{
                minHeight: { xs: 190, md: 220 },
                p: { xs: 2.5, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '18px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                transition: 'transform .22s ease, border-color .22s ease, box-shadow .22s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: alpha(feature.color, 0.6),
                  boxShadow: `0 16px 34px ${alpha(theme.palette.common.black, 0.1)}`,
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2.5 }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    display: 'grid',
                    placeItems: 'center',
                    color: feature.color,
                    bgcolor: alpha(feature.color, 0.12),
                    borderRadius: '13px',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: '.1em' }}
                >
                  {feature.index}
                </Typography>
              </Stack>
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 750, letterSpacing: '-.02em', mb: 1 }}
              >
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
                {feature.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Features;
