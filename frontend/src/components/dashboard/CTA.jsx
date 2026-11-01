import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Box, Container, Typography, Button, useTheme, alpha } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const CTA = ({ isLoggedIn, onGetStartedClick }) => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="cta"
      sx={{
        py: 'clamp(64px, 9vh, 112px)',
        scrollMarginTop: { xs: '72px', md: '88px' },
        backgroundColor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at top, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 55%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            p: { xs: 3.5, md: 5 },
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            },
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2.5,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              letterSpacing: '-0.01em',
            }}
          >
            Make your next session count.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              mb: 4,
              fontSize: { xs: '1rem', md: '1.0625rem' },
              maxWidth: '480px',
              mx: 'auto',
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            Start a training log, set a goal that matters to you, and build a clearer picture of
            your consistency over time.
          </Typography>

          {isLoggedIn ? (
            <Button
              component={RouterLink}
              to="dashboard"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.75,
                fontSize: '1rem',
                boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.35)}`,
                },
              }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              onClick={onGetStartedClick}
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.75,
                fontSize: '1rem',
                boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.35)}`,
                },
              }}
            >
              Create your account
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

CTA.propTypes = {
  isLoggedIn: PropTypes.bool,
  onGetStartedClick: PropTypes.func,
};

export default CTA;
