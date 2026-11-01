import { useId } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';

const ModalShell = ({
  open,
  onClose,
  busy = false,
  title,
  subtitle,
  leading,
  children,
  actions,
  maxWidth = 'md',
  fullScreen = false,
  closeLabel = 'Close dialog',
}) => {
  const titleId = useId();

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (!busy) onClose(event, reason);
      }}
      fullWidth
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      aria-labelledby={titleId}
      PaperProps={{
        sx: {
          position: 'relative',
          maxHeight: { xs: '100dvh', sm: 'min(90dvh, 920px)' },
          borderRadius: { xs: 0, sm: '18px' },
          border: { xs: 0, sm: '1px solid' },
          borderColor: 'divider',
          bgcolor: 'background.paper',
          backgroundImage:
            'radial-gradient(ellipse at 100% 0%, rgba(102,132,255,.12), transparent 34%)',
          boxShadow: '0 28px 90px rgba(0,0,0,.38)',
        },
      }}
    >
      <DialogTitle
        id={titleId}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2.5, sm: 3.5 },
          pt: { xs: 2.5, sm: 3 },
          pb: 2,
          pr: 8,
        }}
      >
        {leading && (
          <Box sx={{ flexShrink: 0, display: 'grid', placeItems: 'center' }}>{leading}</Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={800} component="div">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" fontWeight={400}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label={closeLabel}
          onClick={onClose}
          disabled={busy}
          sx={{
            position: 'absolute',
            top: { xs: 1.5, sm: 2 },
            right: { xs: 1.5, sm: 2 },
            width: 40,
            height: 40,
            color: 'text.secondary',
            bgcolor: 'rgba(255,255,255,.035)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '11px',
            transition: 'background-color .18s ease, border-color .18s ease, transform .18s ease',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'text.secondary',
              transform: 'rotate(4deg)',
            },
          }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 1, pb: 2 }}>{children}</DialogContent>
      {actions && (
        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

ModalShell.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  leading: PropTypes.node,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  fullScreen: PropTypes.bool,
  closeLabel: PropTypes.string,
};

export default ModalShell;
