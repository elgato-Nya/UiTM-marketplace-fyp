import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { Warning } from "@mui/icons-material";

/**
 * CancelOrderDialog Component
 *
 * PURPOSE: Provide a dialog for users to cancel orders with a reason
 * FEATURES:
 * - Predefined cancellation reasons
 * - Optional description field
 * - Form validation
 * - Accessible form controls
 *
 * @param {boolean} open - Whether dialog is open
 * @param {Object} order - Order to cancel
 * @param {function} onClose - Callback when dialog closes
 * @param {function} onConfirm - Callback with (orderId, reason, description)
 * @param {boolean} loading - Whether cancellation is in progress
 */
function CancelOrderDialog({ open, order, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Match server-side CancelReason enum values
  const cancellationReasons = [
    { value: "buyer_request", label: "Changed my mind / No longer needed" },
    { value: "payment_failed", label: "Payment issues" },
    { value: "delivery_issues", label: "Delivery concerns" },
    { value: "stock_insufficient", label: "Item unavailable" },
    { value: "other", label: "Other reason" },
  ];

  const handleReasonChange = (event) => {
    setReason(event.target.value);
    setError("");
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleConfirm = () => {
    // Validate reason
    if (!reason) {
      setError("Please select a cancellation reason");
      return;
    }

    // If "other" is selected, description is required
    if (reason === "other" && !description.trim()) {
      setError("Please provide a description for other reason");
      return;
    }

    // Call parent's confirm handler
    onConfirm(order._id, reason, description);
  };

  const handleClose = () => {
    if (!loading) {
      setReason("");
      setDescription("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="cancel-order-dialog-title"
    >
      <DialogTitle
        id="cancel-order-dialog-title"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Warning color="warning" />
        Cancel Order
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Order Number: <strong>{order?.orderNumber}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
          <FormLabel
            component="legend"
            sx={{ mb: 1, fontWeight: 500 }}
            required
          >
            Reason for cancellation
          </FormLabel>
          <RadioGroup
            aria-label="cancellation reason"
            name="cancellation-reason"
            value={reason}
            onChange={handleReasonChange}
          >
            {cancellationReasons.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                sx={{
                  mb: 0.5,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.938rem",
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={3}
          label={
            reason === "other"
              ? "Please describe your reason (Required)"
              : "Additional details (Optional)"
          }
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Provide additional details about your cancellation..."
          variant="outlined"
          required={reason === "other"}
          helperText={
            reason === "other"
              ? "Please provide a detailed reason for cancellation"
              : "Optional: Add any additional information"
          }
          sx={{ mb: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Keep Order
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          autoFocus
        >
          {loading ? "Cancelling..." : "Cancel Order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CancelOrderDialog;
