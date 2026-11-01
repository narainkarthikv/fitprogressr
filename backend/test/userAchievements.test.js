const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'route-test-secret';

const UserAchievement = require('../models/userAchievement.model');
const userAchievementsRouter = require('../routes/userAchievements');
const { validateApiResponse } = require('../utils/responseSchemas');

test('user achievements require authentication and return only the current user achievements', async () => {
  const originalFind = UserAchievement.find;
  const userId = '507f1f77bcf86cd799439011';
  const otherUserId = '507f1f77bcf86cd799439014';
  const achievementId = '507f1f77bcf86cd799439012';

  let query;

  const earned = {
    _id: '507f1f77bcf86cd799439013',
    userId,
    achievementId: {
      _id: achievementId,
      name: 'First Workout',
      description: 'Complete your first workout',
      xpReward: 10,
      condition: { type: 'workoutCount', threshold: 1 },
    },
    earnedAt: new Date('2026-10-25T00:00:00.000Z'),
  };

  UserAchievement.find = (filter) => {
    query = filter;

    return {
      populate() {
        return this;
      },
      sort: async () => [earned],
    };
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

  app.use('/api/user-achievements', userAchievementsRouter);

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
  const otherToken = jwt.sign({ id: otherUserId }, process.env.JWT_SECRET);

  try {
    const unauthenticated = await request(app).get('/api/user-achievements');
    assert.equal(unauthenticated.status, 401);

    const response = await request(app)
      .get('/api/user-achievements')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.deepEqual(query, { userId });
    assert.equal(response.body.length, 1);
    assert.equal(response.body[0].achievementId.name, 'First Workout');
    assert.equal(response.body[0].achievementId.xpReward, 10);

    await request(app)
      .get('/api/user-achievements')
      .set('Authorization', `Bearer ${otherToken}`);

    assert.deepEqual(query, { userId: otherUserId });
  } finally {
    UserAchievement.find = originalFind;
  }
});
