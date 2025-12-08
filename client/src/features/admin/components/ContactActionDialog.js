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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Close } from "@mui/icons-material";

/**
 * ContactActionDialog Component
 *
 * PURPOSE: Multi-purpose dialog for contact/report actions
 * FEATURES:
 * - Status update (pending/in-progress/resolved/closed/spam)
 * - Add admin response (visible to submitter)
 * - Add internal note (admin-only, not visible to submitter)
 * - Take moderation action on reports (content_removed/user_warned/user_suspended/etc)
 * - Action-specific form fields
 * - Validation for required fields
 * - Loading state during API calls
 *
 * PROPS:
 * - open: Boolean dialog open state
 * - onClose: Close handler
 * - actionType: 'status', 'response', 'note', 'report_action'
 * - contact: Contact/report object
 * - actionData: Object with status, response, note, actionTaken fields
 * - onDataChange: Handler for form field changes
 * - onConfirm: Confirm action handler
 * - loading: Boolean loading state
 */
const ContactActionDialog = ({
  open,
  onClose,
  actionType,
  contact,
  actionData = {},
  onDataChange,
  onConfirm,
  loading = false,
}) => {
  const actionConfig = {
    status: {
      title: "Update Status",
      description: "Change the status of this contact submission.",
      fieldType: "select",
      fieldLabel: "New Status",
      fieldKey: "status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "in-progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
        { value: "spam", label: "Spam" },
      ],
      confirmText: "Update Status",
      required: true,
      ariaLabel: "Update contact status dialog",
    },
    response: {
      title: "Add Admin Response",
      description:
        "This response will be visible to the submitter. Use this to communicate directly with them.",
      fieldType: "text",
      fieldLabel: "Response Message",
      fieldKey: "response",
      placeholder: "Type your response to the submitter...",
      multiline: true,
      rows: 4,
      confirmText: "Send Response",
      required: true,
      ariaLabel: "Add admin response dialog",
    },
    note: {
      title: "Add Internal Note",
      description:
        "This note is internal only and will NOT be visible to the submitter. Use this for team communication.",
      fieldType: "text",
      fieldLabel: "Internal Note",
      fieldKey: "note",
      placeholder: "Add an internal note for your team...",
      multiline: true,
      rows: 3,
      confirmText: "Add Note",
      required: true,
      ariaLabel: "Add internal note dialog",
    },
    report_action: {
      title: "Take Moderation Action",
      description:
        "Take action on this content report. This will update the report status and may trigger user/content actions.",
      fieldType: "select",
      fieldLabel: "Action to Take",
      fieldKey: "actionTaken",
      options: [
        { value: "no_action", label: "No Action Required" },
        { value: "content_removed", label: "Remove Content" },
        { value: "listing_removed", label: "Remove Listing" },
        { value: "user_warned", label: "Warn User" },
        { value: "user_suspended", label: "Suspend User" },
        { value: "user_banned", label: "Ban User" },
      ],
      confirmText: "Take Action",
      required: true,
      showWarning: true,
      warningMessage:
        "⚠️ Warning: Actions like suspending or banning users are serious moderation decisions. Please ensure you have reviewed all evidence.",
      ariaLabel: "Take moderation action dialog",
    },
  };

  const config = actionConfig[actionType] || actionConfig.status;
  const fieldValue = actionData[config.fieldKey] || "";

  const handleConfirm = () => {
    // Validate required field
    if (config.required && !fieldValue.trim()) {
      return;
    }
    onConfirm();
  };

  const handleFieldChange = (value) => {
    onDataChange(config.fieldKey, value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="action-dialog-title"
      aria-describedby="action-dialog-description"
    >
      <DialogTitle id="action-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", pr: 6 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {config.title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={loading}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent id="action-dialog-description">
        <Box sx={{ pt: 2 }}>
          {/* Description */}
          {config.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {config.description}
            </Typography>
          )}

          {/* Warning Alert */}
          {config.showWarning && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {config.warningMessage}
            </Alert>
          )}

          {/* Contact Context */}
          {contact && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Submission
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {contact.subject}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                From: {contact.name} ({contact.email})
              </Typography>
            </Box>
          )}

          {/* Form Field */}
          {config.fieldType === "select" ? (
            <FormControl fullWidth required={config.required}>
              <InputLabel id={`${config.fieldKey}-label`}>
                {config.fieldLabel}
              </InputLabel>
              <Select
                labelId={`${config.fieldKey}-label`}
                value={fieldValue}
                label={config.fieldLabel}
                onChange={(e) => handleFieldChange(e.target.value)}
                disabled={loading}
              >
                {config.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth
              label={config.fieldLabel}
              placeholder={config.placeholder}
              value={fieldValue}
              onChange={(e) => handleFieldChange(e.target.value)}
              multiline={config.multiline}
              rows={config.rows}
              required={config.required}
              disabled={loading}
              helperText={
                config.required && !fieldValue.trim()
                  ? "This field is required"
                  : ""
              }
              error={config.required && !fieldValue.trim()}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || (config.required && !fieldValue.trim())}
          color={actionType === "report_action" ? "warning" : "primary"}
        >
          {loading ? <CircularProgress size={24} /> : config.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactActionDialog;
