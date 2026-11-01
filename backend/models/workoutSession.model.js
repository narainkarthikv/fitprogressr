
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const workoutSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    exercises: {
      type: [workoutExerciseSchema],
      default: [],
    },
  },
  {
    collection: 'workout_sessions',
    timestamps: true,
  }
);

workoutSessionSchema.index({ userId: 1, date: 1 }, { unique: true });
workoutSessionSchema.index({ userId: 1, date: -1 });

const WorkoutSession = mongoose.model(
  'WorkoutSession',
  workoutSessionSchema
);

module.exports = WorkoutSession;
