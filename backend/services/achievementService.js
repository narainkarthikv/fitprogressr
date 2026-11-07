const mongoose = require('mongoose');
const User = require('../models/user.model');
const WorkoutSession = require('../models/workoutSession.model');
const Exercise = require('../models/exercise.model');
const Achievement = require('../models/achievement.model');
const UserAchievement = require('../models/userAchievement.model');
const { ensureStarterAchievements } = require('./achievementCatalog');

const isTransactionUnsupported = (error) =>
  error.code === 20 ||
  error.codeName === 'IllegalOperation' ||
  /transaction numbers are only allowed|does not support transactions|replica set member or mongos/i.test(
    error.message || ''
  );

const awardWithoutTransaction = async (userId, achievement) => {
  await UserAchievement.create([{ userId, achievementId: achievement._id }]);

  try {
    const result = await User.updateOne({ _id: userId }, { $inc: { xp: achievement.xpReward } });
    if (result.matchedCount !== 1) {
      throw new Error('User not found while awarding achievement');
    }
    return true;
  } catch (error) {
    await UserAchievement.deleteOne({ userId, achievementId: achievement._id });
    throw error;
  }
};

const awardAchievement = async (userId, achievement) => {
  const session = await mongoose.startSession();
  try {
    try {
      await session.withTransaction(async () => {
        await UserAchievement.create([{ userId, achievementId: achievement._id }], { session });

        const result = await User.updateOne(
          { _id: userId },
          { $inc: { xp: achievement.xpReward } },
          { session }
        );

        if (result.matchedCount !== 1) {
          throw new Error('User not found while awarding achievement');
        }
      });
      return true;
    } catch (error) {
      if (!isTransactionUnsupported(error)) throw error;
      // Standalone MongoDB deployments cannot run transactions. The unique
      // user/achievement index still makes this fallback safe against repeats.
      return await awardWithoutTransaction(userId, achievement);
    }
  } finally {
    await session.endSession();
  }
};

async function evaluateAchievements(userId) {
  const user = await User.findById(userId).select('xp streakCount');
  if (!user) return [];

  // Seed here too so workout logging does not depend on the dashboard catalog
  // endpoint having been requested first.
  await ensureStarterAchievements(Achievement);

  const [sessions, exerciseData, achievements, earnedAchievements] = await Promise.all([
    WorkoutSession.find({ userId }).select('date exercises').lean(),
    Exercise.findOne({ userId }).select('Exercises.date Exercises.exerciseCheck').lean(),
    Achievement.find({
      'condition.type': { $in: ['workoutCount', 'streak'] },
    }),
    UserAchievement.find({ userId }).select('achievementId'),
  ]);

  const workoutDays = new Set();
  sessions.forEach((session) => {
    if ((session.exercises || []).some((exercise) => exercise.completed)) {
      workoutDays.add(new Date(session.date).toISOString().slice(0, 10));
    }
  });
  (exerciseData?.Exercises || []).forEach((exercise) => {
    if (exercise.exerciseCheck && exercise.date) {
      workoutDays.add(new Date(exercise.date).toISOString().slice(0, 10));
    }
  });
  const workoutCount = workoutDays.size;

  const earnedIds = new Set(earnedAchievements.map((item) => String(item.achievementId)));
  const newlyEarned = [];

  for (const achievement of achievements) {
    const condition = achievement.condition;

    if (!condition || earnedIds.has(String(achievement._id))) continue;

    const eligible =
      (condition.type === 'workoutCount' && workoutCount >= condition.threshold) ||
      (condition.type === 'streak' && (user.streakCount || 0) >= condition.threshold);

    if (!eligible) continue;

    try {
      const awarded = await awardAchievement(userId, achievement);
      if (awarded) {
        earnedIds.add(String(achievement._id));
        newlyEarned.push(achievement);
      }
    } catch (error) {
      // A concurrent request may already have awarded this achievement.
      if (error.code === 11000) continue;
      throw error;
    }
  }

  return newlyEarned;
}

module.exports = { evaluateAchievements };
