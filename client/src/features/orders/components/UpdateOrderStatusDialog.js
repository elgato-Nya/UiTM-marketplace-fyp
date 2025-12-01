import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Typography,
  Alert,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { Info, CheckCircle } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { getNextStatuses, getStatusColor } from "../utils/orderHelper";
import OrderStatusBadge from "./OrderStatusBadge";

/**
 * UpdateOrderStatusDialog Component
 *
 * PURPOSE: Allow sellers to update order status with proper validation
 * FEATURES:
 * - Shows only valid next statuses based on current status
 * - Optional notes field for status change reason
 * - Visual feedback with status badges
 * - Responsive design
 * - Accessibility support
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Callback to close dialog
 * @param {function} onConfirm - Callback with (orderId, newStatus, notes)
 * @param {Object} order - Order object with current status
 * @param {boolean} loading - Loading state during submission
 */
function UpdateOrderStatusDialog({
  open,
  onClose,
  onConfirm,
  order,
  loading = false,
}) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedStatus, setSelectedStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Get valid next statuses when order changes
  const validNextStatuses = order ? getNextStatuses(order.status) : [];

  // Reset form when dialog opens/closes or order changes
  useEffect(() => {
    if (open && order) {
      setSelectedStatus("");
      setNotes("");
      setError("");
    }
  }, [open, order]);

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setError("");
  };

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handleSubmit = () => {
    if (!selectedStatus) {
      setError("Please select a new status");
      return;
    }

    if (onConfirm) {
      onConfirm(order._id, selectedStatus, notes);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!order) return null;

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      confirmed: "Accept the order and start preparing",
      processing: "Order is being prepared for shipment",
      shipped: "Order has been shipped to customer",
      delivered: "Order has been delivered to customer",
      completed: "Order is complete and finalized",
      cancelled: "Cancel this order (stock will be restored)",
    };
    return descriptions[status] || "";
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="update-status-dialog-title"
      disableEscapeKeyDown={loading}
    >
      <DialogTitle
        id="update-status-dialog-title"
        sx={{
          pb: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" component="h2" fontWeight={600}>
          Update Order Status
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Order #{order.orderNumber}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Current Status Display */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 1 }}
          >
            Current Status
          </Typography>
          <OrderStatusBadge status={order.status} size="medium" />
        </Box>

        {/* Status Selection */}
        {validNextStatuses.length > 0 ? (
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel
              component="legend"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "text.primary",
                "&.Mui-focused": {
                  color: "text.primary",
                },
              }}
            >
              Select New Status *
            </FormLabel>
            <RadioGroup
              aria-label="order status"
              name="status"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              {validNextStatuses.map((status) => (
                <Box
                  key={status}
                  sx={{
                    mb: 1.5,
                    p: 2,
                    border: 1,
                    borderColor:
                      selectedStatus === status ? "primary.main" : "divider",
                    borderRadius: 1,
                    backgroundColor:
                      selectedStatus === status ? "primary.50" : "transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <Radio
                      value={status}
                      sx={{ mt: -0.5 }}
                      disabled={loading}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body1" fontWeight={500}>
                          {getStatusLabel(status)}
                        </Typography>
                        <Chip
                          label={status}
                          size="small"
                          color={getStatusColor(status)}
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.875rem" }}
                      >
                        {getStatusDescription(status)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
        ) : (
          <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
            This order is in a final status and cannot be updated further.
          </Alert>
        )}

        {/* Notes Field */}
        {validNextStatuses.length > 0 && (
          <TextField
            label="Notes (Optional)"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={handleNotesChange}
            placeholder="Add any relevant information about this status change..."
            helperText={`${notes.length}/250 characters`}
            inputProps={{ maxLength: 250 }}
            disabled={loading}
            sx={{ mb: 2 }}
          />
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Info Box */}
        {selectedStatus && (
          <Alert
            severity="success"
            icon={<CheckCircle />}
            sx={{ mt: 2, backgroundColor: "success.50" }}
          >
            <Typography variant="body2" fontWeight={500}>
              Ready to update
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Order status will change from{" "}
              <strong>{getStatusLabel(order.status)}</strong> to{" "}
              <strong>{getStatusLabel(selectedStatus)}</strong>
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          borderTop: 1,
          borderColor: "divider",
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={
            !selectedStatus || loading || validNextStatuses.length === 0
          }
          sx={{ minWidth: 120 }}
        >
          {loading ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateOrderStatusDialog;
