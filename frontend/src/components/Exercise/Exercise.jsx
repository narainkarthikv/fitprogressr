import { IconButton, Chip, Tooltip, Box, TableRow, TableCell, Typography } from '@mui/material';
import { CheckCircle, Cancel, Delete } from '@mui/icons-material';

const Exercise = ({ deleteExercise, exercise }) => {
  return (
    <TableRow
      hover
      sx={{
        transition: 'background-color 160ms ease',
        '&:hover': {
          backgroundColor: 'rgba(109, 140, 255, 0.055)',
        },
        '&:last-child td': {
          borderBottom: 0,
        },
      }}
    >
      <TableCell
        sx={{
          py: 1.5,
          px: { xs: 1.5, sm: 2 },
          color: 'text.primary',
          fontSize: '0.92rem',
          fontWeight: 600,
          lineHeight: 1.4,
        }}
      >
        {exercise.description}
      </TableCell>
      <TableCell sx={{ py: 1.5, px: { xs: 1.5, sm: 2 }, color: 'text.secondary', fontSize: '0.9rem' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
          {exercise.duration}
          <Typography component="span" variant="caption" sx={{ opacity: 0.6 }}>
            min
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ py: 1.5, px: { xs: 1.5, sm: 2 } }}>
        {exercise.exerciseCheck ? (
          <Chip
            icon={<CheckCircle sx={{ fontSize: 16 }} />}
            label="Done"
            size="small"
            sx={{
              backgroundColor: 'rgba(46, 125, 50, 0.15)',
              color: '#66bb6a',
              border: '1px solid rgba(102, 187, 106, 0.3)',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
            }}
          />
        ) : (
          <Chip
            icon={<Cancel sx={{ fontSize: 16 }} />}
            label="Pending"
            size="small"
            sx={{
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              color: '#ef5350',
              border: '1px solid rgba(239, 83, 80, 0.3)',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
            }}
          />
        )}
      </TableCell>
      <TableCell sx={{ py: 1, px: { xs: 1, sm: 1.5 }, textAlign: 'center' }}>
        <Tooltip title="Delete exercise" arrow>
          <IconButton
            aria-label={`Delete exercise ${exercise.description}`}
            size="small"
            onClick={() => deleteExercise(exercise._id)}
            sx={{
              color: 'text.secondary',
              width: 34,
              height: 34,
              '&:hover': {
                backgroundColor: 'rgba(239, 83, 80, 0.15)',
                color: '#ef5350',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Delete sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default Exercise;
