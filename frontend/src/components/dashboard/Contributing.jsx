import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { Code, MenuBook, Forum, VolunteerActivism } from '@mui/icons-material';

const Contributing = () => {
  const theme = useTheme();

  const contributionPaths = [
    {
      icon: <Code fontSize="small" />,
      title: 'Ship a tiny improvement',
      body: 'Pick up a good first issue, smooth an edge, or add a helpful test. Small wins keep the product sharp.',
    },
    {
      icon: <MenuBook fontSize="small" />,
      title: 'Make the docs human',
      body: 'Clarify a setup step, add a screenshot, or explain a feature in plain language. Great docs save everyone time.',
    },
    {
      icon: <Forum fontSize="small" />,
      title: 'Help shape the roadmap',
      body: 'Open an issue, share a workflow, or suggest a new metric. Your feedback guides what we build next.',
    },
  ];

  return (
    <Box
      component="section"
      id="contributing"
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
          background: `radial-gradient(circle at bottom, ${alpha(
            theme.palette.primary.main,
            0.08
          )} 0%, transparent 60%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.75rem' },
              letterSpacing: '-0.01em',
            }}
          >
            Built in the open, powered by you
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
            }}
          >
            FitProgressr stays free, always. It grows through community energy, thoughtful feedback,
            and small contributions that make a big difference.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: { xs: 5, md: 6 } }}>
          {contributionPaths.map((path) => (
            <Grid item xs={12} md={4} key={path.title}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 16px 30px -24px ${alpha(theme.palette.primary.main, 0.5)}`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        color: 'primary.main',
                      }}
                    >
                      {path.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {path.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {path.body}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Stack spacing={1.25} sx={{ maxWidth: 560 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <VolunteerActivism color="primary" fontSize="small" />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Tell us what would make it better
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              We build FitProgressr with the community, not for the community. Share feedback,
              celebrate wins, and point out the rough edges so we can keep improving.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="large"
            href="https://github.com/narainkarthikv/fitprogressr/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              alignSelf: { xs: 'stretch', md: 'center' },
            }}
          >
            Share feedback on GitHub
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Contributing;
