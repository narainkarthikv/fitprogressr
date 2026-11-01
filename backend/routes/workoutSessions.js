
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const WorkoutSession = require('../models/workoutSession.model');
const achievementService = require('../services/achievementService');
const verifyToken = require('../middleware/jwtAuth');
const { getApiErrorResponse } = require('../utils/apiErrors');
const { sanitizePlainText } = require('../utils/sanitize');

router.use(verifyToken);

const getUtcDay = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
};

const validateExercises = (exercises) => {
  if (!Array.isArray(exercises)) {
    return 'Exercises must be an array';
  }

  for (const exercise of exercises) {
    if (
      !exercise ||
      typeof exercise.name !== 'string' ||
      !sanitizePlainText(exercise.name) ||
      typeof exercise.duration !== 'number' ||
      !Number.isFinite(exercise.duration) ||
      exercise.duration < 0
    ) {
      return 'Each exercise must have a valid name and non-negative duration';
    }

    if (
      exercise.completed !== undefined &&
      typeof exercise.completed !== 'boolean'
    ) {
      return 'Exercise completed must be a boolean';
    }
  }

  return null;
};

// Create a workout session
router.post('/', async (req, res) => {
  try {
    const { date, exercises = [] } = req.body || {};
    const sessionDate = getUtcDay(date);

    if (!sessionDate) {
      return res.status(422).json({ error: 'Invalid date value' });
    }

    const validationError = validateExercises(exercises);
    if (validationError) {
      return res.status(422).json({ error: validationError });
    }

    const session = await WorkoutSession.create({
      userId: req.user.id,
      date: sessionDate,
      exercises: exercises.map((exercise) => ({
        name: sanitizePlainText(exercise.name),
        duration: exercise.duration,
        completed: exercise.completed ?? false,
      })),
    });

    try {
      await achievementService.evaluateAchievements(req.user.id);
    } catch (achievementError) {
      // Gamification failures must not fail an already-saved workout.
      console.error('Achievement evaluation failed:', achievementError.message);
    }

    return res.status(201).json(session);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'A workout session already exists for this date',
      });
    }

    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

// List the authenticated user's sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({
      userId: req.user.id,
    }).sort({ date: -1 });

    return res.json(sessions);
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

// Get one session
router.get('/:sessionId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = await WorkoutSession.findOne({
      _id: req.params.sessionId,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ error: 'Workout session not found' });
    }

    return res.json(session);
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

// Update a session
router.put('/:sessionId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const { date, exercises } = req.body || {};
    const updates = {};

    if (date !== undefined) {
      const sessionDate = getUtcDay(date);

      if (!sessionDate) {
        return res.status(422).json({ error: 'Invalid date value' });
      }

      updates.date = sessionDate;
    }

    if (exercises !== undefined) {
      const validationError = validateExercises(exercises);

      if (validationError) {
        return res.status(422).json({ error: validationError });
      }

      updates.exercises = exercises.map((exercise) => ({
        name: sanitizePlainText(exercise.name),
        duration: exercise.duration,
        completed: exercise.completed ?? false,
      }));
    }

    if (Object.keys(updates).length === 0) {
      return res.status(422).json({
        error: 'Provide date or exercises to update',
      });
    }

    const session = await WorkoutSession.findOneAndUpdate(
      {
        _id: req.params.sessionId,
        userId: req.user.id,
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Workout session not found' });
    }

    return res.json(session);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'A workout session already exists for this date',
      });
    }

    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

// Delete a session
router.delete('/:sessionId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = await WorkoutSession.findOneAndDelete({
      _id: req.params.sessionId,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ error: 'Workout session not found' });
    }

    return res.status(204).end();
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

module.exports = router;
