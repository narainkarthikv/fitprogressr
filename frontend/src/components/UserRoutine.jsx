import { useEffect, useState } from 'react';
import { updateTotalDays } from '../slices/userRoutineSlice';
import { Box, Typography, Chip, Skeleton } from '@mui/material';
import {
  Whatshot as FireIcon,
  CheckCircle as CheckCircleIcon,
  SentimentDissatisfied,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { API_BASE_URL, getAccessToken } from '../utils/api';

const UserRoutine = ({ userID, compact = false }) => {
  const [dayCheck, setDayCheck] = useState([false, false, false, false, false, false, false]);
  const [streak, setStreak] = useState(0);
  const [weeklyStreakValue, setWeeklyStreakValue] = useState(0);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const backendURL = API_BASE_URL;

  const dispatch = useDispatch();
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const weeklyStreak = (updatedDayCheck) => {
    const todayIndex = new Date().getDay();
    for (let index = 0; index < updatedDayCheck.length; index++) {
      if (!updatedDayCheck[index]) {
        setWeeklyStreakValue(index - 1);
        if (index < todayIndex) setMsg('Streak Missed Mid-week 😢');
        else setMsg('');
        return;
      }
    }
    setWeeklyStreakValue(todayIndex);
  };

  useEffect(() => {
    let isCurrent = true;
    if (!userID) {
      setLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    setLoading(true);

    const fetchData = async () => {
      try {
        const accessToken = getAccessToken();
        const res = await fetch(`${backendURL}/api/user/streak/${userID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error('Unable to fetch workout streak');
        const data = await res.json();
        if (!isCurrent) return;
        setStreak(data.streakCount);
        setDayCheck(data.dayCheck);
        weeklyStreak(data.dayCheck);
        dispatch(updateTotalDays(userID, data.dayCheck));
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isCurrent = false;
    };
  }, [userID, backendURL, dispatch]);

  const today = new Date().getDay();

  if (loading) {
    return (
      <Box
        role="status"
        aria-label="Loading weekly streak"
        sx={{ display: 'flex', flexDirection: 'column', gap: compact ? 0.75 : 2 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: compact ? 'flex-start' : 'center', gap: 1 }}>
          <Skeleton variant="circular" width={compact ? 26 : 40} height={compact ? 26 : 40} />
          <Skeleton variant="text" width={compact ? 34 : 68} height={compact ? 34 : 64} />
          <Skeleton variant="text" width={compact ? 74 : 110} height={24} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: compact ? 'center' : 'space-between', gap: compact ? 0.3 : 0 }}>
          {weekdays.map((day) => (
            <Box key={day} sx={{ width: compact ? 24 : 38, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Skeleton variant="text" width={20} height={18} />
              <Skeleton variant="circular" width={compact ? 14 : 20} height={compact ? 14 : 20} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: compact ? 'auto' : { xs: '100%', lg: 'auto' },
        flex: compact ? '0 0 auto' : { lg: 1 },
        minHeight: compact ? 'auto' : { lg: 0 },
        gap: compact ? 0.75 : { xs: 2.5, lg: 1.25 },
        width: compact ? { xs: '100%', sm: 'auto' } : 'auto',
        flexShrink: compact ? 0 : 1,
      }}
    >
      {/* Streak Card */}
      <Box
        sx={{
          background: compact ? 'transparent' : 'linear-gradient(135deg, rgba(109, 140, 255, 0.16), rgba(109, 140, 255, 0.04))',
          border: compact ? 'none' : '1px solid rgba(109, 140, 255, 0.18)',
          borderRadius: compact ? 0 : '16px',
          p: compact ? 0 : { xs: 3, lg: 2 },
          textAlign: compact ? 'left' : 'center',
          position: 'relative',
          overflow: 'hidden',
          display: compact ? 'flex' : 'block',
          alignItems: 'center',
          gap: compact ? 0.5 : 0,
          width: compact ? 'fit-content' : 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: compact ? 0.5 : 1,
            mb: compact ? 0 : 0.5,
            position: 'relative',
            justifyContent: compact ? 'flex-start' : 'center',
          }}
        >
          <FireIcon
            sx={{
              fontSize: compact ? 26 : 36,
              color: '#F4A340',
            }}
          />
          <Typography
            sx={{
              fontSize: compact ? '1.55rem' : { xs: '3rem', lg: '2.2rem' },
              fontWeight: 900,
              color: 'text.primary',
              lineHeight: 1,
              textShadow: 'none',
            }}
          >
            {streak}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: compact ? '0.72rem' : '1rem',
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: compact ? '0.04em' : '1px',
            whiteSpace: compact ? 'nowrap' : 'normal',
          }}
        >
          day streak!
        </Typography>
      </Box>

      {/* Weekdays Section */}
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: compact ? 'none' : 'block',
            mb: { xs: 1.5, lg: 0.75 },
          }}
        >
          This Week
        </Typography>

        {/* Weekday Labels */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: compact ? 'center' : 'space-between',
            gap: compact ? 0.3 : 0,
            mb: compact ? 0 : { xs: 2, lg: 1 },
          }}
        >
          {weekdays.map((day, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: compact ? 0.25 : 1,
                width: compact ? '24px' : '38px',
              }}
            >
              <Typography
                sx={{
                  display: 'block',
            fontSize: compact ? '0.72rem' : '0.85rem',
                  fontWeight: index === today ? 700 : 500,
                  color: index === today ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s ease',
                }}
              >
                {day}
              </Typography>
              {dayCheck[index] ? (
                <CheckCircleIcon
                  sx={{
                    color: 'primary.main',
                    fontSize: compact ? 17 : 20,
                    filter: 'drop-shadow(0 2px 4px rgba(255, 200, 55, 0.4))',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: compact ? 14 : 20,
                    height: compact ? 14 : 20,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Progress Bar */}
        <Box
          sx={{
            display: compact ? 'none' : 'block',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '3px',
            overflow: 'hidden',
            mb: { xs: 2, lg: 1 },
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${(weeklyStreakValue / 6) * 100}%`,
            backgroundColor: 'primary.main',
              transition: 'width 0.5s ease-in-out',
              borderRadius: '3px',
            }}
          />
        </Box>

        {/* Status Message */}
        {!compact && msg && (
          <Chip
            icon={<SentimentDissatisfied sx={{ fontSize: 16 }} />}
            label={msg}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 193, 7, 0.15)',
              color: '#FFC837',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              fontWeight: 600,
              fontSize: '0.8rem',
              width: '100%',
              height: 'auto',
              py: 0.5,
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

UserRoutine.propTypes = {
  userID: PropTypes.string.isRequired,
  compact: PropTypes.bool,
};

export default UserRoutine;
