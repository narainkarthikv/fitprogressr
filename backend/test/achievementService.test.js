const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const User = require('../models/user.model');
const WorkoutSession = require('../models/workoutSession.model');
const Exercise = require('../models/exercise.model');
const Achievement = require('../models/achievement.model');
const UserAchievement = require('../models/userAchievement.model');
const { evaluateAchievements } = require('../services/achievementService');

test('awards eligible achievements and XP only once', async () => {
  const originals = {
    findById: User.findById,
    updateOne: User.updateOne,
    findSessions: WorkoutSession.find,
    findExercise: Exercise.findOne,
    seedAchievements: Achievement.bulkWrite,
    findAchievements: Achievement.find,
    findEarned: UserAchievement.find,
    createEarned: UserAchievement.create,
    deleteEarned: UserAchievement.deleteOne,
    startSession: mongoose.startSession,
  };

  const userId = '507f1f77bcf86cd799439011';
  const achievements = [
    {
      _id: 'achievement-first-workout',
      condition: { type: 'workoutCount', threshold: 1 },
      xpReward: 10,
    },
    {
      _id: 'achievement-second-workout-day',
      condition: { type: 'workoutCount', threshold: 2 },
      xpReward: 7,
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
  let supportsTransactions = true;
  const workoutSessions = [
    { date: new Date('2026-10-28T00:00:00.000Z'), exercises: [{ completed: true }] },
  ];

  User.findById = () => ({
    select: async () => ({ _id: userId, xp: 0, streakCount: 3 }),
  });

  WorkoutSession.find = () => ({
    select: () => ({ lean: async () => workoutSessions }),
  });
  Exercise.findOne = () => ({
    select: () => ({ lean: async () => null }),
  });
  Achievement.bulkWrite = async () => {};
  Achievement.find = async () => achievements;

  UserAchievement.find = () => ({
    select: async () => earned.map(({ achievementId }) => ({ achievementId })),
  });

  UserAchievement.create = async (documents) => {
    earned.push(...documents);
  };
  UserAchievement.deleteOne = async ({ achievementId }) => {
    const index = earned.findIndex((item) => item.achievementId === achievementId);
    if (index >= 0) earned.splice(index, 1);
  };

  User.updateOne = async (_filter, update) => {
    xpAwarded += update.$inc.xp;
    return { matchedCount: 1 };
  };

  mongoose.startSession = async () => ({
    withTransaction: async (callback) => {
      if (!supportsTransactions) {
        const error = new Error(
          'Transaction numbers are only allowed on a replica set member or mongos'
        );
        error.code = 20;
        throw error;
      }
      return callback();
    },
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

    supportsTransactions = false;
    workoutSessions.push({
      date: new Date('2026-10-29T00:00:00.000Z'),
      exercises: [{ completed: true }],
    });
    const fallbackRun = await evaluateAchievements(userId);
    assert.equal(fallbackRun.length, 1);
    assert.equal(earned.length, 3);
    assert.equal(xpAwarded, 22);

    const duplicateFallbackRun = await evaluateAchievements(userId);
    assert.equal(duplicateFallbackRun.length, 0);
    assert.equal(earned.length, 3);
    assert.equal(xpAwarded, 22);
  } finally {
    User.findById = originals.findById;
    User.updateOne = originals.updateOne;
    WorkoutSession.find = originals.findSessions;
    Exercise.findOne = originals.findExercise;
    Achievement.bulkWrite = originals.seedAchievements;
    Achievement.find = originals.findAchievements;
    UserAchievement.find = originals.findEarned;
    UserAchievement.create = originals.createEarned;
    UserAchievement.deleteOne = originals.deleteEarned;
    mongoose.startSession = originals.startSession;
  }
});
