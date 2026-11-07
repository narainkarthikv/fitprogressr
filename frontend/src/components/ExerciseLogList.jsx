import { useState } from 'react';
import { Box, Typography, Fade, Button, Skeleton } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useDeleteLegacyExerciseMutation, useGetLegacyExercisesQuery } from '../services/api';
import ExerciseTable from './Exercise/ExerciseTable';

const ExerciseLogList = ({ userID, title = "Today's Exercises", onAddExercise }) => {
  const {
    data: exercises = [],
    isLoading,
    isFetching,
    error,
  } = useGetLegacyExercisesQuery(userID, { skip: !userID });
  const [deleteLegacyExercise] = useDeleteLegacyExerciseMutation();
  const [actionError, setActionError] = useState('');
  const handleDelete = async (exerciseId) => {
    setActionError('');
    try {
      await deleteLegacyExercise({ userId: userID, exerciseId }).unwrap();
    } catch (requestError) {
      setActionError(requestError.data?.error || 'Unable to delete this exercise.');
    }
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
        {actionError && (
          <Typography role="alert" color="error.main" variant="body2" sx={{ mb: 1 }}>
            {actionError}
          </Typography>
        )}
        {isFetching && !isLoading && (
          <Skeleton animation="wave" variant="rounded" height={4} sx={{ mb: 1 }} />
        )}
        {error && exercises.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error.main">Error fetching exercises.</Typography>
          </Box>
        ) : (
          <Fade in timeout={500}>
            <Box>
              <ExerciseTable
                exercises={exercises}
                handleDelete={handleDelete}
                loading={isLoading}
              />
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default ExerciseLogList;
