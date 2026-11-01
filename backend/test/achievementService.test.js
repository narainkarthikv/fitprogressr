const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const User = require('../models/user.model');
const WorkoutSession = require('../models/workoutSession.model');
const Achievement = require('../models/achievement.model');
const UserAchievement = require('../models/userAchievement.model');
const { evaluateAchievements } = require('../services/achievementService');

test('awards eligible achievements and XP only once', async () => {
  const originals = {
    findById: User.findById,
    updateOne: User.updateOne,
    countDocuments: WorkoutSession.countDocuments,
    findAchievements: Achievement.find,
    findEarned: UserAchievement.find,
    createEarned: UserAchievement.create,
    startSession: mongoose.startSession,
  };

  const userId = '507f1f77bcf86cd799439011';
  const achievements = [
    {
      _id: 'achievement-workouts',
      condition: { type: 'workoutCount', threshold: 2 },
      xpReward: 10,
    },
    {
      _id: 'achievement-streak',
      condition: { type: 'streak', threshold: 3 },
      xpReward: 5,
    },
    {
      _id: 'achievement-unearned',
      condition: { type: 'workoutCount', threshold: 10 },
      xpReward: 20,
    },
  ];

  const earned = [];
  let xpAwarded = 0;

  User.findById = () => ({
    select: async () => ({ _id: userId, xp: 0, streakCount: 3 }),
  });

  WorkoutSession.countDocuments = async () => 2;
  Achievement.find = async () => achievements;

  UserAchievement.find = () => ({
    select: async () => earned.map(({ achievementId }) => ({ achievementId })),
  });

  UserAchievement.create = async (documents) => {
    earned.push(...documents);
  };

  User.updateOne = async (_filter, update) => {
    xpAwarded += update.$inc.xp;
    return { matchedCount: 1 };
  };

  mongoose.startSession = async () => ({
    withTransaction: async (callback) => callback(),
    endSession: async () => {},
  });

  try {
    const firstRun = await evaluateAchievements(userId);

    assert.equal(firstRun.length, 2);
    assert.equal(earned.length, 2);
    assert.equal(xpAwarded, 15);

    const secondRun = await evaluateAchievements(userId);

    assert.equal(secondRun.length, 0);
    assert.equal(earned.length, 2);
    assert.equal(xpAwarded, 15);
  } finally {
    User.findById = originals.findById;
    User.updateOne = originals.updateOne;
    WorkoutSession.countDocuments = originals.countDocuments;
    Achievement.find = originals.findAchievements;
    UserAchievement.find = originals.findEarned;
    UserAchievement.create = originals.createEarned;
    mongoose.startSession = originals.startSession;
  }
});
