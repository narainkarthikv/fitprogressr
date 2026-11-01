const Exercise = require('../models/exercise.model');
const WorkoutSession = require('../models/workoutSession.model');
const Goal = require('../models/goal.model');
const User = require('../models/user.model');

const dayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const completedWork = (sessions, exerciseData, start, end) => {
  const days = new Set();
  let minutes = 0;
  const add = (dateValue, exercises) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime()) || date < start || date > end) return;
    const done = exercises.filter((item) => item.completed === true || item.exerciseCheck === true);
    if (done.length) days.add(dayKey(date));
    minutes += done.reduce((sum, item) => {
      const value = Number(item.duration);
      return sum + (Number.isFinite(value) && value > 0 ? value : 0);
    }, 0);
  };

  sessions.forEach((session) => add(session.date, session.exercises || []));
  (exerciseData?.Exercises || []).forEach((item) => add(item.date, [item]));
  return { workoutCount: days.size, exerciseDuration: minutes };
};

const calculateGoalProgress = async (goal, exerciseData = null, sessions = null) => {
  const [workoutSessions, legacyExercises] = await Promise.all([
    sessions === null ? WorkoutSession.find({ userId: goal.userId }).lean() : sessions,
    exerciseData === null ? Exercise.findOne({ userId: goal.userId }).lean() : exerciseData,
  ]);
  const start = new Date(goal.startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(goal.endDate);
  end.setUTCHours(23, 59, 59, 999);
  const result = completedWork(workoutSessions || [], legacyExercises, start, end);
  const progressKey = goal.goalType === 'workout_count' ? 'workoutCount' : 'exerciseDuration';
  return Math.min(result[progressKey] || 0, goal.target);
};

const updateUserGoalProgress = async (userId) => {
  const goals = await Goal.find({ userId });
  if (!goals.length) return;
  const [sessions, exerciseData] = await Promise.all([
    WorkoutSession.find({ userId }).lean(),
    Exercise.findOne({ userId }).lean(),
  ]);

  for (const goal of goals) {
    const start = new Date(goal.startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(goal.endDate);
    end.setUTCHours(23, 59, 59, 999);
    const progressKey = goal.goalType === 'workout_count' ? 'workoutCount' : 'exerciseDuration';
    const progress = completedWork(sessions, exerciseData, start, end)[progressKey];
    const boundedProgress = Math.min(progress, goal.target);
    if (goal.progress !== boundedProgress) {
      goal.progress = boundedProgress;
      await goal.save();
    }
  }
};

const updateUserActivityProgress = async (userId) => {
  const [sessions, exerciseData] = await Promise.all([
    WorkoutSession.find({ userId }).select('date exercises').lean(),
    Exercise.findOne({ userId }).select('Exercises.date Exercises.exerciseCheck').lean(),
  ]);
  const activeDays = new Set();
  sessions.forEach((session) => {
    if ((session.exercises || []).some((item) => item.completed)) {
      const key = dayKey(session.date);
      if (key) activeDays.add(key);
    }
  });
  (exerciseData?.Exercises || []).forEach((item) => {
    if (item.exerciseCheck && item.date) {
      const key = dayKey(item.date);
      if (key) activeDays.add(key);
    }
  });

  const today = new Date();
  const todayKey = dayKey(today);
  const currentWeek = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  currentWeek.setUTCDate(currentWeek.getUTCDate() - currentWeek.getUTCDay());
  const dayCheck = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentWeek);
    date.setUTCDate(currentWeek.getUTCDate() + index);
    return activeDays.has(dayKey(date));
  });

  const activeDaysThisWeek = dayCheck.filter(Boolean).length;

  // A Duolingo-style streak counts consecutive active calendar days. Today's
  // streak remains alive through the current day if the latest workout was
  // yesterday; it resets once a full day is missed.
  let streakCount = 0;
  const cursor = new Date(`${todayKey}T00:00:00.000Z`);
  if (!activeDays.has(todayKey)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (activeDays.has(dayKey(cursor))) {
    streakCount += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  await User.findByIdAndUpdate(userId, {
    $set: {
      dayCheck,
      totalDays: activeDaysThisWeek,
      streakCount,
      lastActiveDate: activeDays.size
        ? new Date(`${[...activeDays].sort().at(-1)}T00:00:00.000Z`)
        : null,
    },
  });
  await updateUserGoalProgress(userId);
  return { dayCheck, streakCount, activeDaysThisWeek };
};

module.exports = { calculateGoalProgress, updateUserGoalProgress, updateUserActivityProgress };
