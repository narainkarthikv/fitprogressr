const test = require('node:test');
const assert = require('node:assert/strict');

const Exercise = require('../models/exercise.model');
const Goal = require('../models/goal.model');
const User = require('../models/user.model');
const WorkoutSession = require('../models/workoutSession.model');
const { updateUserActivityProgress } = require('../services/goalProgress');

const originals = {
  exerciseFindOne: Exercise.findOne,
  goalFind: Goal.find,
  userFindByIdAndUpdate: User.findByIdAndUpdate,
  workoutSessionFind: WorkoutSession.find,
};

const utcDay = (offset) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
};

const makeQuery = (value) => ({
  select() {
    return this;
  },
  lean: async () => value,
});

const withActivity = async (sessionOffsets, t) => {
  const sessions = sessionOffsets.map((offset) => ({
    date: utcDay(offset),
    exercises: [{ completed: true, duration: 30 }],
  }));
  WorkoutSession.find = () => makeQuery(sessions);
  Exercise.findOne = () => makeQuery({ Exercises: [] });
  Goal.find = async () => [];
  User.findByIdAndUpdate = async () => null;
  t.after(() => {
    Exercise.findOne = originals.exerciseFindOne;
    Goal.find = originals.goalFind;
    User.findByIdAndUpdate = originals.userFindByIdAndUpdate;
    WorkoutSession.find = originals.workoutSessionFind;
  });
  return updateUserActivityProgress('507f1f77bcf86cd799439011');
};

test('daily streak stays active through today when the last session was yesterday', async (t) => {
  const progress = await withActivity([-2, -1], t);
  assert.equal(progress.streakCount, 2);
  assert.equal(progress.dayCheck.length, 7);
  assert.equal('weeklyStreakCount' in progress, false);
});

test('daily streak resets after a missed day', async (t) => {
  const progress = await withActivity([-2], t);
  assert.equal(progress.streakCount, 0);
});

test('daily streak counts consecutive sessions through today', async (t) => {
  const progress = await withActivity([-2, -1, 0], t);
  assert.equal(progress.streakCount, 3);
});
