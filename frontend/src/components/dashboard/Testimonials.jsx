import { Box, Container, Typography, Card, CardContent, Avatar } from '@mui/material';

const Testimonials = () => {
  const testimonials = [
    { quote: 'Simple to use, helps me stay accountable.', name: 'Sarah M.' },
    { quote: 'Nice to see my workout patterns over time.', name: 'James K.' },
    { quote: 'Does what it needs to do without the fluff.', name: 'Priya R.' },
    { quote: 'The streak feature keeps me showing up.', name: 'Mike T.' },
    { quote: 'Clean interface, easy logging. Works for me.', name: 'Emma L.' },
    { quote: 'Good for tracking progress without overthinking.', name: 'Alex D.' },
  ];

  return (
    <Box
      component="section"
      id="testimonials"
      sx={{
        py: { xs: 8, md: 10 },
        backgroundColor: 'background.paper',
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
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
          What people say
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: { xs: 5, md: 6 },
            color: 'text.secondary',
            fontSize: { xs: '1rem', md: '1.05rem' },
            fontWeight: 400,
          }}
        >
          Honest feedback from real users
        </Typography>

        <Box
          sx={{
            overflow: 'hidden',
            '&:hover .testimonial-track': {
              animationPlayState: 'paused',
            },
          }}
        >
          <Box
            className="testimonial-track"
            sx={{
              display: 'flex',
              gap: 3,
              animation: 'testimonialScroll 45s linear infinite',
              '@keyframes testimonialScroll': {
                '0%': { transform: 'translateX(0)' },
                '100%': { transform: 'translateX(-50%)' },
              },
            }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card
                key={index}
                sx={{
                  minWidth: { xs: 260, md: 300 },
                  maxWidth: { xs: 260, md: 300 },
                  flexShrink: 0,
                  height: '100%',
                  backgroundColor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ textAlign: 'left', p: 2.5 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      color: 'text.primary',
                      lineHeight: 1.6,
                      fontSize: '0.875rem',
                    }}
                  >
                    "{testimonial.quote}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Avatar
                      aria-hidden="true"
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.8125rem',
                      }}
                    >
                      {testimonial.name}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonials;
