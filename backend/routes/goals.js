const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Goal = require('../models/goal.model');
const verifyToken = require('../middleware/jwtAuth');
const { ensureSelf } = require('../middleware/accessControl');
const { updateUserGoalProgress } = require('../services/goalProgress');
const { getApiErrorResponse } = require('../utils/apiErrors');

const validGoalTypes = ['workout_count', 'exercise_duration'];

const parseGoalPayload = (body) => {
  const { goalType, target, startDate, endDate } = body || {};

  if (!validGoalTypes.includes(goalType)) {
    return { error: 'Invalid goal type' };
  }

  if (
    typeof target !== 'number' ||
    !Number.isFinite(target) ||
    target <= 0 ||
    (goalType === 'workout_count' && !Number.isInteger(target))
  ) {
    return {
      error: goalType === 'workout_count'
        ? 'Workout target must be a positive integer'
        : 'Target must be a positive number',
    };
  }

  if (
    typeof startDate !== 'string' ||
    typeof endDate !== 'string' ||
    !startDate.trim() ||
    !endDate.trim()
  ) {
    return { error: 'Invalid goal date range' };
  }

  const isValidDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  };

  if (!isValidDate(startDate) || !isValidDate(endDate) || startDate > endDate) {
    return { error: 'Invalid goal date range. Use valid YYYY-MM-DD dates.' };
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  return {
    data: {
      goalType,
      target,
      startDate: start,
      endDate: end,
    },
  };
};

router.post('/:userId', verifyToken, ensureSelf('userId'), async (req, res) => {
  try {
    const parsed = parseGoalPayload(req.body);
    if (parsed.error) return res.status(422).json({ error: parsed.error });

    const goal = await Goal.create({
      userId: new mongoose.Types.ObjectId(req.params.userId),
      ...parsed.data,
    });

    await updateUserGoalProgress(req.params.userId);
    const updatedGoal = await Goal.findById(goal._id);

    return res.status(201).json({
      message: 'Goal created successfully',
      goal: updatedGoal,
    });
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

router.get('/:userId', verifyToken, ensureSelf('userId'), async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    return res.status(200).json(goals);
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

router.get('/:userId/:goalId', verifyToken, ensureSelf('userId'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(422).json({ error: 'Invalid goal ID' });
    }

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.params.userId,
    });

    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    return res.status(200).json(goal);
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

router.put('/:userId/:goalId', verifyToken, ensureSelf('userId'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(422).json({ error: 'Invalid goal ID' });
    }

    const parsed = parseGoalPayload(req.body);
    if (parsed.error) return res.status(422).json({ error: parsed.error });

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.goalId, userId: req.params.userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    await updateUserGoalProgress(req.params.userId);
    const updatedGoal = await Goal.findById(goal._id);

    return res.status(200).json({
      message: 'Goal updated successfully',
      goal: updatedGoal,
    });
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

router.delete('/:userId/:goalId', verifyToken, ensureSelf('userId'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(422).json({ error: 'Invalid goal ID' });
    }

    const goal = await Goal.findOneAndDelete({
      _id: req.params.goalId,
      userId: req.params.userId,
    });

    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    return res.status(204).end();
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

module.exports = router;
