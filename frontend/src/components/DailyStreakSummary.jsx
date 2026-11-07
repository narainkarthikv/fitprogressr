import PropTypes from 'prop-types';
import { Box, Skeleton, Typography } from '@mui/material';
import { Whatshot } from '@mui/icons-material';
import { useGetStreakQuery } from '../services/api';

const DailyStreakSummary = ({ userDetails }) => {
  const userId = userDetails?._id;
  const { data, isLoading } = useGetStreakQuery(userId, { skip: !userId });
  const streak = Number(data?.streakCount) || 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 52 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          borderRadius: '12px',
          color: 'warning.main',
          bgcolor: 'action.hover',
        }}
      >
        <Whatshot />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Current daily streak
        </Typography>
        {isLoading ? (
          <Skeleton animation="wave" width={80} />
        ) : (
          <Typography variant="h6" fontWeight={800}>
            {streak} {streak === 1 ? 'day' : 'days'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

DailyStreakSummary.propTypes = {
  userDetails: PropTypes.shape({ _id: PropTypes.string, username: PropTypes.string }),
};

export default DailyStreakSummary;
