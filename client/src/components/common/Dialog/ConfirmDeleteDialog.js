import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Alert,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

/**
 * ConfirmDeleteDialog - Reusable deletion dialog with permanent delete safety
 *
 * Features:
 * - Three action buttons: Cancel, Toggle Availability, Delete Permanently
 * - Requires typing confirmation word for permanent deletion
 * - Cancel button is primary (prominent)
 * - Clear warnings about consequences
 *
 * USAGE EXAMPLES:
 *
 * // Basic delete (no toggle option)
 * <ConfirmDeleteDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onDelete={handleDelete}
 *   itemName="Product ABC"
 *   title="Delete Product"
 *   showToggle={false}
 * />
 *
 * // Delete with toggle option (for listings, posts, etc.)
 * <ConfirmDeleteDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onDelete={handlePermanentDelete}
 *   onToggle={handleMarkUnavailable}
 *   itemName="My Awesome Listing"
 *   title="Delete Listing"
 *   toggleLabel="Mark Unavailable"
 *   warningMessage="All listing data will be permanently removed."
 * />
 *
 * // Custom confirmation word
 * <ConfirmDeleteDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onDelete={handleDelete}
 *   itemName="User Account"
 *   title="Delete Account"
 *   confirmWord="CONFIRM"
 *   showToggle={false}
 * />
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onDelete - Permanent delete handler
 * @param {Function} props.onToggle - Toggle availability handler (optional)
 * @param {string} props.itemName - Name of the item being deleted
 * @param {string} props.title - Dialog title (default: "Delete Item")
 * @param {string} props.confirmWord - Word user must type (default: "DELETE")
 * @param {string} props.warningMessage - Custom warning message
 * @param {string} props.toggleLabel - Label for toggle button
 * @param {boolean} props.showToggle - Show toggle button (default: true)
 */
function ConfirmDeleteDialog({
  open,
  onClose,
  onDelete,
  onToggle,
  itemName = "this item",
  title = "Delete Item",
  confirmWord = "DELETE",
  warningMessage,
  toggleLabel = "Mark Unavailable",
  showToggle = true,
}) {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmText("");
      setError("");
    }
  }, [open]);

  const handleDelete = () => {
    if (confirmText !== confirmWord) {
      setError(`Please type "${confirmWord}" exactly to confirm deletion`);
      return;
    }
    onDelete();
    onClose();
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
    onClose();
  };

  const canDelete = confirmText === confirmWord;

  const defaultWarning =
    warningMessage ||
    `All data associated with ${itemName} will be permanently deleted from the database.`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="delete-dialog"
    >
      <DialogTitle id="delete-dialog">
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="error" />
          {title}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
          Are you sure you want to permanently delete{" "}
          <strong>{itemName}</strong>?
        </Typography>

        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="600" gutterBottom>
            Warning: This action is irreversible!
          </Typography>
          <Typography variant="body2">{defaultWarning}</Typography>
        </Alert>

        <Typography variant="body2" sx={{ mb: 1 }}>
          To confirm permanent deletion, please type{" "}
          <strong>{confirmWord}</strong> below:
        </Typography>

        <TextField
          fullWidth
          value={confirmText}
          onChange={(e) => {
            setConfirmText(e.target.value);
            setError("");
          }}
          placeholder={`Type ${confirmWord} here`}
          error={!!error}
          helperText={error}
          autoComplete="off"
          slotProps={{
            input: {
              style: { fontFamily: "monospace", fontSize: "1rem" },
            },
          }}
          sx={{ mb: 1 }}
        />

        <Typography variant="caption" color="text.secondary">
          Must type exactly: {confirmWord} (in capital letters)
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          size="large"
        >
          Cancel
        </Button>

        {showToggle && onToggle && (
          <Button
            onClick={handleToggle}
            variant="outlined"
            color="warning"
            size="large"
          >
            {toggleLabel}
          </Button>
        )}

        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={!canDelete}
          size="large"
        >
          Delete Permanently
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
