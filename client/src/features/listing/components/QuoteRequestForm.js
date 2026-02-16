import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  RequestQuote as QuoteIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

import { formatPrice } from "../../../utils/formatUtils";
import { QUOTE_FIELD_TYPES } from "../../../constants/listingConstant";

/**
 * QuoteRequestForm Component
 *
 * PURPOSE: Allow customers to request quotes for services with quote settings
 * USAGE: Used on ListingDetailPage when a service has quote settings enabled
 *
 * PATTERN: Follows existing dialog-based form patterns
 */
const QuoteRequestForm = ({
  open,
  onClose,
  listing,
  onSubmit,
  isLoading = false,
}) => {
  const quoteSettings = listing?.quoteSettings;
  const customFields = quoteSettings?.customFields || [];

  const [formData, setFormData] = useState({
    message: "",
    budget: "",
    timeline: "",
    customFieldValues: {},
  });
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Message is always required
    if (!formData.message.trim()) {
      newErrors.message = "Please describe what you need";
    }

    // Validate required custom fields
    customFields.forEach((field) => {
      if (field.required) {
        const value = formData.customFieldValues[field.label];
        if (!value || (typeof value === "string" && !value.trim())) {
          newErrors[`custom_${field.label}`] = `${field.label} is required`;
        }
      }
    });

    // Budget validation
    if (formData.budget) {
      const budget = parseFloat(formData.budget);
      if (isNaN(budget) || budget < 0) {
        newErrors.budget = "Please enter a valid budget";
      }
      if (quoteSettings?.minPrice && budget < quoteSettings.minPrice) {
        newErrors.budget = `Minimum budget is ${formatPrice(quoteSettings.minPrice)}`;
      }
      if (quoteSettings?.maxPrice && budget > quoteSettings.maxPrice) {
        newErrors.budget = `Maximum budget is ${formatPrice(quoteSettings.maxPrice)}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, customFields, quoteSettings]);

  // Handle form change
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle custom field change
  const handleCustomFieldChange = useCallback((fieldLabel, value) => {
    setFormData((prev) => ({
      ...prev,
      customFieldValues: {
        ...prev.customFieldValues,
        [fieldLabel]: value,
      },
    }));
  }, []);

  // Handle submit
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      if (!agreedToTerms) {
        setErrors((prev) => ({
          ...prev,
          terms: "Please agree to the terms to continue",
        }));
        return;
      }

      // Transform customFieldValues from object to array format expected by server
      const customFieldValuesArray = customFields
        .filter((field) => {
          const value = formData.customFieldValues[field.label];
          return value !== undefined && value !== "";
        })
        .map((field) => ({
          label: field.label,
          value: formData.customFieldValues[field.label],
          fieldType: field.type,
        }));

      const quoteRequest = {
        listingId: listing._id,
        message: formData.message.trim(),
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        timeline: formData.timeline.trim() || undefined,
        customFieldValues:
          customFieldValuesArray.length > 0
            ? customFieldValuesArray
            : undefined,
      };

      await onSubmit(quoteRequest);
    },
    [formData, listing, customFields, validateForm, agreedToTerms, onSubmit]
  );

  // Handle close and reset
  const handleClose = useCallback(() => {
    setFormData({
      message: "",
      budget: "",
      timeline: "",
      customFieldValues: {},
    });
    setErrors({});
    setAgreedToTerms(false);
    onClose();
  }, [onClose]);

  // Render custom field based on type
  const renderCustomField = (field) => {
    const value = formData.customFieldValues[field.label] || "";
    const error = errors[`custom_${field.label}`];

    switch (field.type) {
      case QUOTE_FIELD_TYPES.TEXT.value:
        return (
          <TextField
            key={field.label}
            label={field.label}
            value={value}
            onChange={(e) =>
              handleCustomFieldChange(field.label, e.target.value)
            }
            error={!!error}
            helperText={error}
            required={field.required}
            fullWidth
            size="small"
            disabled={isLoading}
          />
        );

      case QUOTE_FIELD_TYPES.TEXTAREA.value:
        return (
          <TextField
            key={field.label}
            label={field.label}
            value={value}
            onChange={(e) =>
              handleCustomFieldChange(field.label, e.target.value)
            }
            error={!!error}
            helperText={error}
            required={field.required}
            fullWidth
            size="small"
            multiline
            rows={3}
            disabled={isLoading}
          />
        );

      case QUOTE_FIELD_TYPES.NUMBER.value:
        return (
          <TextField
            key={field.label}
            label={field.label}
            type="number"
            value={value}
            onChange={(e) =>
              handleCustomFieldChange(field.label, e.target.value)
            }
            error={!!error}
            helperText={error}
            required={field.required}
            fullWidth
            size="small"
            disabled={isLoading}
          />
        );

      case QUOTE_FIELD_TYPES.SELECT.value:
        return (
          <FormControl
            key={field.label}
            fullWidth
            size="small"
            error={!!error}
            required={field.required}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) =>
                handleCustomFieldChange(field.label, e.target.value)
              }
              label={field.label}
              disabled={isLoading}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
          </FormControl>
        );

      case QUOTE_FIELD_TYPES.DATE.value:
        return (
          <TextField
            key={field.label}
            label={field.label}
            type="date"
            value={value}
            onChange={(e) =>
              handleCustomFieldChange(field.label, e.target.value)
            }
            error={!!error}
            helperText={error}
            required={field.required}
            fullWidth
            size="small"
            disabled={isLoading}
            InputLabelProps={{ shrink: true }}
          />
        );

      default:
        return null;
    }
  };

  if (!listing || !quoteSettings?.enabled) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="quote-request-dialog-title"
    >
      <DialogTitle id="quote-request-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QuoteIcon color="primary" />
          Request a Quote
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {/* Listing Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Service
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {listing.name}
            </Typography>
            {quoteSettings.minPrice !== undefined ||
            quoteSettings.maxPrice !== undefined ? (
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                {quoteSettings.minPrice !== undefined && (
                  <Chip
                    label={`From ${formatPrice(quoteSettings.minPrice)}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {quoteSettings.maxPrice !== undefined && (
                  <Chip
                    label={`Up to ${formatPrice(quoteSettings.maxPrice)}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            ) : null}
            {quoteSettings.responseTime && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Expected response: {quoteSettings.responseTime}
              </Typography>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Main Fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Describe what you need"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              error={!!errors.message}
              helperText={
                errors.message || "Be specific about your requirements"
              }
              required
              fullWidth
              multiline
              rows={4}
              disabled={isLoading}
            />

            <TextField
              label="Your Budget (RM)"
              type="number"
              value={formData.budget}
              onChange={(e) => handleChange("budget", e.target.value)}
              error={!!errors.budget}
              helperText={
                errors.budget ||
                (quoteSettings.minPrice !== undefined &&
                quoteSettings.maxPrice !== undefined
                  ? `Budget range: ${formatPrice(quoteSettings.minPrice)} - ${formatPrice(quoteSettings.maxPrice)}`
                  : "Optional - helps the seller provide accurate quote")
              }
              fullWidth
              size="small"
              disabled={isLoading}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label="Preferred Timeline"
              value={formData.timeline}
              onChange={(e) => handleChange("timeline", e.target.value)}
              helperText="e.g., 'Within 2 weeks', 'By end of month'"
              fullWidth
              size="small"
              disabled={isLoading}
            />
          </Box>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Additional Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {customFields.map((field) => renderCustomField(field))}
              </Box>
            </>
          )}

          {/* Deposit Notice */}
          {quoteSettings.requiresDeposit &&
            quoteSettings.depositPercentage > 0 && (
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 3,
                  "& .MuiAlert-message": {
                    width: "100%",
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  💰 {quoteSettings.depositPercentage}% Deposit Required
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pay after accepting the seller&apos;s quote, before work starts.
                </Typography>
              </Alert>
            )}

          {/* Terms Agreement */}
          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isLoading}
                />
              }
              label={
                <Typography variant="body2">
                  I understand this is a quote request and not a confirmed
                  order. The final price may vary based on my requirements.
                </Typography>
              }
            />
            {errors.terms && (
              <Typography variant="caption" color="error">
                {errors.terms}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !agreedToTerms}
            startIcon={
              isLoading ? <CircularProgress size={16} /> : <SendIcon />
            }
          >
            {isLoading ? "Submitting..." : "Request Quote"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

QuoteRequestForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    quoteSettings: PropTypes.shape({
      enabled: PropTypes.bool,
      autoAccept: PropTypes.bool,
      minPrice: PropTypes.number,
      maxPrice: PropTypes.number,
      responseTime: PropTypes.string,
      requiresDeposit: PropTypes.bool,
      depositPercentage: PropTypes.number,
      customFields: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          required: PropTypes.bool,
          options: PropTypes.arrayOf(PropTypes.string),
        })
      ),
    }),
  }),
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default QuoteRequestForm;
