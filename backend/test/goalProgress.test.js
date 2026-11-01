const test = require('node:test');
const assert = require('node:assert/strict');

const Exercise = require('../models/exercise.model');
const Goal = require('../models/goal.model');

const {
  calculateGoalProgress,
  updateUserGoalProgress,
} = require('../services/goalProgress');

const originalFindOne = Exercise.findOne;
const originalGoalFind = Goal.find;

const createExerciseData = (Exercises) => ({
  Exercises,
});

const createGoal = (goalType, target = 100) => ({
  userId: '507f1f77bcf86cd799439011',
  goalType,
  target,
  startDate: new Date('2026-10-01T00:00:00.000Z'),
  endDate: new Date('2026-10-31T23:59:59.999Z'),
});

test('calculates workout progress using distinct completed activity days', async () => {
  Exercise.findOne = () => ({
    lean: async () => createExerciseData([
      { date: new Date('2026-10-10T08:00:00Z'), exerciseCheck: true, duration: 20 },
      { date: new Date('2026-10-10T09:00:00Z'), exerciseCheck: true, duration: 30 },
      { date: new Date('2026-10-11T08:00:00Z'), exerciseCheck: true, duration: 25 },
      { date: new Date('2026-10-12T08:00:00Z'), exerciseCheck: false, duration: 40 },
    ]),
  });

  try {
    const progress = await calculateGoalProgress(createGoal('workout_count'));
    assert.equal(progress, 2);
  } finally {
    Exercise.findOne = originalFindOne;
  }
});

test('calculates completed exercise duration and caps progress at target', async () => {
  Exercise.findOne = () => ({
    lean: async () => createExerciseData([
      { date: new Date('2026-10-10T08:00:00Z'), exerciseCheck: true, duration: 45 },
      { date: new Date('2026-10-11T08:00:00Z'), exerciseCheck: true, duration: 60 },
      { date: new Date('2026-10-12T08:00:00Z'), exerciseCheck: false, duration: 90 },
    ]),
  });

  try {
    const progress = await calculateGoalProgress(
      createGoal('exercise_duration', 100)
    );
    assert.equal(progress, 100);
  } finally {
    Exercise.findOne = originalFindOne;
  }
});

test('returns zero when no exercise data exists', async () => {
  Exercise.findOne = () => ({
    lean: async () => null,
  });

  try {
    const progress = await calculateGoalProgress(createGoal('workout_count'));
    assert.equal(progress, 0);
  } finally {
    Exercise.findOne = originalFindOne;
  }
});

test('updates only goals whose calculated progress has changed', async () => {
  let savedCount = 0;

  const goals = [
    {
      ...createGoal('workout_count', 10),
      progress: 0,
      async save() {
        savedCount += 1;
      },
    },
  ];

  Exercise.findOne = () => ({
    lean: async () => createExerciseData([
      { date: new Date(), exerciseCheck: true, duration: 30 },
    ]),
  });

  Goal.find = async () => goals;

  try {
    await updateUserGoalProgress('507f1f77bcf86cd799439011');
    assert.equal(goals[0].progress, 1);
    assert.equal(savedCount, 1);

    await updateUserGoalProgress('507f1f77bcf86cd799439011');
    assert.equal(savedCount, 1);
  } finally {
    Exercise.findOne = originalFindOne;
    Goal.find = originalGoalFind;
  }
});
