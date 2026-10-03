import { Box, Typography, LinearProgress, Avatar } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

const UserExperience = ({ userDetails }) => {
  const xpPercentage = Math.min((userDetails.xp / 100) * 100, 100);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          aria-hidden="true"
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.main',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {userDetails.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Welcome back
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            {userDetails.username}
          </Typography>
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EmojiEvents sx={{ fontSize: 16, color: '#ffd700' }} />
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              Experience
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            {userDetails.xp} XP
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={xpPercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.7rem',
            color: 'text.secondary',
            mt: 0.5,
            display: 'block',
          }}
        >
          {100 - userDetails.xp} XP to next level
        </Typography>
      </Box>
    </Box>
  );
};

export default UserExperience;
