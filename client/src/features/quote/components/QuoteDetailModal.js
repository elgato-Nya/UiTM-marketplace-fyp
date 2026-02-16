import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
  Stack,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Close, AccessTime, AttachMoney } from "@mui/icons-material";
import { format } from "date-fns";
import { useTheme } from "../../../hooks/useTheme";
import QuoteStatusChip from "./QuoteStatusChip";
import {
  QUOTE_STATUS,
  QUOTE_PRIORITY_CONFIG,
  QUOTE_CANCEL_REASON_LABELS,
} from "../../../constants/quoteConstant";

/**
 * QuoteDetailModal Component
 *
 * PURPOSE: Display quote details with action buttons
 * PATTERN: Similar to OrderDetailModal
 */
function QuoteDetailModal({
  quote,
  open,
  onClose,
  role = "buyer",
  onAccept,
  onReject,
  onCancel,
  onProvideQuote,
  onStartService,
  onCompleteService,
  isSubmitting = false,
}) {
  const { theme } = useTheme();
  const [actionMode, setActionMode] = useState(null); // 'reject', 'cancel', 'provide'
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
    price: "",
    estimatedDuration: "",
    message: "",
  });

  if (!quote) return null;

  // Access the correct data structure from the quote model
  const listing = quote.listing || {};
  const request = quote.request || {};
  const isBuyer = role === "buyer";

  const formatPrice = (amount) => {
    if (!amount) return "-";
    return `RM ${amount.toFixed(2)}`;
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAction = async (action) => {
    switch (action) {
      case "accept":
        if (onAccept) await onAccept(quote._id);
        break;
      case "reject":
        if (onReject)
          await onReject(quote._id, {
            reason: formData.reason || formData.description,
          });
        setActionMode(null);
        break;
      case "cancel":
        if (onCancel)
          await onCancel(quote._id, {
            reason: formData.reason,
            note: formData.description,
          });
        setActionMode(null);
        break;
      case "provide":
        if (onProvideQuote) {
          await onProvideQuote(quote._id, {
            quotedPrice: parseFloat(formData.price),
            estimatedDuration: formData.estimatedDuration,
            message: formData.message,
          });
        }
        setActionMode(null);
        break;
      case "start":
        if (onStartService) await onStartService(quote._id);
        break;
      case "complete":
        if (onCompleteService) await onCompleteService(quote._id);
        break;
      default:
        break;
    }
  };

  const resetForm = () => {
    setActionMode(null);
    setFormData({
      reason: "",
      description: "",
      price: "",
      estimatedDuration: "",
      message: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Determine available actions based on status and role
  const canAccept = isBuyer && quote.status === QUOTE_STATUS.QUOTED;
  const canReject = isBuyer && quote.status === QUOTE_STATUS.QUOTED;
  const canCancel = [QUOTE_STATUS.PENDING, QUOTE_STATUS.QUOTED].includes(
    quote.status,
  );
  const canProvideQuote = !isBuyer && quote.status === QUOTE_STATUS.PENDING;
  const canStartService = !isBuyer && quote.status === QUOTE_STATUS.PAID;
  const canCompleteService =
    !isBuyer && quote.status === QUOTE_STATUS.IN_PROGRESS;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="quote-detail-title"
    >
      <DialogTitle
        id="quote-detail-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span">
          Quote Request Details
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Close dialog"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Listing Info */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Avatar
            variant="rounded"
            src={listing?.image}
            alt={listing?.name}
            sx={{ width: 80, height: 80 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {listing?.name || "Service"}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {isBuyer 
                ? quote.seller?.shopName || quote.seller?.username || "Seller"
                : quote.buyer?.username || "Customer"}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <QuoteStatusChip status={quote.status} />
              {request.priority !== "normal" && (
                <Chip
                  label={QUOTE_PRIORITY_CONFIG[request.priority]?.label}
                  size="small"
                  color={QUOTE_PRIORITY_CONFIG[request.priority]?.color}
                />
              )}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Request Details */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Request Details
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Message:</strong> {request.message || "No message provided"}
          </Typography>
          {request.timeline && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Timeline:</strong> {request.timeline}
            </Typography>
          )}
          {request.budget && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Budget:</strong> {formatPrice(request.budget)}
            </Typography>
          )}
          {/* Custom Field Values */}
          {request.customFieldValues && request.customFieldValues.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Additional Information
              </Typography>
              {request.customFieldValues.map((field, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  <strong>{field.label}:</strong> {field.value}
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        {/* Quote Settings Snapshot */}
        {listing.quoteSettingsSnapshot && (
          <Box sx={{ mb: 2 }}>
            {listing.quoteSettingsSnapshot.requiresDeposit && (
              <Chip
                label={`${listing.quoteSettingsSnapshot.depositPercentage}% deposit required`}
                size="small"
                color="info"
                sx={{ mr: 1 }}
              />
            )}
            {listing.quoteSettingsSnapshot.responseTime && (
              <Typography variant="caption" color="text.secondary">
                Expected response: {listing.quoteSettingsSnapshot.responseTime}
              </Typography>
            )}
          </Box>
        )}
        
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          Created: {format(new Date(quote.createdAt), "PPP, p")}
        </Typography>

        {/* Seller Quote */}
        {quote.sellerQuote && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Seller's Quote
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.lighter",
                borderRadius: 1,
                border: 1,
                borderColor: "primary.light",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <AttachMoney color="primary" />
                <Typography variant="h6" color="primary.main">
                  {formatPrice(quote.sellerQuote.quotedPrice)}
                </Typography>
              </Box>
              {quote.sellerQuote.estimatedDuration && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2">
                    Est. Duration: {quote.sellerQuote.estimatedDuration}
                  </Typography>
                </Box>
              )}
              {quote.sellerQuote.message && (
                <Typography variant="body2" color="text.secondary">
                  {quote.sellerQuote.message}
                </Typography>
              )}
              {quote.sellerQuote.validUntil && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Valid until:{" "}
                  {format(new Date(quote.sellerQuote.validUntil), "PPP")}
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* Cancellation Info */}
        {quote.status === QUOTE_STATUS.CANCELLED && quote.cancellation && (
          <>
            <Divider sx={{ my: 2 }} />
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Cancellation Reason</Typography>
              <Typography variant="body2">
                {QUOTE_CANCEL_REASON_LABELS[quote.cancellation.reason] ||
                  quote.cancellation.reason}
              </Typography>
              {quote.cancellation.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {quote.cancellation.description}
                </Typography>
              )}
            </Alert>
          </>
        )}

        {/* Action Forms */}
        {actionMode === "provide" && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Provide Your Quote
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Price (RM)"
                type="number"
                value={formData.price}
                onChange={handleInputChange("price")}
                required
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="Estimated Duration"
                value={formData.estimatedDuration}
                onChange={handleInputChange("estimatedDuration")}
                placeholder="e.g., 3-5 days"
                fullWidth
              />
              <TextField
                label="Message to Customer"
                value={formData.message}
                onChange={handleInputChange("message")}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </Box>
        )}

        {(actionMode === "reject" || actionMode === "cancel") && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              {actionMode === "reject" ? "Reject Quote" : "Cancel Request"}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Reason"
                value={formData.reason}
                onChange={handleInputChange("reason")}
                required
                fullWidth
                select
                SelectProps={{ native: true }}
              >
                <option value="">Select a reason</option>
                {Object.entries(QUOTE_CANCEL_REASON_LABELS).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ),
                )}
              </TextField>
              <TextField
                label="Additional Details (Optional)"
                value={formData.description}
                onChange={handleInputChange("description")}
                multiline
                rows={2}
                fullWidth
              />
            </Stack>
          </Box>
        )}

        {/* Timestamps */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Created: {format(new Date(quote.createdAt), "PPp")}
          </Typography>
          {quote.updatedAt !== quote.createdAt && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Updated: {format(new Date(quote.updatedAt), "PPp")}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {/* Show form actions when in action mode */}
        {actionMode ? (
          <>
            <Button onClick={resetForm} disabled={isSubmitting}>
              Back
            </Button>
            <Button
              variant="contained"
              color={actionMode === "provide" ? "primary" : "error"}
              onClick={() => handleAction(actionMode)}
              disabled={
                isSubmitting || (actionMode !== "provide" && !formData.reason)
              }
              startIcon={isSubmitting && <CircularProgress size={16} />}
            >
              {actionMode === "provide" ? "Send Quote" : "Confirm"}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>Close</Button>

            {canCancel && (
              <Button
                color="error"
                onClick={() => setActionMode("cancel")}
                disabled={isSubmitting}
              >
                Cancel Request
              </Button>
            )}

            {canProvideQuote && (
              <Button
                variant="contained"
                onClick={() => setActionMode("provide")}
                disabled={isSubmitting}
              >
                Provide Quote
              </Button>
            )}

            {canReject && (
              <Button
                color="error"
                onClick={() => setActionMode("reject")}
                disabled={isSubmitting}
              >
                Reject
              </Button>
            )}

            {canAccept && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleAction("accept")}
                disabled={isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={16} />}
              >
                Accept Quote
              </Button>
            )}

            {canStartService && (
              <Button
                variant="contained"
                onClick={() => handleAction("start")}
                disabled={isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={16} />}
              >
                Start Service
              </Button>
            )}

            {canCompleteService && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleAction("complete")}
                disabled={isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={16} />}
              >
                Mark Complete
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default QuoteDetailModal;
