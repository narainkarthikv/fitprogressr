const express = require('express');
const Achievement = require('../models/achievement.model');
const verifyToken = require('../middleware/jwtAuth');
const { getApiErrorResponse } = require('../utils/apiErrors');
const { ensureStarterAchievements } = require('../services/achievementCatalog');

const router = express.Router();
router.use(verifyToken);

router.get('/', async (_req, res) => {
  try {
    await ensureStarterAchievements(Achievement);
    const achievements = await Achievement.find({}).sort({
      'condition.type': 1,
      'condition.threshold': 1,
    });
    return res.json(achievements);
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

module.exports = router;
