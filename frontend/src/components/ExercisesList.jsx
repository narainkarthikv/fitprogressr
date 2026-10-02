import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Fade, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { fetchExercises, deleteExercise } from '../slices/exercisesSlice';
import ExerciseTable from './Exercise/ExerciseTable';

const ExercisesList = ({ userID, title = "Today's Exercises", onAddExercise }) => {
  const dispatch = useDispatch();
  const userExercises = useSelector((state) => state.exercises.userExercises);
  const status = useSelector((state) => state.exercises.status);

  const exercises = useMemo(() => userExercises?.[userID] || [], [userExercises, userID]);
  const hasFetchedExercises = Array.isArray(userExercises?.[userID]);
  const isLoading = !hasFetchedExercises && (status === 'idle' || status === 'loading');
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchExercises(userID));
    }
  }, [userID, status, dispatch]);

  useEffect(() => {
    // Fetch exercises whenever the userID changes to ensure the correct data is shown
    dispatch(fetchExercises(userID));
  }, [userID, dispatch]);

  const handleDelete = (exerciseId) => {
    dispatch(deleteExercise(userID, exerciseId));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
          {title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => onAddExercise('exercise')}
          sx={{
            borderRadius: 8,
            fontWeight: 600,
            backgroundColor: 'primary.main',
            color: 'text.inverse',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:active': {
              backgroundColor: 'primary.dark',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.light',
              outlineOffset: 2,
            },
          }}
        >
          Add Exercise
        </Button>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: { xs: '240px', md: 0 },
          maxHeight: { xs: '380px', md: 'none' },
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.15)',
            },
          },
        }}
      >
        {isLoading ? (
          <ExerciseTable loading />
        ) : status === 'failed' && !hasFetchedExercises ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error.main">Error fetching exercises.</Typography>
          </Box>
        ) : (
          <Fade in timeout={500}>
          <Box>
            <ExerciseTable
              exercises={exercises}
              handleDelete={handleDelete}
            />
          </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default ExercisesList;
