import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Popover,
  IconButton,
  LinearProgress,
  Skeleton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  CheckCircleOutline,
  DeleteOutline,
  EditOutlined,
  EmojiEvents,
  FitnessCenter,
  Whatshot,
  Save,
} from '@mui/icons-material';
import ModalShell from '../components/common/ModalShell';
import DailyMotivationQuote from '../components/DailyMotivationQuote';
import {
  useCreateWorkoutSessionMutation,
  useDeleteWorkoutSessionMutation,
  useGetAchievementCatalogQuery,
  useGetEarnedAchievementsQuery,
  useGetGoalsQuery,
  useGetLegacyExercisesQuery,
  useGetProfileQuery,
  useGetStreakQuery,
  useGetWorkoutSessionsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useUpdateWorkoutSessionMutation,
} from '../services/api';

const dateKey = (date) => new Date(date).toISOString().slice(0, 10);
const displayDate = (date) => new Date(`${dateKey(date)}T12:00:00`);
const todayKey = () => dateKey(new Date());
const STREAK_MESSAGES = [
  'Keep it up!',
  'You’ve got this!',
  'One day at a time.',
  'Small wins add up.',
  'Make today count.',
  'You’re building momentum.',
  'Show up for yourself.',
  'Strong habits start small.',
  'Keep moving forward.',
  'Your effort matters.',
];
const panelSx = {
  minWidth: 0,
  height: '100%',
  borderRadius: { xs: '14px', md: '16px' },
  borderColor: 'divider',
  boxShadow: '0 10px 32px rgba(10, 20, 40, 0.08)',
  '&:hover': { boxShadow: '0 14px 38px rgba(10, 20, 40, 0.12)' },
};

const RefreshShimmer = ({ active }) =>
  active ? (
    <Skeleton
      animation="wave"
      variant="rounded"
      aria-hidden="true"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        width: '100%',
        height: 4,
        transform: 'none',
        pointerEvents: 'none',
      }}
    />
  ) : null;
RefreshShimmer.propTypes = { active: PropTypes.bool.isRequired };

const MiniBarChart = ({ values, label }) => {
  const maxValue = Math.max(1, ...values);
  return (
    <svg
      viewBox="0 0 168 68"
      role="img"
      aria-label={`${label} by day this week`}
      style={{ display: 'block', width: '100%', height: 60, overflow: 'visible' }}
    >
      <line
        x1="3"
        y1="49"
        x2="165"
        y2="49"
        stroke="currentColor"
        strokeOpacity=".35"
        strokeWidth="1.5"
      />
      {values.map((value, index) => {
        const height = value ? Math.max(8, (value / maxValue) * 34) : 7;
        const x = 7 + index * 23;
        return (
          <g key={`${label}-${index}`}>
            <rect x={x} y="12" width="15" height="37" rx="4" fill="currentColor" opacity=".07" />
            <rect
              x={x}
              y={49 - height}
              width="15"
              height={height}
              rx="4"
              fill="currentColor"
              opacity={value ? 0.95 : 0.42}
            />
            <text
              x={x + 7.5}
              y="64"
              textAnchor="middle"
              fill="currentColor"
              opacity=".78"
              fontSize="9"
              fontWeight="600"
            >
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Home = ({ user }) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const {
    data: profile = {},
    isLoading: profileLoading,
    isFetching: profileFetching,
    error: profileError,
  } = useGetProfileQuery(user, { skip: !user });
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    isFetching: sessionsFetching,
    error: sessionsError,
  } = useGetWorkoutSessionsQuery();
  const {
    data: goals = [],
    isLoading: goalsLoading,
    isFetching: goalsFetching,
    error: goalsError,
  } = useGetGoalsQuery(user, { skip: !user });
  const {
    data: catalog = [],
    isLoading: catalogLoading,
    isFetching: catalogFetching,
    error: catalogError,
  } = useGetAchievementCatalogQuery();
  const {
    data: earned = [],
    isLoading: earnedLoading,
    isFetching: earnedFetching,
    error: earnedError,
  } = useGetEarnedAchievementsQuery();
  const {
    data: streak = { streakCount: 0, activeDaysThisWeek: 0, dayCheck: [] },
    isLoading: streakLoading,
    isFetching: streakFetching,
    error: streakError,
  } = useGetStreakQuery(user, { skip: !user });
  const {
    data: legacyExercises = [],
    isLoading: legacyLoading,
    isFetching: legacyFetching,
    error: legacyError,
  } = useGetLegacyExercisesQuery(user, { skip: !user });
  const [createWorkoutSession, { isLoading: creatingWorkout }] = useCreateWorkoutSessionMutation();
  const [updateWorkoutSession, { isLoading: updatingWorkout }] = useUpdateWorkoutSessionMutation();
  const [deleteWorkoutSession, { isLoading: deletingWorkout }] = useDeleteWorkoutSessionMutation();
  const [createGoal, { isLoading: creatingGoal }] = useCreateGoalMutation();
  const [updateGoal, { isLoading: updatingGoal }] = useUpdateGoalMutation();
  const [deleteGoalRequest, { isLoading: deletingGoal }] = useDeleteGoalMutation();
  const loading =
    profileLoading ||
    sessionsLoading ||
    goalsLoading ||
    catalogLoading ||
    earnedLoading ||
    streakLoading ||
    legacyLoading;
  const savingWorkout = creatingWorkout || updatingWorkout;
  const savingGoal = creatingGoal || updatingGoal;
  const isRefreshing =
    profileFetching ||
    sessionsFetching ||
    goalsFetching ||
    catalogFetching ||
    earnedFetching ||
    streakFetching ||
    legacyFetching;
  const [error, setError] = useState('');
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [workoutDate, setWorkoutDate] = useState(todayKey());
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutSets, setWorkoutSets] = useState('');
  const [workoutReps, setWorkoutReps] = useState('');
  const [workoutWeight, setWorkoutWeight] = useState('');
  const [workoutUnit, setWorkoutUnit] = useState('kg');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutCompleted, setWorkoutCompleted] = useState(true);
  const [goal, setGoal] = useState({
    goalType: 'workout_count',
    target: '',
    startDate: todayKey(),
    endDate: todayKey(),
  });
  const [editingGoalId, setEditingGoalId] = useState('');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarPopoverAnchor, setCalendarPopoverAnchor] = useState(null);
  const [selectedCalendarKey, setSelectedCalendarKey] = useState('');
  const [streakMessage] = useState(
    () => STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)]
  );

  const queryError =
    profileError ||
    sessionsError ||
    goalsError ||
    catalogError ||
    earnedError ||
    streakError ||
    legacyError;
  const queryErrorMessage =
    queryError?.data?.error || queryError?.error || 'Some dashboard data could not be loaded.';

  const completedSessionDays = new Set(
    sessions
      .filter((session) => session.exercises?.some((exercise) => exercise.completed))
      .map((session) => dateKey(session.date))
  );
  legacyExercises
    .filter((exercise) => exercise.exerciseCheck)
    .forEach((exercise) => exercise.date && completedSessionDays.add(dateKey(exercise.date)));
  const trainingDays = completedSessionDays.size;
  const exerciseCount =
    sessions.reduce((total, session) => total + (session.exercises?.length || 0), 0) +
    legacyExercises.length;
  const completedMinutes =
    sessions.reduce(
      (total, session) =>
        total +
        (session.exercises || []).reduce(
          (sum, exercise) => sum + (exercise.completed ? Number(exercise.duration) || 0 : 0),
          0
        ),
      0
    ) +
    legacyExercises.reduce(
      (sum, exercise) => sum + (exercise.exerciseCheck ? Number(exercise.duration) || 0 : 0),
      0
    );
  const currentStreakDays = Number(streak.streakCount) || 0;
  const monthSessions = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    return sessions.filter((session) => {
      return dateKey(session.date).slice(0, 7) === `${year}-${String(month + 1).padStart(2, '0')}`;
    });
  }, [sessions, calendarDate]);
  const activityByDate = useMemo(() => {
    const activity = new Map();
    monthSessions.forEach((session) => {
      const key = dateKey(session.date);
      const entries = activity.get(key) || [];
      (session.exercises || []).forEach((exercise) =>
        entries.push({
          name: exercise.name,
          duration: Number(exercise.duration) || 0,
          completed: Boolean(exercise.completed),
          sets: exercise.sets || [],
          notes: exercise.notes || '',
          source: 'Workout session',
        })
      );
      activity.set(key, entries);
    });
    legacyExercises.forEach((exercise) => {
      if (
        !exercise.date ||
        dateKey(exercise.date).slice(0, 7) !==
          `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`
      )
        return;
      const key = dateKey(exercise.date);
      const entries = activity.get(key) || [];
      entries.push({
        name: exercise.description || 'Exercise',
        duration: Number(exercise.duration) || 0,
        completed: Boolean(exercise.exerciseCheck),
        sets: [],
        notes: '',
        source: 'Earlier exercise log',
      });
      activity.set(key, entries);
    });
    return activity;
  }, [monthSessions, legacyExercises, calendarDate]);
  const selectedDayEntries = activityByDate.get(selectedCalendarKey) || [];
  const selectedDayCompleted = selectedDayEntries.filter((entry) => entry.completed);
  const selectedDayMinutes = selectedDayCompleted.reduce(
    (total, entry) => total + entry.duration,
    0
  );
  const monthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
  const monthDays = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const calendarCells = [
    ...Array(monthStart.getDay()).fill(null),
    ...Array.from({ length: monthDays }, (_, index) => index + 1),
  ];

  const openWorkout = (session = null, exerciseToEdit = null) => {
    setEditingSession(session);
    setEditingExercise(exerciseToEdit);
    setWorkoutDate(session ? dateKey(session.date) : todayKey());
    setWorkoutName(exerciseToEdit?.name || '');
    setWorkoutDuration(exerciseToEdit ? String(exerciseToEdit.duration) : '');
    setWorkoutSets(exerciseToEdit?.sets?.length ? String(exerciseToEdit.sets.length) : '');
    setWorkoutReps(exerciseToEdit?.sets?.length ? String(exerciseToEdit.sets[0].reps) : '');
    setWorkoutWeight(
      exerciseToEdit?.sets?.length ? String(exerciseToEdit.sets[0].weight || '') : ''
    );
    setWorkoutUnit(exerciseToEdit?.sets?.[0]?.unit || 'kg');
    setWorkoutNotes(exerciseToEdit?.notes || '');
    setWorkoutCompleted(exerciseToEdit ? exerciseToEdit.completed : true);
    setWorkoutOpen(true);
  };

  const saveWorkout = async (event) => {
    event.preventDefault();
    const exercise = {
      name: workoutName.trim(),
      duration: Number(workoutDuration),
      completed: workoutCompleted,
      sets:
        Number.isInteger(Number(workoutSets)) &&
        Number(workoutSets) > 0 &&
        Number.isInteger(Number(workoutReps)) &&
        Number(workoutReps) > 0
          ? Array.from({ length: Math.min(50, Number(workoutSets)) }, () => ({
              reps: Number(workoutReps),
              weight: Number(workoutWeight) || 0,
              unit: workoutUnit,
            }))
          : [],
      notes: workoutNotes.trim(),
    };
    if (!exercise.name || !Number.isFinite(exercise.duration) || exercise.duration <= 0) return;
    setError('');
    try {
      const existingOnDay =
        !editingSession && sessions.find((session) => dateKey(session.date) === workoutDate);
      const date = new Date(`${workoutDate}T00:00:00.000Z`).toISOString();
      if (editingSession) {
        const exercises = editingExercise
          ? editingSession.exercises.map((item) =>
              item._id === editingExercise._id ? { ...exercise, _id: item._id } : item
            )
          : [...(editingSession.exercises || []), exercise];
        await updateWorkoutSession({
          sessionId: editingSession._id,
          body: {
            date,
            exercises,
          },
        }).unwrap();
      } else if (existingOnDay) {
        await updateWorkoutSession({
          sessionId: existingOnDay._id,
          body: {
            exercises: [...(existingOnDay.exercises || []), exercise],
          },
        }).unwrap();
      } else {
        await createWorkoutSession({ date, exercises: [exercise] }).unwrap();
      }
      setWorkoutOpen(false);
      setEditingSession(null);
      setEditingExercise(null);
    } catch (requestError) {
      setError(requestError.data?.error || requestError.error || 'The workout could not be saved.');
    }
  };

  const deleteSession = async (session) => {
    try {
      await deleteWorkoutSession(session._id).unwrap();
    } catch (requestError) {
      setError(
        requestError.data?.error || requestError.error || 'The workout could not be deleted.'
      );
    }
  };

  const saveGoal = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...goal, target: Number(goal.target) };
      if (editingGoalId) {
        await updateGoal({ userId: user, goalId: editingGoalId, body: payload }).unwrap();
      } else {
        await createGoal({ userId: user, body: payload }).unwrap();
      }
      setEditingGoalId('');
      setGoal({
        goalType: 'workout_count',
        target: '',
        startDate: todayKey(),
        endDate: todayKey(),
      });
      setGoalModalOpen(false);
    } catch (requestError) {
      setError(requestError.data?.error || requestError.error || 'The goal could not be saved.');
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await deleteGoalRequest({ userId: user, goalId }).unwrap();
      if (editingGoalId === goalId) {
        setEditingGoalId('');
        setGoal({
          goalType: 'workout_count',
          target: '',
          startDate: todayKey(),
          endDate: todayKey(),
        });
        setGoalModalOpen(false);
      }
    } catch (requestError) {
      setError(requestError.data?.error || requestError.error || 'The goal could not be deleted.');
    }
  };

  const openGoalForm = (item = null) => {
    setEditingGoalId(item?._id || '');
    setGoal(
      item
        ? {
            goalType: item.goalType,
            target: String(item.target),
            startDate: dateKey(item.startDate),
            endDate: dateKey(item.endDate),
          }
        : { goalType: 'workout_count', target: '', startDate: todayKey(), endDate: todayKey() }
    );
    setGoalModalOpen(true);
  };

  const closeGoalForm = () => {
    if (savingGoal) return;
    setGoalModalOpen(false);
    setEditingGoalId('');
    setGoal({ goalType: 'workout_count', target: '', startDate: todayKey(), endDate: todayKey() });
  };

  const toggleExercise = async (session, exerciseId) => {
    const exercises = session.exercises.map((exercise) =>
      exercise._id === exerciseId ? { ...exercise, completed: !exercise.completed } : exercise
    );
    try {
      await updateWorkoutSession({ sessionId: session._id, body: { exercises } }).unwrap();
    } catch (requestError) {
      setError(
        requestError.data?.error || requestError.error || 'Exercise status could not be updated.'
      );
    }
  };

  const earnedIds = new Set(
    earned.map((item) => String(item.achievementId?._id || item.achievementId))
  );
  const orderedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const weekDayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayIndex = new Date().getUTCDay();
  const weeklyCharts = useMemo(() => {
    const weekStart = new Date();
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    const series = { minutes: Array(7).fill(0), exercises: Array(7).fill(0), xp: Array(7).fill(0) };
    const getDayIndex = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return -1;
      const index = Math.floor(
        (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
          weekStart.getTime()) /
          86400000
      );
      return index >= 0 && index < 7 ? index : -1;
    };
    sessions.forEach((session) => {
      const index = getDayIndex(session.date);
      if (index < 0) return;
      (session.exercises || []).forEach((exercise) => {
        series.exercises[index] += 1;
        if (exercise.completed) series.minutes[index] += Number(exercise.duration) || 0;
      });
    });
    legacyExercises.forEach((exercise) => {
      const index = getDayIndex(exercise.date);
      if (index < 0) return;
      series.exercises[index] += 1;
      if (exercise.exerciseCheck) series.minutes[index] += Number(exercise.duration) || 0;
    });
    earned.forEach((item) => {
      const index = getDayIndex(item.earnedAt);
      if (index >= 0) series.xp[index] += Number(item.achievementId?.xpReward) || 0;
    });
    return {
      trainingDays: (streak.dayCheck || Array(7).fill(false)).map((active) => Number(active)),
      ...series,
    };
  }, [sessions, legacyExercises, earned, streak.dayCheck]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: 'calc(100dvh - 68px)',
        bgcolor: 'background.default',
        py: { xs: 2.5, sm: 3, lg: 4 },
        overflowX: 'clip',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, xl: 4 } }}>
        <Stack spacing={{ xs: 2.5, md: 3 }}>
          {isRefreshing && !loading && (
            <Box
              role="status"
              aria-label="Refreshing dashboard data"
              sx={{ position: 'relative', height: 4 }}
            >
              <Skeleton
                animation="wave"
                variant="rounded"
                sx={{ width: '100%', height: 4, transform: 'none' }}
              />
            </Box>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1.5fr) minmax(280px,1fr)' },
              alignItems: 'stretch',
              gap: { xs: 2, lg: 2.5 },
            }}
          >
            <Stack spacing={{ xs: 1.25, lg: 1.5 }} sx={{ minWidth: 0, height: '100%' }}>
              <Stack
                justifyContent="center"
                spacing={{ xs: 1.5, lg: 2 }}
                sx={{
                  position: 'relative',
                  isolation: 'isolate',
                  overflow: 'hidden',
                  minWidth: 0,
                  p: { xs: 1.75, sm: 2.25, lg: 2.75 },
                  borderRadius: { xs: '14px', md: '18px' },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: '3px solid',
                  borderLeftColor: 'primary.main',
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'radial-gradient(ellipse at 93% 8%, rgba(102, 132, 255, .2), transparent 35%), linear-gradient(135deg, rgba(68, 117, 235, .16), rgba(68, 117, 235, .035) 65%, rgba(255,255,255,.015))'
                      : 'radial-gradient(ellipse at 93% 8%, rgba(93, 115, 213, .09), transparent 38%), linear-gradient(135deg, rgba(93, 115, 213, .07), rgba(93, 115, 213, .025) 65%, rgba(255,255,255,.35))',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  gap={1.5}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="overline"
                      color="primary.main"
                      fontWeight={750}
                      letterSpacing=".14em"
                    >
                      YOUR TRAINING SPACE
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={850}
                      sx={{
                        fontSize: 'clamp(1.5rem, 2.8vw, 2.25rem)',
                        overflowWrap: 'anywhere',
                        mt: 0.4,
                        lineHeight: 1.08,
                        letterSpacing: '-.035em',
                      }}
                    >
                      {loading ? (
                        <Skeleton animation="wave" width="72%" />
                      ) : (
                        `Welcome back${profile?.username ? `, ${profile.username}` : ''}`
                      )}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => openWorkout()}
                    sx={{
                      minHeight: 46,
                      flexShrink: 0,
                      px: { xs: 1.25, sm: 2.25 },
                      borderRadius: '12px',
                      boxShadow: '0 8px 22px rgba(76, 112, 240, .25)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Log workout
                  </Button>
                </Stack>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'minmax(0,1fr)',
                      md: 'minmax(0,1.15fr) minmax(265px,.85fr)',
                    },
                    alignItems: 'center',
                    gap: { xs: 1.5, md: 2.5 },
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 0,
                      py: { xs: 1, md: 1.5 },
                      px: { xs: 1.5, md: 2 },
                      borderLeft: '2px solid',
                      borderColor: 'primary.main',
                      borderRadius: '2px 12px 12px 2px',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,.025)'
                          : 'rgba(255,255,255,.42)',
                    }}
                  >
                    <DailyMotivationQuote />
                    <Typography
                      variant="caption"
                      color="primary.light"
                      fontWeight={650}
                      sx={{ display: 'block', mt: 1.25, letterSpacing: '.025em' }}
                    >
                      {streak.activeDaysThisWeek
                        ? 'You’re building momentum. Keep it going.'
                        : 'Start your week with one session.'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: { xs: 1.25, sm: 1.5 },
                      borderRadius: '14px',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(10, 20, 40, .26)'
                          : 'rgba(255,255,255,.48)',
                      border: '1px solid',
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(130, 160, 220, .2)'
                          : 'rgba(93,115,213,.14)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.28)',
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={1}
                      sx={{ mb: 1.1 }}
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '11px',
                            bgcolor: 'rgba(255, 166, 34, .12)',
                          }}
                        >
                          <Whatshot color="warning" fontSize="small" />
                        </Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          lineHeight={1.2}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          {currentStreakDays} {currentStreakDays === 1 ? 'day' : 'days'} streak
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        color="primary.light"
                        fontWeight={750}
                        textAlign="right"
                        sx={{ minWidth: 0, lineHeight: 1.35 }}
                      >
                        {streakMessage}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={{ xs: 0.5, sm: 0.75 }}
                    >
                      {weekDayLabels.map((label, index) => {
                        const isActive = Boolean(streak.dayCheck?.[index]);
                        const isToday = index === todayIndex;
                        return (
                          <Stack
                            key={`${label}-${index}`}
                            alignItems="center"
                            spacing={0.4}
                            sx={{ flex: 1, minWidth: 0 }}
                          >
                            <Typography
                              variant="caption"
                              color={isToday ? 'primary.light' : 'text.secondary'}
                              fontWeight={isToday ? 750 : 500}
                            >
                              {label}
                            </Typography>
                            <Box
                              aria-label={`${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]}${isActive ? ', workout completed' : ', no workout'}`}
                              sx={{
                                width: '100%',
                                maxWidth: 30,
                                height: 24,
                                borderRadius: '8px',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '.7rem',
                                fontWeight: 800,
                                color: isActive ? 'common.white' : 'text.secondary',
                                background: isActive
                                  ? 'linear-gradient(135deg, #28a66a, #16864d)'
                                  : (theme) =>
                                      theme.palette.mode === 'dark'
                                        ? 'rgba(255,255,255,.055)'
                                        : 'rgba(72,91,131,.075)',
                                border: '1px solid',
                                borderColor: isToday ? 'primary.main' : 'divider',
                                boxShadow: isToday ? '0 0 0 2px rgba(100,130,255,.15)' : 'none',
                                transition: 'transform .18s ease, background .18s ease',
                                '&:hover': { transform: 'translateY(-2px)' },
                              }}
                            >
                              {isActive ? '✓' : '·'}
                            </Box>
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Box>
                </Box>
              </Stack>
              {loading ? (
                <Skeleton
                  animation="wave"
                  variant="rounded"
                  height={112}
                  sx={{ width: '100%', borderRadius: '14px' }}
                />
              ) : (
                <Card
                  variant="outlined"
                  sx={{
                    ...panelSx,
                    position: 'relative',
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    height: 'auto',
                    flex: 1,
                    background: 'linear-gradient(145deg, rgba(255,255,255,.025), transparent 75%)',
                  }}
                >
                  <RefreshShimmer active={catalogFetching || earnedFetching} />
                  <CardContent
                    sx={{
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      p: { xs: 1.5, sm: 2 },
                      '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      flexWrap="wrap"
                      gap={1}
                      sx={{ mb: 1.5 }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={750}>
                          Achievements
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Small wins that build your training streak.
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        icon={<EmojiEvents />}
                        color="warning"
                        variant="outlined"
                        label={`${earnedIds.size} earned`}
                      />
                    </Stack>
                    {catalogLoading || earnedLoading ? (
                      <Stack spacing={1}>
                        <Skeleton animation="wave" width="35%" />
                        <Skeleton animation="wave" variant="rounded" height={38} />
                        <Skeleton animation="wave" variant="rounded" height={38} />
                      </Stack>
                    ) : !catalog.length ? (
                      <Typography variant="body2" color="text.secondary">
                        Achievements will appear here when available.
                      </Typography>
                    ) : (
                      <Stack spacing={1.25}>
                        {[
                          {
                            key: 'workoutCount',
                            label: 'Training milestones',
                            icon: FitnessCenter,
                          },
                          { key: 'streak', label: 'Streak badges', icon: Whatshot },
                        ].map((group) => {
                          const groupAchievements = catalog.filter(
                            (item) => item.condition?.type === group.key
                          );
                          if (!groupAchievements.length) return null;
                          return (
                            <Stack
                              key={group.key}
                              direction={{ xs: 'column', sm: 'row' }}
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              gap={{ xs: 0.5, sm: 1.25 }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={700}
                                sx={{ width: { sm: 112 }, flexShrink: 0, letterSpacing: '.015em' }}
                              >
                                {group.label}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  alignItems: 'center',
                                  gap: { xs: 0.6, sm: 0.75 },
                                  minWidth: 0,
                                }}
                              >
                                {groupAchievements.map((item) => {
                                  const unlocked = earnedIds.has(String(item._id));
                                  const GroupIcon = group.icon;
                                  return (
                                    <Tooltip
                                      key={item._id}
                                      arrow
                                      title={
                                        <>
                                          {item.description}
                                          <br />
                                          {unlocked ? 'Unlocked' : 'Locked'} · +{item.xpReward} XP
                                        </>
                                      }
                                    >
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        gap={0.65}
                                        sx={{
                                          minHeight: 34,
                                          pl: 0.45,
                                          pr: 0.8,
                                          borderRadius: '10px',
                                          color: unlocked ? 'success.light' : 'text.secondary',
                                          bgcolor: unlocked
                                            ? 'rgba(46,160,100,.09)'
                                            : (theme) =>
                                                theme.palette.mode === 'dark'
                                                  ? 'rgba(255,255,255,.025)'
                                                  : 'rgba(72,91,131,.035)',
                                          border: '1px solid',
                                          borderColor: unlocked ? 'rgba(46,160,100,.2)' : 'divider',
                                          opacity: unlocked ? 1 : 0.72,
                                          transition:
                                            'transform .18s ease, border-color .18s ease, opacity .18s ease',
                                          '&:hover': {
                                            transform: 'translateY(-1px)',
                                            opacity: 1,
                                            borderColor: unlocked
                                              ? 'success.main'
                                              : 'text.secondary',
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 25,
                                            height: 25,
                                            flexShrink: 0,
                                            display: 'grid',
                                            placeItems: 'center',
                                            borderRadius: '8px',
                                            color: unlocked
                                              ? 'success.light'
                                              : group.key === 'streak'
                                                ? 'warning.main'
                                                : 'primary.light',
                                            bgcolor: unlocked
                                              ? 'rgba(46,160,100,.14)'
                                              : 'action.hover',
                                          }}
                                        >
                                          <GroupIcon sx={{ fontSize: 15 }} />
                                        </Box>
                                        <Typography
                                          variant="caption"
                                          fontWeight={unlocked ? 700 : 600}
                                          sx={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}
                                        >
                                          {item.name}
                                        </Typography>
                                      </Stack>
                                    </Tooltip>
                                  );
                                })}
                              </Box>
                            </Stack>
                          );
                        })}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              )}
            </Stack>
            <Stack spacing={1.5} sx={{ minWidth: 0, height: { xs: 'auto', lg: '100%' } }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1fr)',
                  alignContent: 'stretch',
                  gap: { xs: 1, sm: 1.25 },
                }}
              >
                {loading
                  ? Array.from({ length: 4 }, (_, index) => (
                      <Skeleton
                        key={index}
                        animation="wave"
                        variant="rounded"
                        height={78}
                        sx={{ borderRadius: '14px' }}
                      />
                    ))
                  : [
                      [
                        'Training days',
                        trainingDays,
                        <FitnessCenter key="days-icon" />,
                        weeklyCharts.trainingDays,
                        'primary.main',
                      ],
                      [
                        'Completed minutes',
                        completedMinutes,
                        <FitnessCenter key="minutes-icon" />,
                        weeklyCharts.minutes,
                        'success.main',
                      ],
                      [
                        'Exercises logged',
                        exerciseCount,
                        <EditOutlined key="exercises-icon" />,
                        weeklyCharts.exercises,
                        'info.main',
                      ],
                      [
                        'Experience points',
                        profile?.xp || 0,
                        <EmojiEvents key="xp-icon" />,
                        weeklyCharts.xp,
                        'warning.main',
                      ],
                    ].map(([label, value, icon, series, color]) => (
                      <Card
                        key={label}
                        variant="outlined"
                        sx={{
                          ...panelSx,
                          position: 'relative',
                          height: 'auto',
                          minHeight: 88,
                          borderRadius: '15px',
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'linear-gradient(105deg, rgba(255,255,255,.045), rgba(255,255,255,.012) 55%, transparent)'
                              : 'linear-gradient(105deg, rgba(93,115,213,.035), rgba(255,255,255,.42) 60%, transparent)',
                          transition:
                            'transform .2s ease, border-color .2s ease, box-shadow .2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: color,
                            boxShadow: '0 14px 28px rgba(25, 55, 120, .12)',
                          },
                        }}
                      >
                        <RefreshShimmer
                          active={sessionsFetching || profileFetching || earnedFetching}
                        />
                        <CardContent
                          sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            p: { xs: 1.25, sm: 1.5 },
                            '&:last-child': { pb: { xs: 1.25, sm: 1.5 } },
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            gap={{ xs: 1, sm: 1.5 }}
                            sx={{ width: '100%', minWidth: 0 }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                width: { xs: '34%', sm: '36%' },
                                maxWidth: 210,
                                minWidth: 0,
                                fontSize: { xs: '.74rem', sm: '.86rem' },
                                lineHeight: 1.2,
                                fontWeight: 600,
                              }}
                            >
                              {label}
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={850}
                              sx={{
                                minWidth: 30,
                                fontSize: 'clamp(1.35rem, 2.4vw, 1.85rem)',
                                lineHeight: 1,
                                letterSpacing: '-.035em',
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {value}
                            </Typography>
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: '12px',
                                color,
                                bgcolor: 'action.hover',
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {icon}
                            </Box>
                            <Box sx={{ color, flex: 1, minWidth: 90, pl: { xs: 0.25, sm: 1 } }}>
                              <MiniBarChart values={series} label={label} />
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
              </Box>
              {loading ? (
                <Skeleton
                  animation="wave"
                  variant="rounded"
                  height={130}
                  sx={{ borderRadius: '14px' }}
                />
              ) : (
                <Card
                  variant="outlined"
                  sx={{
                    ...panelSx,
                    position: 'relative',
                    height: 'auto',
                    flex: { xs: '0 0 auto', lg: 1 },
                    display: 'flex',
                    overflow: 'hidden',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, rgba(109,140,255,.075), rgba(255,255,255,.012) 65%)'
                        : 'linear-gradient(145deg, rgba(93,115,213,.045), rgba(255,255,255,.3) 65%)',
                  }}
                >
                  <RefreshShimmer active={goalsFetching} />
                  <CardContent
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: { xs: 1.5, sm: 1.75 },
                      '&:last-child': { pb: { xs: 1.5, sm: 1.75 } },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={1}
                      sx={{ mb: goals.length ? 1.25 : 0 }}
                    >
                      <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '11px',
                            color: 'primary.main',
                            bgcolor: 'rgba(109,140,255,.13)',
                          }}
                        >
                          <FitnessCenter fontSize="small" />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                            Goals
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {goals.length
                              ? `${goals.length} active ${goals.length === 1 ? 'target' : 'targets'}`
                              : 'Build toward a clear target'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => openGoalForm()}
                        sx={{
                          flexShrink: 0,
                          minHeight: 34,
                          borderRadius: '10px',
                          px: 1.25,
                          fontWeight: 700,
                        }}
                      >
                        Add goal
                      </Button>
                    </Stack>
                    {!goals.length && (
                      <Box
                        sx={{
                          flex: 1,
                          minHeight: 90,
                          display: 'grid',
                          placeItems: 'center',
                          textAlign: 'center',
                          px: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Create a target to track a training milestone.
                        </Typography>
                      </Box>
                    )}
                    {goals.length > 0 && (
                      <Stack spacing={1}>
                        {goals.map((item) => {
                          const percent = Math.min(
                            100,
                            Math.round(
                              ((Number(item.progress) || 0) / Math.max(1, Number(item.target))) *
                                100
                            )
                          );
                          const goalLabel =
                            item.goalType === 'workout_count' ? 'Workout days' : 'Exercise minutes';
                          return (
                            <Paper
                              key={item._id}
                              variant="outlined"
                              sx={{
                                minWidth: 0,
                                p: 1.1,
                                borderRadius: '12px',
                                bgcolor: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,.018)'
                                    : 'rgba(72,91,131,.035)',
                                borderColor: 'divider',
                              }}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                gap={0.75}
                              >
                                <Typography variant="body2" fontWeight={750} noWrap>
                                  {goalLabel}
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={0.5}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                    sx={{ whiteSpace: 'nowrap' }}
                                  >
                                    {item.progress} / {item.target}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    aria-label="Edit goal"
                                    onClick={() => openGoalForm(item)}
                                    sx={{ width: 30, height: 30, borderRadius: '9px' }}
                                  >
                                    <EditOutlined sx={{ fontSize: 16 }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    aria-label="Delete goal"
                                    disabled={deletingGoal}
                                    onClick={() => deleteGoal(item._id)}
                                    sx={{ width: 30, height: 30, borderRadius: '9px' }}
                                  >
                                    <DeleteOutline sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Stack>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={percent}
                                sx={{
                                  mt: 0.6,
                                  height: 6,
                                  borderRadius: 6,
                                  bgcolor: 'action.hover',
                                  '& .MuiLinearProgress-bar': { borderRadius: 6 },
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.45, fontSize: '.68rem' }}
                              >
                                {percent}% · Ends{' '}
                                {displayDate(item.endDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </Typography>
                            </Paper>
                          );
                        })}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Box>

          {(error || queryError) && (
            <Alert severity="error" onClose={() => setError('')}>
              {error || queryErrorMessage}
            </Alert>
          )}
          {loading ? (
            <Stack spacing={2.5} aria-label="Loading training dashboard" role="status">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1.4fr) minmax(290px,.9fr)' },
                  gap: 2,
                }}
              >
                <Skeleton
                  animation="wave"
                  variant="rounded"
                  height={360}
                  sx={{ borderRadius: 4 }}
                />
                <Skeleton
                  animation="wave"
                  variant="rounded"
                  height={360}
                  sx={{ borderRadius: 4 }}
                />
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2,minmax(0,1fr))' },
                  gap: 2,
                }}
              >
                <Skeleton
                  animation="wave"
                  variant="rounded"
                  height={260}
                  sx={{ borderRadius: 4 }}
                />
                <Skeleton
                  animation="wave"
                  variant="rounded"
                  height={260}
                  sx={{ borderRadius: 4 }}
                />
              </Box>
            </Stack>
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0,1fr)',
                    md: 'minmax(0,1.4fr) minmax(290px,.9fr)',
                  },
                  alignItems: 'start',
                  gap: { xs: 2, md: 2.5 },
                }}
              >
                <Card variant="outlined" sx={panelSx}>
                  <CardContent>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                      gap={1.5}
                      sx={{ mb: 2 }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={750}>
                          Workout history
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your latest training sessions
                        </Typography>
                      </Box>
                      <Button startIcon={<Add />} onClick={() => openWorkout()}>
                        Add
                      </Button>
                    </Stack>
                    {!orderedSessions.length ? (
                      <Box
                        sx={{
                          display: 'grid',
                          placeItems: 'center',
                          textAlign: 'center',
                          gap: 1,
                          py: { xs: 4, sm: 5 },
                          px: 2,
                          border: '1px dashed',
                          borderColor: 'divider',
                          borderRadius: '14px',
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '15px',
                            color: 'primary.main',
                            bgcolor: 'rgba(99, 126, 255, .12)',
                          }}
                        >
                          <FitnessCenter />
                        </Box>
                        <Typography fontWeight={750}>Your training log starts here</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Log a session to see your exercises, duration, and progress in one place.
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => openWorkout()}
                        >
                          Log first workout
                        </Button>
                      </Box>
                    ) : (
                      <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{
                          width: '100%',
                          maxWidth: '100%',
                          overflowX: 'auto',
                          borderRadius: '13px',
                          bgcolor: 'transparent',
                          '&::-webkit-scrollbar': { height: 7 },
                          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 8 },
                        }}
                      >
                        <Table
                          size="medium"
                          aria-label="Workout history"
                          sx={{ minWidth: 620, borderCollapse: 'separate', borderSpacing: 0 }}
                        >
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                              <TableCell
                                sx={{
                                  py: 1.25,
                                  fontSize: '.7rem',
                                  fontWeight: 800,
                                  letterSpacing: '.08em',
                                  color: 'text.secondary',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Date
                              </TableCell>
                              <TableCell
                                sx={{
                                  py: 1.25,
                                  fontSize: '.7rem',
                                  fontWeight: 800,
                                  letterSpacing: '.08em',
                                  color: 'text.secondary',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Exercises
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  py: 1.25,
                                  fontSize: '.7rem',
                                  fontWeight: 800,
                                  letterSpacing: '.08em',
                                  color: 'text.secondary',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Duration
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  py: 1.25,
                                  fontSize: '.7rem',
                                  fontWeight: 800,
                                  letterSpacing: '.08em',
                                  color: 'text.secondary',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {orderedSessions.slice(0, 10).map((session) => {
                              const totalMinutes = (session.exercises || []).reduce(
                                (sum, item) => sum + Number(item.duration || 0),
                                0
                              );
                              const visibleExercises = (session.exercises || []).slice(0, 3);
                              const extraExercises = Math.max(
                                0,
                                (session.exercises?.length || 0) - visibleExercises.length
                              );
                              return (
                                <TableRow
                                  key={session._id}
                                  hover
                                  sx={{ '&:last-child td': { borderBottom: 0 } }}
                                >
                                  <TableCell sx={{ minWidth: 150, py: 1.5 }}>
                                    <Typography variant="body2" fontWeight={750}>
                                      {displayDate(session.date).toLocaleDateString(undefined, {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {displayDate(session.date).getFullYear()}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ minWidth: 240, py: 1.25 }}>
                                    <Stack
                                      direction="row"
                                      flexWrap="wrap"
                                      alignItems="center"
                                      gap={0.7}
                                    >
                                      {visibleExercises.map((exercise) => (
                                        <Chip
                                          key={exercise._id}
                                          size="small"
                                          clickable
                                          onClick={() => toggleExercise(session, exercise._id)}
                                          color={exercise.completed ? 'success' : 'default'}
                                          variant={exercise.completed ? 'filled' : 'outlined'}
                                          label={`${exercise.name} · ${exercise.duration}m`}
                                          sx={{
                                            maxWidth: 180,
                                            '& .MuiChip-label': {
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                            },
                                          }}
                                        />
                                      ))}
                                      {extraExercises > 0 && (
                                        <Chip
                                          size="small"
                                          variant="outlined"
                                          label={`+${extraExercises}`}
                                        />
                                      )}
                                      {!session.exercises?.length && (
                                        <Typography variant="caption" color="text.secondary">
                                          No exercises
                                        </Typography>
                                      )}
                                    </Stack>
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{ minWidth: 92, py: 1.5, whiteSpace: 'nowrap' }}
                                  >
                                    <Typography fontWeight={800}>
                                      {totalMinutes}
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ ml: 0.5 }}
                                      >
                                        min
                                      </Typography>
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right" sx={{ minWidth: 96, py: 1 }}>
                                    <Stack direction="row" justifyContent="flex-end">
                                      <IconButton
                                        size="small"
                                        aria-label="Delete workout session"
                                        color="error"
                                        disabled={deletingWorkout}
                                        onClick={() => deleteSession(session)}
                                        sx={{ borderRadius: '9px' }}
                                      >
                                        <DeleteOutline fontSize="small" />
                                      </IconButton>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                    {legacyExercises.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          Earlier exercise logs
                        </Typography>
                        <Stack spacing={0.75}>
                          {legacyExercises
                            .slice()
                            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                            .slice(0, 5)
                            .map((exercise) => (
                              <Typography key={exercise._id} variant="body2" color="text.secondary">
                                {exercise.description} · {exercise.duration} min ·{' '}
                                {exercise.date
                                  ? displayDate(exercise.date).toLocaleDateString()
                                  : 'Date unavailable'}
                                {exercise.exerciseCheck ? ' · Completed' : ''}
                              </Typography>
                            ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={panelSx}>
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={750}>
                          Activity calendar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed exercises by day
                        </Typography>
                      </Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton
                          aria-label="Previous month"
                          onClick={() => {
                            setCalendarPopoverAnchor(null);
                            setCalendarDate(
                              new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)
                            );
                          }}
                        >
                          ‹
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 86, textAlign: 'center' }}>
                          {calendarDate.toLocaleDateString(undefined, {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Typography>
                        <IconButton
                          aria-label="Next month"
                          onClick={() => {
                            setCalendarPopoverAnchor(null);
                            setCalendarDate(
                              new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)
                            );
                          }}
                        >
                          ›
                        </IconButton>
                      </Stack>
                    </Stack>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
                        gap: 0.7,
                      }}
                    >
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <Typography
                          key={`${day}${index}`}
                          variant="caption"
                          color="text.secondary"
                          textAlign="center"
                        >
                          {day}
                        </Typography>
                      ))}
                      {calendarCells.map((day, index) => {
                        if (!day) return <Box key={`blank-${index}`} />;
                        const key = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const count = (activityByDate.get(key) || []).filter(
                          (entry) => entry.completed
                        ).length;
                        const isSelected =
                          selectedCalendarKey === key && Boolean(calendarPopoverAnchor);
                        return (
                          <Box
                            key={key}
                            component="button"
                            type="button"
                            title={`${count} completed exercises`}
                            aria-label={`${displayDate(key).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}: ${count} completed exercises`}
                            aria-pressed={isSelected}
                            onClick={(event) => {
                              setSelectedCalendarKey(key);
                              setCalendarPopoverAnchor(event.currentTarget);
                            }}
                            sx={{
                              aspectRatio: '1',
                              p: 0,
                              appearance: 'none',
                              cursor: 'pointer',
                              borderRadius: 1.5,
                              display: 'grid',
                              placeItems: 'center',
                              font: 'inherit',
                              fontSize: '.8rem',
                              color: 'text.primary',
                              bgcolor: count
                                ? `rgba(46, 160, 100, ${Math.min(0.82, 0.2 + count * 0.13)})`
                                : 'action.hover',
                              border: '1px solid',
                              borderColor: isSelected
                                ? 'primary.main'
                                : count
                                  ? 'success.main'
                                  : 'divider',
                              boxShadow: isSelected
                                ? (theme) => `0 0 0 2px ${theme.palette.primary.main}33`
                                : 'none',
                              transition:
                                'transform .16s ease, border-color .16s ease, box-shadow .16s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                borderColor: 'primary.main',
                              },
                              '&:focus-visible': {
                                outline: '2px solid',
                                outlineColor: 'primary.main',
                                outlineOffset: 2,
                              },
                            }}
                          >
                            {day}
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>

                <Popover
                  open={Boolean(calendarPopoverAnchor)}
                  anchorEl={calendarPopoverAnchor}
                  onClose={() => setCalendarPopoverAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                  PaperProps={{
                    sx: {
                      width: { xs: 'min(340px, calc(100vw - 32px))', sm: 340 },
                      maxHeight: 'min(440px, calc(100vh - 32px))',
                      overflow: 'auto',
                      mt: 0.75,
                      p: 0,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '16px',
                      boxShadow: '0 18px 48px rgba(5, 12, 24, .24)',
                    },
                  }}
                  aria-labelledby="activity-day-title"
                >
                  <Box sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      gap={1}
                    >
                      <Box>
                        <Typography id="activity-day-title" variant="subtitle1" fontWeight={800}>
                          {selectedCalendarKey
                            ? displayDate(selectedCalendarKey).toLocaleDateString(undefined, {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Activity details'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedCalendarKey
                            ? displayDate(selectedCalendarKey).getFullYear()
                            : ''}{' '}
                          · {selectedDayCompleted.length} completed · {selectedDayMinutes} min
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        aria-label="Close activity details"
                        onClick={() => setCalendarPopoverAnchor(null)}
                        sx={{
                          width: 32,
                          height: 32,
                          minWidth: 32,
                          minHeight: 32,
                          borderRadius: '9px',
                        }}
                      >
                        ×
                      </IconButton>
                    </Stack>
                    <Box sx={{ height: '1px', bgcolor: 'divider', my: 1.5 }} />
                    {selectedDayEntries.length ? (
                      <Stack spacing={1}>
                        {selectedDayEntries.map((entry, index) => (
                          <Box
                            key={`${entry.name}-${index}`}
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1.1,
                              p: 1.1,
                              borderRadius: '11px',
                              bgcolor: 'action.hover',
                            }}
                          >
                            <CheckCircleOutline
                              sx={{
                                mt: 0.1,
                                fontSize: 18,
                                flexShrink: 0,
                                color: entry.completed ? 'success.main' : 'text.disabled',
                              }}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="baseline"
                                gap={1}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  sx={{ overflowWrap: 'anywhere' }}
                                >
                                  {entry.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ whiteSpace: 'nowrap' }}
                                >
                                  {entry.duration} min
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={0.7}
                                alignItems="center"
                                sx={{ mt: 0.3 }}
                              >
                                <Typography
                                  variant="caption"
                                  color={entry.completed ? 'success.main' : 'text.secondary'}
                                  fontWeight={650}
                                >
                                  {entry.completed ? 'Completed' : 'Not completed'}
                                </Typography>
                                {entry.sets.length > 0 && (
                                  <Typography variant="caption" color="text.secondary">
                                    · {entry.sets.length} sets
                                  </Typography>
                                )}
                              </Stack>
                              {entry.notes && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block', mt: 0.5, overflowWrap: 'anywhere' }}
                                >
                                  {entry.notes}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          py: 2.5,
                          px: 1.5,
                          textAlign: 'center',
                          borderRadius: '12px',
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Typography variant="body2" fontWeight={700}>
                          No activity logged
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Log a workout to start building this day.
                        </Typography>
                      </Box>
                    )}
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<Add />}
                      sx={{ mt: 1.25 }}
                      onClick={() => {
                        const selectedDate = selectedCalendarKey;
                        setCalendarPopoverAnchor(null);
                        openWorkout();
                        setWorkoutDate(selectedDate);
                      }}
                    >
                      Log workout for this day
                    </Button>
                  </Box>
                </Popover>
              </Box>
            </>
          )}
        </Stack>
      </Container>

      <ModalShell
        open={goalModalOpen}
        onClose={closeGoalForm}
        busy={savingGoal}
        maxWidth="sm"
        fullScreen={isMobile}
        title={editingGoalId ? 'Edit training goal' : 'Create a training goal'}
        subtitle="Choose a target and date range. Progress updates as you log completed workouts."
        closeLabel="Close goal form"
        leading={
          <Box
            sx={{
              width: 46,
              height: 46,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: 'primary.light',
              bgcolor: 'rgba(109,140,255,.14)',
              border: '1px solid',
              borderColor: 'rgba(109,140,255,.24)',
              borderRadius: '14px',
            }}
          >
            <FitnessCenter />
          </Box>
        }
        actions={
          <>
            <Button
              onClick={closeGoalForm}
              disabled={savingGoal}
              sx={{ minHeight: 44, borderRadius: '11px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="goal-form"
              variant="contained"
              startIcon={<Save />}
              disabled={savingGoal || !goal.target}
              sx={{ minHeight: 44, px: 2.5, borderRadius: '11px', fontWeight: 750 }}
            >
              {savingGoal ? 'Saving…' : editingGoalId ? 'Save goal' : 'Create goal'}
            </Button>
          </>
        }
      >
        <Stack component="form" id="goal-form" spacing={2} onSubmit={saveGoal}>
          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            Only completed workouts within the selected dates count toward progress.
          </Alert>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'minmax(0,1fr) minmax(130px,.45fr)' },
              gap: 1.5,
            }}
          >
            <TextField
              select
              required
              label="Goal type"
              value={goal.goalType}
              onChange={(event) => setGoal({ ...goal, goalType: event.target.value })}
            >
              <MenuItem value="workout_count">Workout days</MenuItem>
              <MenuItem value="exercise_duration">Exercise minutes</MenuItem>
            </TextField>
            <TextField
              required
              label="Target"
              type="number"
              value={goal.target}
              onChange={(event) => setGoal({ ...goal, target: event.target.value })}
              inputProps={{ min: 1, step: goal.goalType === 'workout_count' ? 1 : 'any' }}
            />
            <TextField
              required
              label="Start date"
              type="date"
              value={goal.startDate}
              onChange={(event) => setGoal({ ...goal, startDate: event.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              required
              label="End date"
              type="date"
              value={goal.endDate}
              onChange={(event) => setGoal({ ...goal, endDate: event.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Stack>
      </ModalShell>

      <ModalShell
        open={workoutOpen}
        onClose={() => setWorkoutOpen(false)}
        busy={savingWorkout}
        maxWidth="md"
        fullScreen={isMobile}
        title={editingSession ? 'Add to workout' : 'Log a workout'}
        subtitle="Capture the work you put in today."
        closeLabel="Close workout form"
        leading={
          <Box
            sx={{
              width: 46,
              height: 46,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: 'primary.light',
              bgcolor: 'rgba(109,140,255,.14)',
              border: '1px solid',
              borderColor: 'rgba(109,140,255,.24)',
              borderRadius: '14px',
            }}
          >
            <FitnessCenter />
          </Box>
        }
        actions={
          <>
            <Button
              onClick={() => setWorkoutOpen(false)}
              disabled={savingWorkout}
              sx={{ minHeight: 44, borderRadius: '11px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="workout-form"
              variant="contained"
              startIcon={<Save />}
              disabled={savingWorkout || !workoutName.trim() || Number(workoutDuration) <= 0}
              sx={{
                minHeight: 44,
                px: 2.5,
                borderRadius: '11px',
                fontWeight: 750,
                boxShadow: '0 8px 20px rgba(76,112,240,.2)',
              }}
            >
              {savingWorkout ? 'Saving…' : editingSession ? 'Save exercise' : 'Save workout'}
            </Button>
          </>
        }
      >
        <Stack component="form" id="workout-form" spacing={2.25} onSubmit={saveWorkout}>
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={750}
              letterSpacing=".1em"
              sx={{ display: 'block', mb: 1 }}
            >
              SESSION DETAILS
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                required
                type="date"
                label="Workout date"
                value={workoutDate}
                onChange={(event) => setWorkoutDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Status"
                value={workoutCompleted ? 'completed' : 'planned'}
                onChange={(event) => setWorkoutCompleted(event.target.value === 'completed')}
              >
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="planned">Planned</MenuItem>
              </TextField>
            </Box>
          </Box>
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={750}
              letterSpacing=".1em"
              sx={{ display: 'block', mb: 1 }}
            >
              EXERCISE
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'minmax(0,1fr) minmax(150px,.38fr)' },
                gap: 1.5,
              }}
            >
              <TextField
                required
                label="Exercise name"
                value={workoutName}
                onChange={(event) => setWorkoutName(event.target.value)}
                inputProps={{ maxLength: 100 }}
                placeholder="e.g. Squats"
              />
              <TextField
                required
                type="number"
                label="Duration (minutes)"
                value={workoutDuration}
                onChange={(event) => setWorkoutDuration(event.target.value)}
                inputProps={{ min: 1, step: 1 }}
              />
            </Box>
          </Box>
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={750}
              letterSpacing=".1em"
              sx={{ display: 'block', mb: 1 }}
            >
              SETS & LOAD{' '}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 0.5, letterSpacing: 0, textTransform: 'none' }}
              >
                Optional
              </Typography>
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', sm: '1fr 1fr 1fr .8fr' },
                gap: 1.25,
              }}
            >
              <TextField
                type="number"
                label="Sets"
                value={workoutSets}
                onChange={(event) => setWorkoutSets(event.target.value)}
                inputProps={{ min: 1, max: 50, step: 1 }}
              />
              <TextField
                type="number"
                label="Reps per set"
                value={workoutReps}
                onChange={(event) => setWorkoutReps(event.target.value)}
                inputProps={{ min: 1, step: 1 }}
              />
              <TextField
                type="number"
                label="Weight"
                value={workoutWeight}
                onChange={(event) => setWorkoutWeight(event.target.value)}
                inputProps={{ min: 0, step: 'any' }}
              />
              <TextField
                select
                label="Unit"
                value={workoutUnit}
                onChange={(event) => setWorkoutUnit(event.target.value)}
              >
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="lb">lb</MenuItem>
              </TextField>
            </Box>
          </Box>
          <TextField
            multiline
            minRows={2}
            maxRows={4}
            label="Notes (optional)"
            value={workoutNotes}
            onChange={(event) => setWorkoutNotes(event.target.value)}
            inputProps={{ maxLength: 1000 }}
            placeholder="How did the session feel?"
          />
        </Stack>
      </ModalShell>
    </Box>
  );
};

export default Home;
