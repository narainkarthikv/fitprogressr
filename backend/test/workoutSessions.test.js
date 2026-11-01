const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'route-test-secret';

const WorkoutSession = require('../models/workoutSession.model');
const achievementService = require('../services/achievementService');
const workoutSessionsRouter = require('../routes/workoutSessions');
const { validateApiResponse } = require('../utils/responseSchemas');

test('workout session CRUD validates input, scopes access to the user, and returns valid responses', async () => {
  const originalCreate = WorkoutSession.create;
  const originalEvaluateAchievements = achievementService.evaluateAchievements;
  const originalFind = WorkoutSession.find;
  const originalFindOne = WorkoutSession.findOne;
  const originalFindOneAndUpdate = WorkoutSession.findOneAndUpdate;
  const originalFindOneAndDelete = WorkoutSession.findOneAndDelete;

  const userId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439012';

  const session = {
    _id: sessionId,
    userId,
    date: new Date('2026-10-25T00:00:00.000Z'),
    exercises: [{ _id: '507f1f77bcf86cd799439013', name: 'Running', duration: 30, completed: false }],
    createdAt: new Date('2026-10-25T00:00:00.000Z'),
    updatedAt: new Date('2026-10-25T00:00:00.000Z'),
  };

  let createCalls = 0;
  let findOneQuery;
  let updateQuery;
  let deleteQuery;

  achievementService.evaluateAchievements = async () => [];

  WorkoutSession.create = async (data) => {
    createCalls++;
    return { ...session, ...data, _id: sessionId };
  };

  WorkoutSession.find = () => ({
    sort: async () => [session],
  });

  WorkoutSession.findOne = async (query) => {
    findOneQuery = query;
    return session;
  };

  WorkoutSession.findOneAndUpdate = async (query, update, options) => {
    updateQuery = { query, update, options };
    return { ...session, exercises: update.$set.exercises || session.exercises };
  };

  WorkoutSession.findOneAndDelete = async (query) => {
    deleteQuery = query;
    return session;
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

  app.use('/api/workout-sessions', workoutSessionsRouter);

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
  const auth = { Authorization: `Bearer ${token}` };

  try {
    const invalidCreate = await request(app)
      .post('/api/workout-sessions')
      .set(auth)
      .send({ date: 'not-a-date', exercises: [] });

    assert.equal(invalidCreate.status, 422);
    assert.equal(createCalls, 0);

    const invalidExercise = await request(app)
      .post('/api/workout-sessions')
      .set(auth)
      .send({
        date: '2026-10-25',
        exercises: [{ name: 'Running', duration: -1 }],
      });

    assert.equal(invalidExercise.status, 422);
    assert.equal(createCalls, 0);

    const created = await request(app)
      .post('/api/workout-sessions')
      .set(auth)
      .send({
        date: '2026-10-25T15:30:00Z',
        exercises: [{ name: '<b>Running</b>', duration: 30 }],
      });

    assert.equal(created.status, 201);
    assert.equal(created.body.exercises[0].name, 'Running');
    assert.equal(created.body.exercises[0].completed, false);

    const listed = await request(app)
      .get('/api/workout-sessions')
      .set(auth);

    assert.equal(listed.status, 200);
    assert.equal(listed.body.length, 1);

    const fetched = await request(app)
      .get(`/api/workout-sessions/${sessionId}`)
      .set(auth);

    assert.equal(fetched.status, 200);
    assert.equal(findOneQuery.userId, userId);
    assert.equal(findOneQuery._id, sessionId);

    const invalidId = await request(app)
      .get('/api/workout-sessions/not-an-id')
      .set(auth);

    assert.equal(invalidId.status, 400);

    const updated = await request(app)
      .put(`/api/workout-sessions/${sessionId}`)
      .set(auth)
      .send({ exercises: [{ name: 'Cycling', duration: 20, completed: true }] });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.exercises[0].name, 'Cycling');
    assert.equal(updateQuery.query.userId, userId);
    assert.equal(updateQuery.options.runValidators, true);

    const deleted = await request(app)
      .delete(`/api/workout-sessions/${sessionId}`)
      .set(auth);

    assert.equal(deleted.status, 204);
    assert.equal(deleteQuery.userId, userId);
    assert.equal(deleteQuery._id, sessionId);
  } finally {
    achievementService.evaluateAchievements = originalEvaluateAchievements;
    WorkoutSession.create = originalCreate;
    WorkoutSession.find = originalFind;
    WorkoutSession.findOne = originalFindOne;
    WorkoutSession.findOneAndUpdate = originalFindOneAndUpdate;
    WorkoutSession.findOneAndDelete = originalFindOneAndDelete;
  }
});
