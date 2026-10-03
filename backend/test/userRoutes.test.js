const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'route-test-secret';
const User = require('../models/user.model');
const Exercise = require('../models/exercise.model');
const RateLimit = require('../models/rateLimit.model');
const userRouter = require('../routes/user');
const exerciseRouter = require('../routes/exercises');
const { validateApiResponse } = require('../utils/responseSchemas');

test('user routes validate before queries, sanitize fields, and return safe contracts', async () => {
  const originalFindOne = User.findOne;
  const originalFindById = User.findById;
  const originalUserSave = User.prototype.save;
  const originalExerciseSave = Exercise.prototype.save;
  const originalExerciseFindOne = Exercise.findOne;
  const originalRateLimitFindOneAndUpdate = RateLimit.findOneAndUpdate;
  let userQueries = 0;
  let createExerciseSaveCount = 0;
  let exerciseQueries = 0;

  User.findOne = async () => {
    userQueries += 1;
    return null;
  };
  User.findById = async () => {
    userQueries += 1;
    return null;
  };
  User.prototype.save = async function saveUser() { return this; };
  Exercise.prototype.save = async function saveExercise() {
    createExerciseSaveCount += 1;
    return this;
  };
  Exercise.findOne = async () => {
    exerciseQueries += 1;
    return {
      Exercises: [],
      trackExercises: [],
      async save() { return this; },
    };
  };
  RateLimit.findOneAndUpdate = async () => ({ count: 1, resetAt: new Date(Date.now() + 60_000) });

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
  app.use('/api/user', userRouter);
  app.use('/api/exercises', exerciseRouter);

  try {
    const invalidRegistration = await request(app)
      .post('/api/user/add')
      .send({ username: 'ab', email: 'bad-email', password: 'weak' });
    assert.equal(invalidRegistration.status, 422);
    assert.equal(userQueries, 0);

    const invalidProfile = await request(app)
      .put('/api/user/507f1f77bcf86cd799439011/update')
      .set('Authorization', `Bearer ${jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET)}`)
      .send({ username: 'x' });
    assert.equal(invalidProfile.status, 422);
    assert.equal(userQueries, 0);

    const validRegistration = await request(app)
      .post('/api/user/add')
      .send({ username: '<b>runner</b>', email: 'RUNNER@example.com', password: 'StrongPass1!' });
    assert.equal(validRegistration.status, 201);
    assert.equal(validRegistration.body.user.username, 'runner');
    assert.equal(validRegistration.body.user.email, 'runner@example.com');
    assert.equal(Object.hasOwn(validRegistration.body.user, 'password'), false);
    assert.equal(createExerciseSaveCount, 1);

    const accessToken = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
    const invalidExercise = await request(app)
      .post('/api/exercises/507f1f77bcf86cd799439011/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'Run', duration: 'not-a-number', exerciseCheck: true });
    assert.equal(invalidExercise.status, 422);
    assert.equal(exerciseQueries, 0);

    const validExercise = await request(app)
      .post('/api/exercises/507f1f77bcf86cd799439011/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: '<b>Morning run</b>', duration: '20', exerciseCheck: true });
    assert.equal(validExercise.status, 201);
    assert.equal(validExercise.body.newExercise.description, 'Morning run');
    assert.equal(validExercise.body.newExercise.duration, 20);
    assert.equal(exerciseQueries, 1);

    const unknownLogin = await request(app)
      .post('/api/user/login')
      .send({ email: 'runner@example.com', password: 'StrongPass1!' });
    assert.equal(unknownLogin.status, 401);
    assert.equal(unknownLogin.body.error, 'Invalid email or password');
  } finally {
    User.findOne = originalFindOne;
    User.findById = originalFindById;
    User.prototype.save = originalUserSave;
    Exercise.prototype.save = originalExerciseSave;
    Exercise.findOne = originalExerciseFindOne;
    RateLimit.findOneAndUpdate = originalRateLimitFindOneAndUpdate;
  }
});
