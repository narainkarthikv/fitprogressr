import { useState } from 'react';
import {
  Table,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Skeleton,
} from '@mui/material';
import ExerciseRow from './ExerciseRow';

const ExerciseTable = ({ exercises = [], handleDelete, loading = false }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'description',
    direction: 'ascending',
  });

  const sortedExercises = Array.isArray(exercises) ? sortExercises(exercises, sortConfig) : [];

  const requestSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const getSortDirection = (key) => (sortConfig.key === key ? sortConfig.direction : false);

  const headerCellSx = {
    py: 1.4,
    px: { xs: 1.5, sm: 2 },
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'text.secondary',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: '1px solid',
    borderColor: 'divider',
    whiteSpace: 'nowrap',
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.012)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '14px',
        overflowX: 'auto',
        overflowY: 'hidden',
        '& .MuiTable-root': {
          borderCollapse: 'separate',
          borderSpacing: 0,
          tableLayout: 'fixed',
        },
        '& .MuiTableCell-root': {
          borderColor: 'rgba(148, 163, 184, 0.12)',
        },
        '& .MuiTableHead-root': {
          backgroundColor: 'rgba(148, 163, 184, 0.045)',
        },
      }}
    >
      <Table size="small" sx={{ minWidth: { xs: 450, lg: 390 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headerCellSx, width: '34%' }} align="left">
              <TableSortLabel
                active={sortConfig.key === 'description'}
                direction={getSortDirection('description') || 'asc'}
                onClick={() => requestSort('description')}
              >
                Description
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ ...headerCellSx, width: '24%' }} align="left">
              <TableSortLabel
                active={sortConfig.key === 'duration'}
                direction={getSortDirection('duration') || 'asc'}
                onClick={() => requestSort('duration')}
              >
                Duration
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ ...headerCellSx, width: '25%' }} align="left">
              <TableSortLabel
                active={sortConfig.key === 'completed'}
                direction={getSortDirection('completed') || 'asc'}
                onClick={() => requestSort('completed')}
              >
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ ...headerCellSx, width: '17%' }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }, (_, index) => (
              <TableRow key={`exercise-skeleton-${index}`}>
                <TableCell sx={{ py: 1.5, px: { xs: 1.5, sm: 2 } }}>
                  <Skeleton variant="text" width={`${58 + index * 8}%`} />
                </TableCell>
                <TableCell sx={{ py: 1.5, px: { xs: 1.5, sm: 2 } }}>
                  <Skeleton variant="text" width="48%" />
                </TableCell>
                <TableCell sx={{ py: 1.5, px: { xs: 1.5, sm: 2 } }}>
                  <Skeleton variant="rounded" width={72} height={24} />
                </TableCell>
                <TableCell align="center" sx={{ py: 1.5, px: { xs: 1, sm: 1.5 } }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mx: 'auto' }} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <ExerciseRow exercises={sortedExercises} handleDelete={handleDelete} />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const sortExercises = (exercises, sortConfig) => {
  return [...exercises].sort((a, b) => {
    const aValue = sortConfig.key === 'completed' ? Number(a[sortConfig.key]) : a[sortConfig.key];
    const bValue = sortConfig.key === 'completed' ? Number(b[sortConfig.key]) : b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
};

export default ExerciseTable;
