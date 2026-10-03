import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';

const Modal = ({ show, handleClose, title, children }) => (
  <Dialog
    open={show}
    onClose={handleClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        backgroundColor: '#1a1a1a',
        backgroundImage: 'none',
      },
    }}
  >
    <DialogTitle
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 700,
      }}
    >
      {title}
      <IconButton onClick={handleClose} size="small" aria-label="Close dialog">
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ py: 3 }}>{children}</DialogContent>
    <DialogActions>
      <Button onClick={handleClose} variant="outlined">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node,
};

export default Modal;
