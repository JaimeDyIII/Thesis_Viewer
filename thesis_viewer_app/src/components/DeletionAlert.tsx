import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

interface DeletionAlertProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmButton = styled(Button)({
  backgroundColor: "#d32f2f",
  color: "white",
  transition: "all 0.3s ease",
  '&:hover': {
    backgroundColor: "#b71c1c",
    boxShadow: "0px 4px 10px rgba(211, 47, 47, 0.5)",
    transform: "scale(1.05)",
  }
});

const CancelButton = styled(Button)({
  color: "#6a0dad",
  transition: "all 0.3s ease",
  '&:hover': {
    color: "#5a0cb5",
    transform: "scale(1.05)",
  }
});

const DeletionAlert: React.FC<DeletionAlertProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        }
      }}
    >
    <DialogTitle id="alert-dialog-title">
    <Typography variant="h6" fontWeight="bold" color="error" component="span">
        {title}
    </Typography>
    </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <CancelButton onClick={onClose}>
          Cancel
        </CancelButton>
        <ConfirmButton onClick={onConfirm} variant="contained" autoFocus>
          Confirm
        </ConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeletionAlert;