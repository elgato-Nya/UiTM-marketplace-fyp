import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";

/**
 * MerchantActionDialog Component
 *
 * PURPOSE: Confirmation dialog for merchant actions (verify, reject, suspend, reactivate)
 * FEATURES:
 * - Action-specific messaging
 * - Optional/Required reason field
 * - Warning alerts for critical actions
 * - Loading state during API calls
 * - Validation for required fields
 *
 * ACCESSIBILITY:
 * - Descriptive dialog titles
 * - Helper text for inputs
 * - ARIA labels for actions
 * - Disabled states during loading
 */
const MerchantActionDialog = ({
  open,
  onClose,
  actionType,
  merchant,
  reason,
  onReasonChange,
  onConfirm,
  loading,
}) => {
  const actionConfig = {
    verify: {
      title: "Approve Merchant",
      message: "Are you sure you want to approve this merchant?",
      reasonLabel: "Note (optional)",
      reasonPlaceholder: "Add a note for this approval...",
      reasonRequired: false,
      color: "success",
      confirmText: "Approve",
      showWarning: false,
      ariaLabel: "Approve merchant confirmation dialog",
    },
    reject: {
      title: "Reject Merchant",
      message: null,
      reasonLabel: "Reason *",
      reasonPlaceholder: "Explain why this merchant is being rejected...",
      reasonRequired: true,
      color: "error",
      confirmText: "Reject",
      showWarning: true,
      warningMessage:
        "This action will prevent the merchant from selling on the platform.",
      ariaLabel: "Reject merchant confirmation dialog",
    },
    suspend: {
      title: "Suspend Merchant",
      message: null,
      reasonLabel: "Reason *",
      reasonPlaceholder: "Explain why this merchant is being suspended...",
      reasonRequired: true,
      color: "error",
      confirmText: "Suspend",
      showWarning: true,
      warningMessage:
        "This action will prevent the merchant from selling on the platform.",
      ariaLabel: "Suspend merchant confirmation dialog",
    },
    reactivate: {
      title: "Reactivate Merchant",
      message:
        "Are you sure you want to reactivate this merchant? They will be able to sell again.",
      reasonLabel: "Note (optional)",
      reasonPlaceholder: "Add a note for this reactivation...",
      reasonRequired: false,
      color: "success",
      confirmText: "Reactivate",
      showWarning: false,
      ariaLabel: "Reactivate merchant confirmation dialog",
    },
  };

  const config = actionConfig[actionType] || actionConfig.verify;

  const handleConfirm = () => {
    // Validate required reason
    if (config.reasonRequired && !reason.trim()) {
      return;
    }
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="sm"
      fullWidth
      aria-labelledby="action-dialog-title"
      aria-describedby="action-dialog-description"
      aria-label={config.ariaLabel}
    >
      <DialogTitle id="action-dialog-title">
        {config.title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent id="action-dialog-description">
        {config.showWarning && (
          <Alert severity="warning" sx={{ mb: 2 }} role="alert">
            {config.warningMessage}
          </Alert>
        )}

        {config.message && (
          <Typography variant="body2" gutterBottom>
            {config.message}
          </Typography>
        )}

        {merchant && (
          <Box sx={{ my: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Merchant:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {merchant.merchantDetails?.shopName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{merchant.profile?.username}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          rows={config.reasonRequired ? 4 : 3}
          label={config.reasonLabel}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder={config.reasonPlaceholder}
          required={config.reasonRequired}
          error={config.reasonRequired && !reason.trim() && reason !== ""}
          helperText={
            config.reasonRequired
              ? "This reason will be sent to the merchant"
              : undefined
          }
          sx={{ mt: 2 }}
          disabled={loading}
          aria-label={config.reasonLabel}
          aria-required={config.reasonRequired}
        />
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading || (config.reasonRequired && !reason.trim())}
          color={config.color}
          aria-label={`Confirm ${actionType} action`}
        >
          {loading ? (
            <CircularProgress size={24} aria-label="Processing action" />
          ) : (
            config.confirmText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MerchantActionDialog;
