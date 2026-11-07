import { Box, Container, Typography, Stack, Link, Divider, Grid } from '@mui/material';
import { GitHub, FitnessCenter } from '@mui/icons-material';

const FOOTER_LINKS = [
  {
    heading: 'Project',
    links: [
      { label: 'Open FitProgressr', href: '/' },
      {
        label: 'GitHub Repo',
        href: 'https://github.com/narainkarthikv/fitprogressr',
        external: true,
      },
      {
        label: 'Issues & Roadmap',
        href: 'https://github.com/narainkarthikv/fitprogressr/issues',
        external: true,
      },
      {
        label: 'Release Notes',
        href: 'https://github.com/narainkarthikv/fitprogressr/releases',
        external: true,
      },
    ],
  },
  {
    heading: 'Community',
    links: [
      {
        label: 'Contributing Guide',
        href: 'https://github.com/narainkarthikv/fitprogressr/blob/develop/CONTRIBUTING.md',
        external: true,
      },
      {
        label: 'Code of Conduct',
        href: 'https://github.com/narainkarthikv/fitprogressr/blob/develop/CODE_OF_CONDUCT.md',
        external: true,
      },
      {
        label: 'Security Policy',
        href: 'https://github.com/narainkarthikv/fitprogressr/security',
        external: true,
      },
      {
        label: 'Star on GitHub',
        href: 'https://github.com/narainkarthikv/fitprogressr',
        external: true,
      },
    ],
  },
  {
    heading: 'Legal',
    links: [
      {
        label: 'License (MIT)',
        href: 'https://github.com/narainkarthikv/fitprogressr/blob/develop/LICENSE',
        external: true,
      },
      {
        label: 'Documentation',
        href: 'https://github.com/narainkarthikv/fitprogressr#readme',
        external: true,
      },
    ],
  },
];

const FooterLinkGroup = ({ heading, links }) => (
  <Box>
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: 700,
        mb: 2,
        color: 'text.primary',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontSize: '0.75rem',
      }}
    >
      {heading}
    </Typography>
    <Stack spacing={1.25}>
      {links.map(({ label, href, external }) => (
        <Link
          key={label}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          underline="none"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            transition: 'color 0.15s ease',
            '&:hover': { color: 'primary.main' },
          }}
        >
          {label}
        </Link>
      ))}
    </Stack>
  </Box>
);

const Footer = () => (
  <Box
    component="footer"
    sx={{
      backgroundColor: 'background.paper',
      borderTop: '1px solid',
      borderColor: 'divider',
      mt: 'auto',
    }}
  >
    <Container maxWidth="lg">
      <Box sx={{ pt: 7, pb: 4 }}>
        {/* Main grid: branding + link columns */}
        <Grid container spacing={{ xs: 5, md: 6 }}>
          {/* Branding column */}
          <Grid item xs={12} md={4} lg={3.5}>
            <Stack spacing={1.5}>
              {/* Logo mark */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FitnessCenter sx={{ fontSize: 18, color: '#fff' }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    letterSpacing: '-0.02em',
                  }}
                >
                  FitProgressr
                </Typography>
              </Stack>

              {/* Tagline */}
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.65,
                  maxWidth: '260px',
                }}
              >
                A focused training log for sessions, goals, and progress. Open source and built for
                steady improvement.
              </Typography>

              {/* Privacy note */}
              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  lineHeight: 1.55,
                  maxWidth: '260px',
                  display: 'block',
                }}
              >
                Your sessions and progress are connected to your account.
              </Typography>

              {/* Social icons */}
              <Stack direction="row" spacing={1.5} sx={{ pt: 0.5 }}>
                <Link
                  href="https://github.com/narainkarthikv/fitprogressr"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  <GitHub fontSize="small" />
                </Link>
              </Stack>
            </Stack>
          </Grid>

          {/* Link columns */}
          <Grid item xs={12} md={8} lg={8.5}>
            <Grid container spacing={{ xs: 4, sm: 3 }}>
              {FOOTER_LINKS.map((group) => (
                <Grid key={group.heading} item xs={6} sm={4}>
                  <FooterLinkGroup {...group} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Divider + bottom strip */}
        <Divider sx={{ mt: 6, mb: 3 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.8125rem' }}>
            © {new Date().getFullYear()} FitProgressr. Built in the open for athletes who care.
          </Typography>

          <Stack direction="row" spacing={2.5}>
            <Link
              href="https://github.com/narainkarthikv/fitprogressr/blob/develop/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                color: 'text.disabled',
                fontSize: '0.8125rem',
                transition: 'color 0.15s ease',
                '&:hover': { color: 'text.secondary' },
              }}
            >
              MIT License
            </Link>
            <Link
              href="https://github.com/narainkarthikv/fitprogressr/blob/develop/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                color: 'text.disabled',
                fontSize: '0.8125rem',
                transition: 'color 0.15s ease',
                '&:hover': { color: 'text.secondary' },
              }}
            >
              Contribute
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Container>
  </Box>
);

export default Footer;
