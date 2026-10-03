import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Paper,
  Skeleton,
  alpha,
  useTheme,
  Fade,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import ExercisesList from '../components/ExercisesList';
import Quotes from '../components/Quotes';
import UserRoutine from '../components/UserRoutine';
import HeatMap from '../components/HeatMap';
import ExerciseEntryDialog from '../components/Exercise/ExerciseEntryDialog';
import { API_BASE_URL, getAccessToken } from '../utils/api';

const StatCard = ({ title, value, subtitle, icon: Icon, color, loading = false }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.25, lg: 2 },
        alignSelf: 'start',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        background: `linear-gradient(145deg, ${alpha(color, 0.09)}, ${alpha(color, 0.025)})`,
        border: '1px solid',
        borderColor: alpha(color, 0.14),
        borderRadius: '18px',
        transition: 'border-color 180ms ease, transform 180ms ease',
        '&:hover': { borderColor: alpha(color, 0.32), transform: 'translateY(-2px)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.01em' }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2.5,
            color,
            bgcolor: alpha(color, 0.12),
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 19 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }} role="status" aria-label={`Loading ${title}`}>
            <Skeleton variant="text" width={44} height={34} />
            <Skeleton variant="text" width={64} height={20} />
          </Box>
        ) : (
          <>
            <Typography sx={{ color, fontWeight: 750, fontSize: '1.75rem', lineHeight: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

const Home = ({ user }) => {
  const theme = useTheme();
  const [userDetails, setUserDetails] = useState({
    username: '',
    xp: 0,
    totalDays: 0,
  });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [exerciseDialogMode, setExerciseDialogMode] = useState('exercise');
  const backendURL = API_BASE_URL;
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? 'Good morning' : hour < 17 && hour >= 12 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const accessToken = getAccessToken();
        const response = await axios.get(`${backendURL}/api/user/${user}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUserDetails(response.data);
      } catch (err) {
        console.error('Error fetching the user', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [user, backendURL]);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await axios.get('https://api.api-ninjas.com/v2/quotes', {
          params: { categories: 'success, inspirational, life, courage' },
          headers: { 'X-Api-Key': import.meta.env.VITE_APININJAS },
        });
        setQuote(response.data?.[0] || {
          quote: "The only bad workout is the one that didn't happen.",
          author: 'Unknown',
          work: '',
        });
      } catch (error) {
        console.error('Error fetching Quotes', error);
        setQuote({
          quote: "The only bad workout is the one that didn't happen.",
          author: 'Unknown',
          work: '',
        });
      }
    };

    fetchQuote();
  }, []);

  const openExerciseDialog = (mode) => {
    setExerciseDialogMode(mode);
    setExerciseDialogOpen(true);
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: { xs: '100vh', md: 0 },
        height: 'auto',
        '@media (min-width: 900px) and (min-height: 760px)': {
          height: 'calc(100dvh - 80px)',
          minHeight: 0,
          overflow: 'hidden',
        },
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        pt: { xs: 2, md: 3, lg: 2.5 },
        pb: { xs: 4, md: 6, lg: 2.5 },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          height: { md: '100%' },
          flex: { md: '1 1 auto' },
          minHeight: { md: 0 },
          display: { md: 'grid' },
          gridTemplateRows: { md: 'minmax(0, 1fr)' },
          gap: { xs: 3, lg: 2.5 },
          px: { xs: 2, md: 3, xl: 4 },
        }}
      >
        <Fade in timeout={500}>
          <Box
            sx={{
              minHeight: { md: 0 },
              height: { md: '100%' },
              width: '100%',
              alignSelf: 'stretch',
              '@media (min-width: 900px) and (min-height: 760px)': {
                height: 'calc(100dvh - 140px)',
              },
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.1fr) minmax(0, 0.9fr)' },
              gap: { xs: 3, md: 2.5 },
            }}
          >
            <Box
              sx={{
                minHeight: { md: 0 },
                display: 'grid',
                gridTemplateRows: { xs: 'auto auto auto', md: 'auto auto minmax(0, 1fr)' },
                gap: { xs: 2, md: 2.5 },
              }}
            >
              <Paper
                component="section"
                elevation={0}
                sx={{
                  minHeight: { xs: 140, lg: 132 },
                  p: { xs: 2.5, lg: 2.5 },
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: { xs: 2, lg: 3 },
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: '20px',
                  background: `linear-gradient(115deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.background.paper, 0.96)} 58%)`,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}
                  >
                    YOUR TRAINING SPACE
                  </Typography>
                  {loading ? (
                    <Box role="status" aria-label="Loading your dashboard greeting">
                      <Skeleton variant="text" width="min(390px, 90%)" height={42} />
                      <Skeleton variant="text" width="min(300px, 75%)" height={24} />
                    </Box>
                  ) : (
                    <>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1.4rem', md: '1.65rem' },
                          lineHeight: 1.2,
                          mb: 0.5,
                        }}
                      >
                        {greeting}, {userDetails.username || 'Athlete'}{' '}
                        <Box component="span" aria-hidden="true">
                          👋
                        </Box>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        A clear view of your consistency and progress.
                      </Typography>
                    </>
                  )}
                </Box>
                <UserRoutine userID={user} compact />
              </Paper>

              <Paper
                component="section"
                aria-label="Daily inspiration"
                elevation={0}
                sx={{
                  minWidth: 0,
                  minHeight: { xs: 132, lg: 126 },
                  p: { xs: 2.25, lg: 2 },
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.14),
                  borderRadius: '18px',
                  background: `linear-gradient(145deg, ${alpha(theme.palette.info.main, 0.065)}, ${alpha(theme.palette.background.paper, 0.98)})`,
                }}
              >
                <Quotes quote={quote} />
              </Paper>
              <Paper
                component="section"
                aria-label="Exercise log"
                elevation={0}
                sx={{
                  minWidth: 0,
                  minHeight: { md: 0 },
                  p: { xs: 2, md: 2.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '20px',
                }}
              >
                <ExercisesList userID={user} onAddExercise={openExerciseDialog} />
              </Paper>

            </Box>

            <Box
            sx={{
              minWidth: 0,
              minHeight: { md: 0 },
              display: 'grid',
                gridTemplateRows: { xs: 'auto auto', md: 'auto minmax(0, 1fr)' },
                gap: { xs: 2, md: 2.5 },
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  alignItems: 'start',
                  gap: { xs: 1.5, sm: 2 },
                }}
              >
                <StatCard
                  title="Experience points"
                  value={userDetails.xp || 0}
                  subtitle="XP earned"
                  icon={TrophyIcon}
                  color={theme.palette.primary.main}
                  loading={loading}
                />
                <StatCard
                  title="Active days"
                  value={userDetails.totalDays || 0}
                  subtitle="this week"
                  icon={CalendarIcon}
                  color={theme.palette.success.main}
                  loading={loading}
                />
              </Box>
              <Box sx={{ minHeight: { md: 0 }, display: 'flex' }}>
                <HeatMap
                  userID={user}
                  onAddExercise={openExerciseDialog}
                />
              </Box>
            </Box>
          </Box>
        </Fade>
      </Container>
      <ExerciseEntryDialog
        open={exerciseDialogOpen}
        mode={exerciseDialogMode}
        onClose={() => setExerciseDialogOpen(false)}
        userID={user}
      />
    </Box>
  );
};

export default Home;
