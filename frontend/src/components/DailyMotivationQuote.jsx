import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, alpha, useTheme } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

const fallbackQuote = {
  quote: 'Every session is a vote for the stronger you.',
  author: 'Your training reminder',
};
const QUOTE_CACHE_KEY = 'fitprogressr.daily-motivation-quote.v1';
const QUOTE_CACHE_TTL = 24 * 60 * 60 * 1000;

const readCachedQuote = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(QUOTE_CACHE_KEY) || 'null');
    if (
      cached?.quote?.quote &&
      Number.isFinite(cached.savedAt) &&
      Date.now() - cached.savedAt < QUOTE_CACHE_TTL
    ) {
      return cached.quote;
    }
    localStorage.removeItem(QUOTE_CACHE_KEY);
  } catch {
    try {
      localStorage.removeItem(QUOTE_CACHE_KEY);
    } catch {
      /* Storage is unavailable. */
    }
  }
  return null;
};

const storeQuote = (quote) => {
  try {
    localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify({ quote, savedAt: Date.now() }));
  } catch {
    // Keep the quote usable when browser storage is unavailable or full.
  }
};

const DailyMotivationQuote = ({ quote: providedQuote }) => {
  const theme = useTheme();
  const [randomQuote, setRandomQuote] = useState(() => providedQuote || readCachedQuote());
  const [quoteLoading, setQuoteLoading] = useState(() => !providedQuote && !readCachedQuote());

  useEffect(() => {
    if (providedQuote) return undefined;

    const cachedQuote = readCachedQuote();
    if (cachedQuote) {
      setRandomQuote(cachedQuote);
      setQuoteLoading(false);
      return undefined;
    }

    const apiKey = import.meta.env.VITE_APININJAS;
    if (!apiKey) {
      setRandomQuote(fallbackQuote);
      storeQuote(fallbackQuote);
      setQuoteLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const loadRandomQuote = async () => {
      try {
        const response = await fetch(
          'https://api.api-ninjas.com/v2/randomquotes?categories=inspirational',
          {
            headers: { 'X-Api-Key': apiKey },
            signal: controller.signal,
          }
        );
        if (!response.ok) throw new Error('Quote request failed');
        const quotes = await response.json();
        const nextQuote = Array.isArray(quotes) && quotes[0]?.quote ? quotes[0] : fallbackQuote;
        setRandomQuote(nextQuote);
        storeQuote(nextQuote);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setRandomQuote(fallbackQuote);
          storeQuote(fallbackQuote);
        }
      } finally {
        if (!controller.signal.aborted) setQuoteLoading(false);
      }
    };

    loadRandomQuote();
    return () => controller.abort();
  }, [providedQuote]);

  const quote = providedQuote || randomQuote;

  // Loading state
  if (!quote && quoteLoading) {
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
        <Skeleton animation="wave" variant="text" width="60%" height={24} />
        <Skeleton animation="wave" variant="text" width="100%" height={32} />
        <Skeleton animation="wave" variant="text" width="90%" height={32} />
        <Skeleton animation="wave" variant="text" width="40%" height={20} sx={{ mt: 1 }} />
      </Box>
    );
  }

  const { quote: text, author, work } = quote || fallbackQuote;

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

export default DailyMotivationQuote;
