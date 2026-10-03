import { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography, Skeleton, alpha, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMonthData } from '../slices/heatMapSlice';
import HeatmapControls from './Heatmap/HeatmapControls';
import DetailsModal from './Heatmap/DetailsModal';

const HeatMap = ({ userID, onAddExercise }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const userMonthData = useSelector((state) => state.heatMap.userMonthData);
  const status = useSelector((state) => state.heatMap.status);
  const isLoading = status === 'idle' || status === 'loading';

  const monthData = useMemo(() => userMonthData?.[userID] || [], [userMonthData, userID]);

  // Set the default month to the current month
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toLocaleString('default', { month: 'long' })
  );
  const [selectedValue, setSelectedValue] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const months = Array.from({ length: 12 }, (_, index) =>
    new Date(0, index).toLocaleString('default', { month: 'long' })
  );
  const calendarYear = new Date().getFullYear();
  const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const calendarCells = useMemo(() => {
    const monthIndex = months.indexOf(selectedMonth);
    const dayCount = new Date(calendarYear, monthIndex + 1, 0).getDate();
    const firstWeekday = new Date(calendarYear, monthIndex, 1).getDay();
    const countsByDay = new Map();

    (Array.isArray(monthData) ? monthData : []).forEach((item) => {
      const date = new Date(item.date);
      const day = Number(String(item.date).slice(8, 10)) || date.getUTCDate();
      const count = Math.max(0, Number(item.count) || 0);
      if (day >= 1 && day <= dayCount) countsByDay.set(day, count);
    });

    const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - firstWeekday + 1;
      if (day < 1 || day > dayCount) return null;
      return { day, count: countsByDay.get(day) || 0 };
    });
  }, [calendarYear, monthData, months, selectedMonth]);

  useEffect(() => {
    if (userID) {
      dispatch(fetchMonthData(userID, selectedMonth));
    }
  }, [dispatch, userID, selectedMonth]);

  const handleClick = (value) => {
    setSelectedValue(value);
    setShowModal(true);
  };

  const handleAddActivity = () => onAddExercise('activity');

  const getCellTone = (count) => {
    if (count >= 10) return alpha(theme.palette.success.main, 0.86);
    if (count >= 6) return alpha(theme.palette.success.main, 0.62);
    if (count >= 3) return alpha(theme.palette.success.main, 0.38);
    if (count > 0) return alpha(theme.palette.success.main, 0.2);
    return alpha(theme.palette.text.primary, 0.045);
  };

  const getCellBorderTone = (count) =>
    count > 0 ? alpha(theme.palette.success.main, Math.min(0.9, 0.28 + count * 0.07)) : 'divider';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2, lg: 1.5 },
        width: '100%',
        height: { md: '100%' },
        minHeight: { md: 0 },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '18px',
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.12),
        backgroundImage: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.015)})`,
      }}
    >
      <Stack
        spacing={{ xs: 2.5, lg: 1.5 }}
        alignItems="stretch"
        sx={{ minHeight: { md: 0 }, height: { md: '100%' }, flex: 1 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
            Activity Heatmap
          </Typography>
          <Box sx={{ ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}>
            <HeatmapControls
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              handleAddExercise={handleAddActivity}
              months={months}
              compact
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            borderRadius: '14px',
            p: { xs: 1.5, sm: 2, lg: 2 },
            backgroundColor: alpha(theme.palette.background.paper, 0.45),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { md: 0 },
            flex: { md: '1 1 0' },
            overflow: 'hidden',
          }}
        >
          <Box
            role="group"
            aria-label={`${selectedMonth} ${calendarYear} activity`}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gridTemplateRows: '24px repeat(6, minmax(0, 1fr))',
              gap: 0.75,
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              maxWidth: 620,
            }}
          >
            {weekdayLabels.map((day) =>
              isLoading ? (
                <Skeleton key={`weekday-${day}`} variant="text" width="42%" sx={{ mx: 'auto' }} />
              ) : (
                <Typography
                  key={day}
                  aria-hidden="true"
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.72rem', sm: '0.8rem' },
                    lineHeight: 1,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {day}
                </Typography>
              )
            )}
            {isLoading ? (
              Array.from({ length: 42 }, (_, index) => (
                <Skeleton
                  key={`calendar-day-${index}`}
                  variant="rounded"
                  sx={{
                    width: '100%',
                    height: '100%',
                    transform: 'none',
                    borderRadius: '10px',
                  }}
                />
              ))
            ) : status === 'failed' ? (
              <Typography
                role="alert"
                variant="body2"
                color="text.secondary"
                sx={{ gridColumn: '1 / -1', alignSelf: 'center', justifySelf: 'center' }}
              >
                Activity data could not be loaded.
              </Typography>
            ) : calendarCells.map((cell, index) =>
              cell ? (
                <Box
                  key={cell.day}
                  component="button"
                  type="button"
                  aria-label={`${selectedMonth} ${cell.day}, ${cell.count} ${cell.count === 1 ? 'exercise' : 'exercises'}`}
                  title={`${cell.count} ${cell.count === 1 ? 'exercise' : 'exercises'}`}
                  onClick={() =>
                    handleClick({
                      date: `${calendarYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`,
                      count: cell.count,
                    })
                  }
                  sx={{
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                    p: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.25,
                    border: '1px solid',
                    borderColor: getCellBorderTone(cell.count),
                    borderRadius: '10px',
                    color: 'text.primary',
                    fontWeight: cell.count > 0 ? 600 : 400,
                    backgroundColor: getCellTone(cell.count),
                    cursor: 'pointer',
                    font: 'inherit',
                    transition: 'transform 140ms ease, border-color 140ms ease, background-color 140ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'primary.main',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Typography component="span" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, lineHeight: 1 }}>
                    {cell.day}
                  </Typography>
                  {cell.count > 0 && (
                    <Typography component="span" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                      {cell.count}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box key={`empty-${index}`} aria-hidden="true" />
              )
            )}
          </Box>
        </Box>
      </Stack>

      <DetailsModal
        showModal={showModal}
        handleClose={() => setShowModal(false)}
        selectedValue={selectedValue}
      />

    </Paper>
  );
};

export default HeatMap;
