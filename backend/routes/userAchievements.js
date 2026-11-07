const express = require('express');
const router = express.Router();

const UserAchievement = require('../models/userAchievement.model');
const verifyToken = require('../middleware/jwtAuth');
const { getApiErrorResponse } = require('../utils/apiErrors');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const achievements = await UserAchievement.find({
      userId: req.user.id,
    })
      .populate({
        path: 'achievementId',
        select: 'name description xpReward condition',
      })
      .sort({ earnedAt: -1 });

    return res.json(achievements);
  } catch (error) {
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

module.exports = router;
