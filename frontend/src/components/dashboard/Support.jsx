import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { Favorite, Coffee } from '@mui/icons-material';

const Support = () => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: 'clamp(64px, 9vh, 112px)',
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.08
        )} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Coffee
            sx={{
              fontSize: 48,
              color: 'primary.main',
              mb: 3,
            }}
          />
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: 3,
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.75rem' },
              letterSpacing: '-0.01em',
            }}
          >
            Love Fitness Tracking? ☕
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '640px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.05rem' },
              fontWeight: 400,
              lineHeight: 1.7,
              mb: 4,
            }}
          >
            Building a fitness app that helps you stay consistent takes time and energy.
            If FitProgressr makes your workouts better, consider buying us a coffee!
            Every bit helps keep this project independent and ad-free. 💪
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              href="https://ko-fi.com/narainkarthikv"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Coffee />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Buy Us a Coffee on Ko-fi
            </Button>
            <Button
              variant="contained"
              size="large"
              href="https://buymeacoffee.com/narainkarthikv"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Favorite />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FFA726 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF5252 30%, #FB8C00 90%)',
                },
              }}
            >
              Support on Buy Me a Coffee
            </Button>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              color: 'text.secondary',
              fontSize: '0.875rem',
            }}
          >
            ✨ Donations are optional and never required. FitProgressr will always be free and open source!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Support;