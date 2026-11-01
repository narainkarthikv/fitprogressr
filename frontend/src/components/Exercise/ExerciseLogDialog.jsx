import { useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Alert,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { useAddHeatmapActivityMutation, useCreateLegacyExerciseMutation } from '../../services/api';

const initialExercise = { description: '', duration: '', exerciseCheck: false };
const getTodayDate = () => new Date().toISOString().split('T')[0];

const ExerciseLogDialog = ({ open, onClose, userID, mode = 'exercise' }) => {
  const [exercise, setExercise] = useState(initialExercise);
  const [activity, setActivity] = useState({ date: getTodayDate(), count: '' });
  const [submitError, setSubmitError] = useState(false);
  const [createLegacyExercise, { isLoading: isSavingExercise }] = useCreateLegacyExerciseMutation();
  const [addHeatmapActivity, { isLoading: isSavingActivity }] = useAddHeatmapActivityMutation();
  const submitting = isSavingExercise || isSavingActivity;

  const handleClose = () => {
    if (submitting) return;
    setExercise(initialExercise);
    setActivity({ date: getTodayDate(), count: '' });
    setSubmitError(false);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === 'activity') {
      const count = Number(activity.count);
      if (!activity.date || !Number.isInteger(count) || count <= 0) return;

      setSubmitError(false);
      try {
        await addHeatmapActivity({
          userId: userID,
          body: {
            date: new Date(`${activity.date}T12:00:00`).toISOString(),
            count,
          },
        }).unwrap();
        setActivity({ date: getTodayDate(), count: '' });
        onClose();
      } catch {
        setSubmitError(true);
      }
      return;
    }

    const duration = Number(exercise.duration);
    if (!exercise.description.trim() || !Number.isFinite(duration) || duration <= 0) return;

    setSubmitError(false);
    try {
      await createLegacyExercise({
        userId: userID,
        body: {
          description: exercise.description.trim(),
          duration,
          exerciseCheck: exercise.exerciseCheck,
        },
      }).unwrap();
      setExercise(initialExercise);
      onClose();
    } catch {
      setSubmitError(true);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {mode === 'activity' ? 'Add activity to heatmap' : 'Add today’s exercise'}
        <IconButton onClick={handleClose} aria-label="Close exercise form" disabled={submitting}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="exercise-entry-form"
          spacing={2.5}
          sx={{ pt: 1 }}
          onSubmit={handleSubmit}
        >
          {submitError && (
            <Alert severity="error">
              {mode === 'activity'
                ? 'We couldn’t add that activity. Please try again.'
                : 'We couldn’t add that exercise. Please try again.'}
            </Alert>
          )}
          {mode === 'activity' ? (
            <>
              <TextField
                required
                fullWidth
                label="Activity date"
                type="date"
                value={activity.date}
                onChange={(event) =>
                  setActivity((current) => ({ ...current, date: event.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                fullWidth
                label="Exercises completed"
                type="number"
                value={activity.count}
                onChange={(event) =>
                  setActivity((current) => ({ ...current, count: event.target.value }))
                }
                inputProps={{ min: 1, step: 1 }}
                helperText="Sets the activity level shown for this day."
              />
            </>
          ) : (
            <>
              <TextField
                required
                fullWidth
                label="Exercise name"
                name="description"
                value={exercise.description}
                onChange={(event) =>
                  setExercise((current) => ({ ...current, description: event.target.value }))
                }
                inputProps={{ maxLength: 500 }}
              />
              <TextField
                required
                fullWidth
                label="Duration"
                name="duration"
                type="number"
                value={exercise.duration}
                onChange={(event) =>
                  setExercise((current) => ({ ...current, duration: event.target.value }))
                }
                inputProps={{ min: 1, step: 1 }}
                InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exercise.exerciseCheck}
                    onChange={(event) =>
                      setExercise((current) => ({
                        ...current,
                        exerciseCheck: event.target.checked,
                      }))
                    }
                  />
                }
                label="Mark as completed"
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={submitting} startIcon={<Close />}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="exercise-entry-form"
          variant="contained"
          disabled={
            submitting ||
            (mode === 'activity'
              ? !activity.date ||
                !Number.isInteger(Number(activity.count)) ||
                Number(activity.count) <= 0
              : !exercise.description.trim() || Number(exercise.duration) <= 0)
          }
          startIcon={<Add />}
        >
          {submitting ? 'Adding…' : mode === 'activity' ? 'Record activity' : 'Add exercise'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExerciseLogDialog;
