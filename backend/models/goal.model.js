const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goalType: {
      type: String,
      enum: ['workout_count', 'exercise_duration'],
      required: true,
    },
    target: {
      type: Number,
      required: true,
      min: Number.MIN_VALUE,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { collection: 'goals', timestamps: true }
);

goalSchema.index({ userId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
