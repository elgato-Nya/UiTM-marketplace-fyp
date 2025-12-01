import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  content = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColour = "primary",
  ariaLabel = "confirm-popup",
  ariaDescription = "confirm-popup-description",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby={ariaLabel}
      aria-describedby={ariaDescription}
    >
      <DialogTitle id={ariaLabel}>{title}</DialogTitle>
      <DialogContent>
        <Typography id={ariaDescription}>{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColour}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default ConfirmDialog;
