import { Box, Typography, Skeleton, alpha, useTheme } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

const Quotes = ({ quote }) => {
  const theme = useTheme();

  // Loading state
  if (!quote) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2, lg: 0.75 },
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="100%" height={32} />
        <Skeleton variant="text" width="90%" height={32} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
      </Box>
    );
  }

  const { quote: text, author, work } = quote;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, lg: 0.75 },
        height: '100%',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Opening Quote Mark */}
      <FormatQuote
        sx={{
          position: 'absolute',
          top: -12,
          left: -12,
          fontSize: 56,
          color: theme.palette.primary.main,
          opacity: 0.15,
          transform: 'rotate(180deg)',
        }}
      />

      {/* Quote Label */}
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        Daily Inspiration
      </Typography>

      {/* Quote Text */}
      <Typography
        sx={{
          fontSize: { xs: '0.95rem', md: '1.05rem', lg: '0.9rem' },
          lineHeight: { xs: 1.7, lg: 1.45 },
          color: 'text.primary',
          fontWeight: 500,
          position: 'relative',
          zIndex: 1,
          mb: { xs: 1, lg: 0 },
        }}
      >
        "{text}"
      </Typography>

      {/* Author and Work Attribution */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {author && (
          <Typography
            variant="body2"
            sx={{
              color: alpha(theme.palette.primary.main, 0.9),
              fontWeight: 600,
              fontSize: '0.875rem',
              fontStyle: 'italic',
            }}
          >
            — {author}
          </Typography>
        )}
        {work && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', lg: '0.68rem' },
              display: { lg: '-webkit-box' },
              WebkitLineClamp: { lg: 1 },
              WebkitBoxOrient: { lg: 'vertical' },
              overflow: { lg: 'hidden' },
              fontStyle: 'italic',
              ml: 1.5,
            }}
          >
            {work}
          </Typography>
        )}
      </Box>

      {/* Closing Quote Mark */}
      <FormatQuote
        sx={{
          position: 'absolute',
          bottom: -12,
          right: -12,
          fontSize: 56,
          color: theme.palette.primary.main,
          opacity: 0.15,
        }}
      />
    </Box>
  );
};

export default Quotes;
