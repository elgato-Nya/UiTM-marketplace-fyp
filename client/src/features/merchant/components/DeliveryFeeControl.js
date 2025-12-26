import React from "react";
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * DeliveryFeeControl Component
 *
 * PURPOSE: Reusable control for individual delivery fee settings
 * PROPS:
 *  - label: String - Display label (e.g., "Personal Delivery")
 *  - enabled: Boolean - Whether delivery type is enabled
 *  - fee: Number - Delivery fee amount (0-100)
 *  - onEnabledChange: Function - Toggle handler
 *  - onFeeChange: Function - Fee change handler
 *  - error: String - Validation error message
 *  - helperText: String - Help text to display
 *  - disabled: Boolean - Whether control is disabled
 *
 * USAGE:
 *  <DeliveryFeeControl
 *    label="Personal Delivery"
 *    enabled={true}
 *    fee={5.00}
 *    onEnabledChange={handleToggle}
 *    onFeeChange={handleFeeChange}
 *  />
 */
function DeliveryFeeControl({
  label,
  enabled,
  fee,
  onEnabledChange,
  onFeeChange,
  error = "",
  helperText = "Fee must be between RM0 and RM100",
  disabled = false,
}) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: enabled ? theme.shadows[2] : "none",
        },
      }}
      role="group"
      aria-labelledby={`${label.replace(/\s+/g, "-").toLowerCase()}-label`}
    >
      {/* Label and Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: enabled ? 2 : 0,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 1 : 0,
        }}
      >
        <Typography
          id={`${label.replace(/\s+/g, "-").toLowerCase()}-label`}
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 500,
            color: enabled
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {label}
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
              disabled={disabled}
              color="primary"
              inputProps={{
                "aria-label": `Enable ${label}`,
                role: "switch",
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{
                color: enabled
                  ? theme.palette.success.main
                  : theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              {enabled ? "Enabled" : "Disabled"}
            </Typography>
          }
          labelPlacement="start"
          sx={{ m: 0 }}
        />
      </Box>

      {/* Fee Input (shown only when enabled) */}
      {enabled && (
        <TextField
          fullWidth
          type="number"
          label="Delivery Fee"
          value={fee}
          onChange={(e) => onFeeChange(parseFloat(e.target.value) || 0)}
          disabled={disabled}
          error={!!error}
          helperText={error || helperText}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: theme.palette.text.secondary }}
                >
                  RM
                </Typography>
              </InputAdornment>
            ),
            inputProps: {
              min: 0,
              max: 100,
              step: 0.5,
              "aria-label": `${label} fee in Ringgit Malaysia`,
              "aria-describedby": error
                ? `${label.replace(/\s+/g, "-").toLowerCase()}-error`
                : `${label.replace(/\s+/g, "-").toLowerCase()}-helper`,
              "aria-invalid": !!error,
              "aria-required": "true",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:focus-within": {
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
              },
            },
          }}
        />
      )}
    </Box>
  );
}

export default DeliveryFeeControl;
