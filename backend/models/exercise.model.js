const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    Exercises: [
      {
        description: { type: String, required: true },
        duration: { type: Number, required: true },
        exerciseCheck: { type: Boolean, required: true },
        date: { type: Date },
      },
    ],
    trackExercises: [
      {
        date: { type: Date },
        totalExercises: { type: Number },
      },
    ],
  },
  {
    collection: 'exercises',
    timestamps: true,
  }
);

exerciseSchema.index({ userId: 1 });

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
