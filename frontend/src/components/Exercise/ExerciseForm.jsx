import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Stack,
  TableRow,
  TableCell,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';

const ExerciseForm = ({ newExerciseData, handleChange, handleAdd, setFormVisible }) => (
  <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
    <TableCell colSpan={4} sx={{ py: 2 }}>
      <Box component="form" onSubmit={handleAdd} sx={{ width: '100%' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            name="description"
            label="Exercise name"
            placeholder="Exercise name"
            value={newExerciseData.description}
            onChange={handleChange}
            required
            fullWidth
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <TextField
            size="small"
            type="number"
            name="duration"
            label="Duration in minutes"
            placeholder="Minutes"
            value={newExerciseData.duration}
            onChange={handleChange}
            required
            inputProps={{ min: 1 }}
            fullWidth
            sx={{
              minWidth: 120,
              maxWidth: 150,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="exerciseCheck"
                checked={newExerciseData.exerciseCheck}
                onChange={handleChange}
                sx={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  '&.Mui-checked': {
                    color: 'success.main',
                  },
                }}
              />
            }
            label="Done"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '0.9rem',
              },
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Close />}
              onClick={() => setFormVisible(false)}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.light',
                  outlineOffset: 2,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              startIcon={<Add />}
              sx={{
                borderRadius: '8px',
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
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'text.disabled',
                },
              }}
            >
              Add
            </Button>
          </Stack>
        </Stack>
      </Box>
    </TableCell>
  </TableRow>
);

export default ExerciseForm;
