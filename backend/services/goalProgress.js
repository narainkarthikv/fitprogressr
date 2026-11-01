const Exercise = require('../models/exercise.model');
const Goal = require('../models/goal.model');

const getUtcDayStart = (date) => {
  const value = new Date(date);
  value.setUTCHours(0, 0, 0, 0);
  return value;
};

const getUtcDayEnd = (date) => {
  const value = new Date(date);
  value.setUTCHours(23, 59, 59, 999);
  return value;
};

const calculateGoalProgress = async (goal, exerciseData = null) => {
  if (exerciseData === null) {
    exerciseData = await Exercise.findOne({
      userId: goal.userId,
    }).lean();
  }

  if (!exerciseData || !Array.isArray(exerciseData.Exercises)) {
    return 0;
  }

  const start = getUtcDayStart(goal.startDate);
  const end = getUtcDayEnd(goal.endDate);

  const completedExercises = exerciseData.Exercises.filter((exercise) => {
    if (exercise.exerciseCheck !== true || !exercise.date) return false;

    const activityDate = new Date(exercise.date);

    return (
      !Number.isNaN(activityDate.getTime()) &&
      activityDate >= start &&
      activityDate <= end
    );
  });

  if (goal.goalType === 'workout_count') {
    const workoutDays = new Set(
      completedExercises.map((exercise) =>
        new Date(exercise.date).toISOString().slice(0, 10)
      )
    );

    return Math.min(workoutDays.size, goal.target);
  }

  if (goal.goalType === 'exercise_duration') {
    const totalDuration = completedExercises.reduce((total, exercise) => {
      const duration = Number(exercise.duration);
      return total + (Number.isFinite(duration) && duration > 0 ? duration : 0);
    }, 0);

    return Math.min(totalDuration, goal.target);
  }

  return 0;
};

const updateUserGoalProgress = async (userId) => {
  const goals = await Goal.find({ userId });

  if (!goals.length) return;

  const exerciseData = await Exercise.findOne({ userId }).lean();

  for (const goal of goals) {
    const progress = await calculateGoalProgress(goal, exerciseData);

    if (goal.progress !== progress) {
      goal.progress = progress;
      await goal.save();
    }
  }
};

module.exports = {
  calculateGoalProgress,
  updateUserGoalProgress,
};
