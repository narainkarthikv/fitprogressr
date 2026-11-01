const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'user_achievements',
  }
);

userAchievementSchema.index(
  { userId: 1, achievementId: 1 },
  { unique: true }
);
userAchievementSchema.index({ userId: 1 });

module.exports = mongoose.model('UserAchievement', userAchievementSchema);
