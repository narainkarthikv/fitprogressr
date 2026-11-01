const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'goal-route-test-secret';

const Goal = require('../models/goal.model');
const Exercise = require('../models/exercise.model');
const goalRouter = require('../routes/goals');
const { validateApiResponse } = require('../utils/responseSchemas');

test('goal routes support CRUD operations and enforce ownership', async () => {
  const originalExerciseFindOne = Exercise.findOne;
  const originalCreate = Goal.create;
  const originalFind = Goal.find;
  const originalFindById = Goal.findById;
  const originalFindOne = Goal.findOne;
  const originalFindOneAndUpdate = Goal.findOneAndUpdate;
  const originalFindOneAndDelete = Goal.findOneAndDelete;

  const userId = '507f1f77bcf86cd799439011';
  const otherUserId = '507f1f77bcf86cd799439012';
  const goalId = new mongoose.Types.ObjectId().toString();

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
  const otherToken = jwt.sign({ id: otherUserId }, process.env.JWT_SECRET);

  let storedGoal = null;

  const createGoalRecord = (data) => ({
    _id: goalId,
    userId,
    ...data,
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  Exercise.findOne = () => ({
    lean: async () => ({ Exercises: [] }),
  });

  Goal.create = async (data) => {
    storedGoal = createGoalRecord(data);
    return storedGoal;
  };

  Goal.find = (filter) => {
    const results = storedGoal ? [storedGoal] : [];

    // Support both the progress service and the GET list query.
    results.sort = async () => results;
    return results;
  };

  Goal.findById = async (id) => (
    storedGoal && storedGoal._id === String(id) ? storedGoal : null
  );

  Goal.findOne = async (filter) => {
    if (
      storedGoal &&
      storedGoal._id === String(filter._id) &&
      String(storedGoal.userId) === String(filter.userId)
    ) {
      return storedGoal;
    }
    return null;
  };

  Goal.findOneAndUpdate = async (filter, update) => {
    if (
      !storedGoal ||
      storedGoal._id !== String(filter._id) ||
      String(storedGoal.userId) !== String(filter.userId)
    ) {
      return null;
    }

    Object.assign(storedGoal, update.$set);
    return storedGoal;
  };

  Goal.findOneAndDelete = async (filter) => {
    if (
      !storedGoal ||
      storedGoal._id !== String(filter._id) ||
      String(storedGoal.userId) !== String(filter.userId)
    ) {
      return null;
    }

    const deleted = storedGoal;
    storedGoal = null;
    return deleted;
  };

  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    const sendJson = res.json.bind(res);

    res.json = (body) => {
      if (!validateApiResponse({
        method: req.method,
        routePath: req.route?.path,
        baseUrl: req.baseUrl || '',
        statusCode: res.statusCode,
        body,
      })) {
        res.statusCode = 500;
        return sendJson({ error: 'Internal server error' });
      }

      return sendJson(body);
    };

    next();
  });

  app.use('/api/goals', goalRouter);

  const validPayload = {
    goalType: 'workout_count',
    target: 20,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  };

  try {
    const unauthorized = await request(app)
      .post(`/api/goals/${userId}`)
      .send(validPayload);

    assert.equal(unauthorized.status, 401);

    const invalidPayload = await request(app)
      .post(`/api/goals/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validPayload, target: -1 });

    assert.equal(invalidPayload.status, 422);

    const created = await request(app)
      .post(`/api/goals/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload);

    assert.equal(created.status, 201);
    assert.equal(created.body.goal.goalType, 'workout_count');
    assert.equal(created.body.goal.target, 20);

    const list = await request(app)
      .get(`/api/goals/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(list.status, 200);
    assert.equal(list.body.length, 1);

    const fetched = await request(app)
      .get(`/api/goals/${userId}/${goalId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(fetched.status, 200);
    assert.equal(fetched.body._id, goalId);

    const invalidId = await request(app)
      .get(`/api/goals/${userId}/invalid-id`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(invalidId.status, 422);

    const forbidden = await request(app)
      .get(`/api/goals/${userId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    assert.equal(forbidden.status, 403);

    const updated = await request(app)
      .put(`/api/goals/${userId}/${goalId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...validPayload,
        goalType: 'exercise_duration',
        target: 300,
      });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.goal.goalType, 'exercise_duration');
    assert.equal(updated.body.goal.target, 300);

    const deleted = await request(app)
      .delete(`/api/goals/${userId}/${goalId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(deleted.status, 204);

    const missing = await request(app)
      .get(`/api/goals/${userId}/${goalId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(missing.status, 404);
  } finally {
    Exercise.findOne = originalExerciseFindOne;
    Goal.create = originalCreate;
    Goal.find = originalFind;
    Goal.findById = originalFindById;
    Goal.findOne = originalFindOne;
    Goal.findOneAndUpdate = originalFindOneAndUpdate;
    Goal.findOneAndDelete = originalFindOneAndDelete;
  }
});
