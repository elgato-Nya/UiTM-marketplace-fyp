import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

import {
  QUOTE_LIMITS,
  QUOTE_FIELD_TYPES,
} from "../../../constants/listingConstant";

/**
 * QuoteSettings Component
 *
 * PURPOSE: Configure quote settings for service listings
 * USAGE: Used in EditListingPage for services that offer quotes
 *
 * PATTERN: Follows existing form component patterns
 */
const QuoteSettings = ({
  settings = null,
  onChange,
  disabled = false,
  isLoading = false,
}) => {
  const [localSettings, setLocalSettings] = useState({
    enabled: false,
    autoAccept: false,
    minPrice: "",
    maxPrice: "",
    responseTime: "",
    requiresDeposit: false,
    depositPercentage: "",
    customFields: [],
  });
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
    required: false,
    options: [],
  });
  const [newOption, setNewOption] = useState("");
  const [errors, setErrors] = useState({});

  // Initialize from props
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        enabled: settings.enabled ?? false,
        autoAccept: settings.autoAccept ?? false,
        minPrice: settings.minPrice?.toString() ?? "",
        maxPrice: settings.maxPrice?.toString() ?? "",
        responseTime: settings.responseTime ?? "",
        requiresDeposit: settings.requiresDeposit ?? false,
        depositPercentage: settings.depositPercentage?.toString() ?? "",
        customFields: settings.customFields ?? [],
      });
    }
  }, [settings]);

  // Validate settings
  const validateSettings = useCallback(() => {
    const newErrors = {};

    const minPrice = parseFloat(localSettings.minPrice);
    const maxPrice = parseFloat(localSettings.maxPrice);

    if (localSettings.minPrice && (isNaN(minPrice) || minPrice < 0)) {
      newErrors.minPrice = "Min price must be a positive number";
    }

    if (localSettings.maxPrice && (isNaN(maxPrice) || maxPrice < 0)) {
      newErrors.maxPrice = "Max price must be a positive number";
    }

    if (!isNaN(minPrice) && !isNaN(maxPrice) && maxPrice < minPrice) {
      newErrors.maxPrice = "Max price must be greater than min price";
    }

    if (localSettings.requiresDeposit) {
      const deposit = parseFloat(localSettings.depositPercentage);
      if (
        isNaN(deposit) ||
        deposit < QUOTE_LIMITS.MIN_DEPOSIT_PERCENTAGE ||
        deposit > QUOTE_LIMITS.MAX_DEPOSIT_PERCENTAGE
      ) {
        newErrors.depositPercentage = `Deposit must be between ${QUOTE_LIMITS.MIN_DEPOSIT_PERCENTAGE}% and ${QUOTE_LIMITS.MAX_DEPOSIT_PERCENTAGE}%`;
      }
    }

    if (
      localSettings.responseTime &&
      localSettings.responseTime.length > QUOTE_LIMITS.MAX_RESPONSE_TIME_LENGTH
    ) {
      newErrors.responseTime = `Maximum ${QUOTE_LIMITS.MAX_RESPONSE_TIME_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [localSettings]);

  // Handle settings change
  const handleChange = useCallback(
    (field, value) => {
      const updated = { ...localSettings, [field]: value };
      setLocalSettings(updated);

      // Convert to proper format for parent
      const settingsData = {
        enabled: updated.enabled,
        autoAccept: updated.autoAccept,
        minPrice: updated.minPrice ? parseFloat(updated.minPrice) : undefined,
        maxPrice: updated.maxPrice ? parseFloat(updated.maxPrice) : undefined,
        responseTime: updated.responseTime || undefined,
        requiresDeposit: updated.requiresDeposit,
        depositPercentage: updated.depositPercentage
          ? parseFloat(updated.depositPercentage)
          : undefined,
        customFields: updated.customFields,
      };

      onChange(settingsData);
    },
    [localSettings, onChange]
  );

  // Toggle enabled
  const handleToggleEnabled = useCallback(() => {
    handleChange("enabled", !localSettings.enabled);
  }, [localSettings.enabled, handleChange]);

  // Add custom field
  const handleAddField = useCallback(() => {
    if (!newField.label.trim()) return;

    if (localSettings.customFields.length >= QUOTE_LIMITS.MAX_CUSTOM_FIELDS) {
      return;
    }

    const field = {
      ...newField,
      label: newField.label.trim(),
      options: newField.type === "select" ? newField.options : [],
    };

    const updatedFields = [...localSettings.customFields, field];
    handleChange("customFields", updatedFields);

    // Reset new field form
    setNewField({
      label: "",
      type: "text",
      required: false,
      options: [],
    });
    setNewOption("");
  }, [newField, localSettings.customFields, handleChange]);

  // Remove custom field
  const handleRemoveField = useCallback(
    (index) => {
      const updatedFields = localSettings.customFields.filter(
        (_, i) => i !== index
      );
      handleChange("customFields", updatedFields);
    },
    [localSettings.customFields, handleChange]
  );

  // Add option to new field
  const handleAddOption = useCallback(() => {
    if (!newOption.trim()) return;
    if (newField.options.length >= QUOTE_LIMITS.MAX_FIELD_OPTIONS) return;

    setNewField({
      ...newField,
      options: [...newField.options, newOption.trim()],
    });
    setNewOption("");
  }, [newOption, newField]);

  // Remove option from new field
  const handleRemoveOption = useCallback(
    (index) => {
      setNewField({
        ...newField,
        options: newField.options.filter((_, i) => i !== index),
      });
    },
    [newField]
  );

  const canAddMoreFields =
    localSettings.customFields.length < QUOTE_LIMITS.MAX_CUSTOM_FIELDS;

  return (
    <Box>
      {/* Enable Quote System */}
      <FormControlLabel
        control={
          <Switch
            checked={localSettings.enabled}
            onChange={handleToggleEnabled}
            disabled={disabled || isLoading}
          />
        }
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>Enable quote requests for this service</Typography>
            {localSettings.enabled && (
              <Chip label="Active" size="small" color="success" />
            )}
          </Box>
        }
      />

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Allow customers to request custom quotes for your service.
      </Typography>

      {localSettings.enabled && (
        <>
          <Divider sx={{ my: 3 }} />

          {/* Price Range */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: "medium" }}>
            Price Range (Optional)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Minimum Price (RM)"
                type="number"
                value={localSettings.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                error={!!errors.minPrice}
                helperText={errors.minPrice || "Starting price for quotes"}
                fullWidth
                size="small"
                disabled={disabled || isLoading}
                slotProps={{ input: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Maximum Price (RM)"
                type="number"
                value={localSettings.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                error={!!errors.maxPrice}
                helperText={errors.maxPrice || "Maximum price for quotes"}
                fullWidth
                size="small"
                disabled={disabled || isLoading}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>

          {/* Response Time */}
          <TextField
            label="Expected Response Time"
            value={localSettings.responseTime}
            onChange={(e) => handleChange("responseTime", e.target.value)}
            error={!!errors.responseTime}
            helperText={
              errors.responseTime ||
              "e.g., 'Within 24 hours', '1-2 business days'"
            }
            fullWidth
            size="small"
            disabled={disabled || isLoading}
            sx={{ mb: 3 }}
          />

          {/* Auto Accept */}
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.autoAccept}
                onChange={(e) => handleChange("autoAccept", e.target.checked)}
                disabled={disabled || isLoading}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Auto-accept quote requests
                <Tooltip title="Automatically accept all quote requests without manual approval">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
            }
            sx={{ mb: 2 }}
          />

          {/* Deposit Settings */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: "medium" }}>
            Deposit Settings
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={localSettings.requiresDeposit}
                onChange={(e) =>
                  handleChange("requiresDeposit", e.target.checked)
                }
                disabled={disabled || isLoading}
              />
            }
            label="Require deposit before starting work"
            sx={{ mb: 2 }}
          />

          {localSettings.requiresDeposit && (
            <TextField
              label="Deposit Percentage (%)"
              type="number"
              value={localSettings.depositPercentage}
              onChange={(e) =>
                handleChange("depositPercentage", e.target.value)
              }
              error={!!errors.depositPercentage}
              helperText={
                errors.depositPercentage ||
                `${QUOTE_LIMITS.MIN_DEPOSIT_PERCENTAGE}% - ${QUOTE_LIMITS.MAX_DEPOSIT_PERCENTAGE}%`
              }
              fullWidth
              size="small"
              disabled={disabled || isLoading}
              inputProps={{
                min: QUOTE_LIMITS.MIN_DEPOSIT_PERCENTAGE,
                max: QUOTE_LIMITS.MAX_DEPOSIT_PERCENTAGE,
              }}
              sx={{ mb: 3, maxWidth: 200 }}
            />
          )}

          {/* Custom Fields */}
          <Divider sx={{ my: 3 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
              Custom Fields ({localSettings.customFields.length}/
              {QUOTE_LIMITS.MAX_CUSTOM_FIELDS})
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            Add custom fields to collect specific information from customers
            when they request a quote.
          </Alert>

          {/* Existing custom fields */}
          {localSettings.customFields.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {localSettings.customFields.map((field, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {field.label}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={field.type}
                        size="small"
                        variant="outlined"
                      />
                      {field.required && (
                        <Chip
                          label="Required"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {field.type === "select" && field.options?.length > 0 && (
                        <Chip
                          label={`${field.options.length} options`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => handleRemoveField(index)}
                    disabled={disabled || isLoading}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {/* Add new custom field */}
          {canAddMoreFields && (
            <Box
              sx={{
                p: 2,
                border: "1px dashed",
                borderColor: "primary.main",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                Add New Field
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    label="Field Label"
                    value={newField.label}
                    onChange={(e) =>
                      setNewField({ ...newField, label: e.target.value })
                    }
                    fullWidth
                    size="small"
                    disabled={disabled || isLoading}
                    placeholder="e.g., Project Description"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Field Type</InputLabel>
                    <Select
                      value={newField.type}
                      onChange={(e) =>
                        setNewField({ ...newField, type: e.target.value })
                      }
                      label="Field Type"
                      disabled={disabled || isLoading}
                    >
                      {Object.entries(QUOTE_FIELD_TYPES).map(
                        ([key, typeConfig]) => (
                          <MenuItem key={key} value={typeConfig.value}>
                            {typeConfig.label}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newField.required}
                        onChange={(e) =>
                          setNewField({
                            ...newField,
                            required: e.target.checked,
                          })
                        }
                        disabled={disabled || isLoading}
                        size="small"
                      />
                    }
                    label="Required"
                  />
                </Grid>
              </Grid>

              {/* Options for select type */}
              {newField.type === "select" && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Options ({newField.options.length}/
                    {QUOTE_LIMITS.MAX_FIELD_OPTIONS})
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <TextField
                      label="Add Option"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      size="small"
                      disabled={
                        disabled ||
                        isLoading ||
                        newField.options.length >=
                          QUOTE_LIMITS.MAX_FIELD_OPTIONS
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddOption}
                      disabled={
                        disabled ||
                        isLoading ||
                        !newOption.trim() ||
                        newField.options.length >=
                          QUOTE_LIMITS.MAX_FIELD_OPTIONS
                      }
                      variant="outlined"
                      size="small"
                    >
                      Add
                    </Button>
                  </Box>
                  {newField.options.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {newField.options.map((option, index) => (
                        <Chip
                          key={index}
                          label={option}
                          onDelete={() => handleRemoveOption(index)}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              <Button
                onClick={handleAddField}
                disabled={disabled || isLoading || !newField.label.trim()}
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                sx={{ mt: 2 }}
              >
                Add Field
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

QuoteSettings.propTypes = {
  settings: PropTypes.shape({
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
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default QuoteSettings;
