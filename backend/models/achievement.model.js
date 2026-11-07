const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    xpReward: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    condition: {
      type: {
        type: String,
        required: true,
        enum: ['workoutCount', 'streak'],
      },
      threshold: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  },
  {
    timestamps: true,
    collection: 'achievements',
  }
);

module.exports = mongoose.model('Achievement', achievementSchema);
