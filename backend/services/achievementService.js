const mongoose = require('mongoose');
const User = require('../models/user.model');
const WorkoutSession = require('../models/workoutSession.model');
const Achievement = require('../models/achievement.model');
const UserAchievement = require('../models/userAchievement.model');

async function evaluateAchievements(userId) {
  const [user, workoutCount, achievements, earnedAchievements] =
    await Promise.all([
      User.findById(userId).select('xp streakCount'),
      WorkoutSession.countDocuments({ userId }),
      Achievement.find({
        'condition.type': { $in: ['workoutCount', 'streak'] },
      }),
      UserAchievement.find({ userId }).select('achievementId'),
    ]);

  if (!user) return [];

  const earnedIds = new Set(
    earnedAchievements.map((item) => String(item.achievementId))
  );
  const newlyEarned = [];

  for (const achievement of achievements) {
    const condition = achievement.condition;

    if (!condition || earnedIds.has(String(achievement._id))) continue;

    const eligible =
      (condition.type === 'workoutCount' &&
        workoutCount >= condition.threshold) ||
      (condition.type === 'streak' &&
        (user.streakCount || 0) >= condition.threshold);

    if (!eligible) continue;

    const session = await mongoose.startSession();

    try {
      let awarded = false;

      await session.withTransaction(async () => {
        await UserAchievement.create(
          [{ userId, achievementId: achievement._id }],
          { session }
        );

        const result = await User.updateOne(
          { _id: userId },
          { $inc: { xp: achievement.xpReward } },
          { session }
        );

        if (result.matchedCount !== 1) {
          throw new Error('User not found while awarding achievement');
        }

        awarded = true;
      });

      if (awarded) {
        earnedIds.add(String(achievement._id));
        newlyEarned.push(achievement);
      }
    } catch (error) {
      // A concurrent request may already have awarded this achievement.
      if (error.code === 11000) continue;
      throw error;
    } finally {
      await session.endSession();
    }
  }

  return newlyEarned;
}

module.exports = { evaluateAchievements };
