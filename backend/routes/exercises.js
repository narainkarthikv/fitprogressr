const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise.model');
const verifyToken = require('../middleware/jwtAuth.js');
const { ensureAdmin, ensureSelf } = require('../middleware/accessControl');
const {
  normalizeDate,
  normalizeDayKey,
  toObjectId,
  buildUserIdFilter,
} = require('../utils/helpers');
const { validateExercisePayload, validateMonth } = require('../utils/validators');
const { getApiErrorResponse } = require('../utils/apiErrors');
const { sanitizePlainText } = require('../utils/sanitize');

router.get('/', verifyToken, ensureAdmin, async (req, res) => {
  try {
    const ExerciseData = await Exercise.find({});
    if (!ExerciseData) {
      return res.status(404).json({ error: 'Exercise data not found for this ID.' });
    }
    return res.json(ExerciseData);
  } catch (error) {
    console.error('Error fetching exercise data:', error);
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

router.get('/:userId/exercises_list', verifyToken, ensureSelf('userId'), async (req, res) => {
  const { userId } = req.params;
  try {
    const exerciseData = await Exercise.findOne(buildUserIdFilter(userId));
    if (!exerciseData) {
      return res.status(404).json({ error: 'Exercise data not found for this userId.' });
    }
    return res.json(exerciseData);
  } catch (error) {
    console.error('Error fetching exercise data:', error);
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

router.post('/:userId/add', verifyToken, ensureSelf('userId'), async (req, res) => {
  const { userId } = req.params;
  const { description, duration, exerciseCheck } = req.body || {};

  try {
    if (typeof duration !== 'number' && !(typeof duration === 'string' && duration.trim() !== '')) {
      return res.status(422).json({ error: 'Duration must be a positive number' });
    }
    const parsedDuration = Number(duration);
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      return res.status(422).json({ error: 'Duration must be a positive number' });
    }
    const sanitizedDescription = sanitizePlainText(description);
    if (!sanitizedDescription) return res.status(422).json({ error: 'Description must contain 1 to 500 characters of plain text' });
    const validationError = validateExercisePayload({
      description: sanitizedDescription,
      duration: parsedDuration,
      exerciseCheck,
    });
    if (validationError) return res.status(422).json({ error: validationError });

    const exercisesData = await Exercise.findOne(buildUserIdFilter(userId));
    if (!exercisesData) {
      return res.status(404).json({ error: 'Exercise data not found for this userId.' });
    }
    const exerciseEntry = {
      description: sanitizedDescription,
      duration: parsedDuration,
      exerciseCheck,
    };

    exercisesData.Exercises.push(exerciseEntry);
    await exercisesData.save();
    res.status(201).json({
      message: 'Exercise added successfully',
      newExercise: exercisesData.Exercises[exercisesData.Exercises.length - 1],
    });
  } catch (error) {
    console.error('Error adding exercise:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

router.delete(
  '/:userId/exercises_list/:exerciseId',
  verifyToken,
  ensureSelf('userId'),
  async (req, res) => {
    const { userId, exerciseId } = req.params;
    try {
      const exerciseData = await Exercise.findOne(buildUserIdFilter(userId));
      if (!exerciseData) {
        return res.status(404).json({ error: 'Exercise data not found for this userId.' });
      }
      const exerciseToRemove = exerciseData.Exercises.id(exerciseId);
      if (!exerciseToRemove) {
        return res.status(404).json({ error: 'Exercise not found in exercise data.' });
      }
      exerciseToRemove.deleteOne();
      await exerciseData.save();
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting Exercise:', error);
      const apiError = getApiErrorResponse(error);
      res.status(apiError.status).json(apiError.body);
    }
  }
);

router.post('/:userId/track-exercise', verifyToken, ensureSelf('userId'), async (req, res) => {
  const { userId } = req.params;
  const { date, count } = req.body || {};

  try {
    if ((typeof count !== 'number' && !(typeof count === 'string' && count.trim() !== '')) || !Number.isFinite(Number(count)) || Number(count) < 0) {
      return res.status(422).json({ error: 'Invalid count value' });
    }

    const parsedDate = normalizeDate(date);
    if (!parsedDate) {
      return res.status(422).json({ error: 'Invalid date value' });
    }

    const exerciseData = await Exercise.findOne(buildUserIdFilter(userId));
    if (!exerciseData) {
      return res.status(404).json({ error: 'Exercise data not found for this userId.' });
    }

    // Always update the exercise for the given date or add a new entry without restriction
    const existingEntryIndex = exerciseData.trackExercises.findIndex(
      (entry) => entry.date && normalizeDayKey(entry.date) === normalizeDayKey(parsedDate)
    );

    if (existingEntryIndex !== -1) {
      // If an entry exists, update it
      exerciseData.trackExercises[existingEntryIndex].totalExercises = Number(count);
    } else {
      // If no entry exists, add a new one
      exerciseData.trackExercises.push({
        date: parsedDate,
        totalExercises: Number(count),
      });
    }

    await exerciseData.save();
    res.status(existingEntryIndex === -1 ? 201 : 200).json({
      message: 'Exercise data updated successfully',
      data: exerciseData.trackExercises,
    });
  } catch (error) {
    console.error('Error updating exercise data:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

// Get exercise data for a specific month
router.get('/:userId/data/:month', verifyToken, ensureSelf('userId'), async (req, res) => {
  const { month, userId } = req.params;
  try {
    const monthError = validateMonth(month);
    if (monthError) return res.status(422).json({ error: monthError });
    const year = new Date().getFullYear();
    const monthIndex = Number.isInteger(Number(month))
      ? Number(month) - 1
      : new Date(`${month} 1, ${year}`).getMonth();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, startDate.getMonth() + 1, 0); // last day of the month

    const userIdObject = toObjectId(userId);
    const userIdMatch = userIdObject
      ? {
          $or: [{ $eq: ['$userId', userIdObject] }, { $eq: [{ $toString: '$userId' }, userId] }],
        }
      : { $eq: [{ $toString: '$userId' }, userId] };

    // Find exercises within the date range
    const exerciseData = await Exercise.aggregate([
      {
        $unwind: '$trackExercises',
      },
      {
        $match: {
          'trackExercises.date': {
            $gte: startDate,
            $lt: new Date(endDate.getTime() + 24 * 60 * 60 * 1000), // inclusive of last day
          },
          $expr: userIdMatch,
        },
      },
      {
        $project: {
          _id: 0,
          date: '$trackExercises.date',
          count: '$trackExercises.totalExercises',
        },
      },
    ]);

    // If data is found, send it; otherwise, return an empty array
    if (exerciseData.length > 0) {
      res.status(200).json(exerciseData);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error('Error fetching exercise data:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

module.exports = router;
