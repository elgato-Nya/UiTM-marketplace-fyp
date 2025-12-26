import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Stack,
  CircularProgress,
  useMediaQuery,
  Alert,
  Divider,
  Chip,
  InputAdornment,
} from "@mui/material";
import { Save, Settings, Info, LocationOn } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { useSnackbar } from "../../../hooks/useSnackbar";
import {
  getDeliverySettings,
  updateDeliverySettings,
} from "../../../services/merchantService";
import DeliveryFeeControl from "./DeliveryFeeControl";
import CampusSelectorDialog from "./CampusSelectorDialog";
import { CAMPUS_OPTIONS } from "../../../constants/authConstant";

/**
 * DeliverySettingsSection Component
 *
 * PURPOSE: Merchant-facing delivery fee configuration panel
 * LOCATION: Integrated into MyStorePage
 * FEATURES:
 *  - Configure delivery fees for personal/campus/pickup
 *  - Enable/disable each delivery type
 *  - Set free delivery threshold
 *  - Select deliverable campuses
 *  - Real-time validation
 *  - Exposes state to parent for unified save
 *
 * PROPS:
 *  - onSettingsChange: Function - Callback when settings change (for parent save button)
 *  - onValidationChange: Function - Callback when validation state changes
 *  - triggerSave: Boolean - External trigger to save (from parent)
 *  - onSaveComplete: Function - Callback after save completes
 *
 * USAGE:
 *  <DeliverySettingsSection
 *    onSettingsChange={(settings, hasChanges) => {...}}
 *    onValidationChange={(isValid) => {...}}
 *  />
 */
function DeliverySettingsSection({
  onSettingsChange,
  onValidationChange,
  triggerSave,
  onSaveComplete,
}) {
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [settings, setSettings] = useState({
    personalDeliveryFee: 5.0,
    campusDeliveryFee: 2.5,
    pickupFee: 1.0,
    freeDeliveryThreshold: 0,
    deliverableCampuses: [],
    enabledMethods: {
      personal: true,
      campus: true,
      pickup: true,
    },
  });

  const [errors, setErrors] = useState({
    personalDeliveryFee: "",
    campusDeliveryFee: "",
    pickupFee: "",
    freeDeliveryThreshold: "",
  });

  // Load settings on mount ONLY
  useEffect(() => {
    loadSettings();
  }, []); // Empty dependency array - load only once

  // Notify parent of settings changes (with proper dependency management)
  useEffect(() => {
    if (onSettingsChange && !isLoading) {
      onSettingsChange(settings, hasChanges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, hasChanges]); // Don't include onSettingsChange to avoid loops

  // Notify parent of validation state (with proper dependency management)
  useEffect(() => {
    if (onValidationChange && !isLoading) {
      const isValid = Object.keys(errors).every((key) => !errors[key]);
      onValidationChange(isValid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]); // Don't include onValidationChange to avoid loops

  // Handle external save trigger
  useEffect(() => {
    if (triggerSave) {
      handleSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSave]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      console.log("📥 Fetching delivery settings...");
      const response = await getDeliverySettings();
      console.log("📦 Raw API response:", response);

      // Response structure: { success: true, data: {...}, message: "..." }
      const data = response.data || response; // Handle both structures
      console.log("📊 Extracted data:", data);

      // Map backend response to frontend state
      const mappedSettings = {
        personalDeliveryFee: data.personal?.fee || 5.0,
        campusDeliveryFee: data.campus?.fee || 2.5,
        pickupFee: data.pickup?.fee || 1.0,
        freeDeliveryThreshold: data.freeDeliveryThreshold || 0,
        deliverableCampuses: data.deliverableCampuses || [],
        enabledMethods: {
          personal: data.personal?.enabled !== false,
          campus: data.campus?.enabled !== false,
          pickup: data.pickup?.enabled !== false,
        },
      };

      console.log("✅ Mapped settings:", mappedSettings);
      console.log(
        "   - Personal fee:",
        data.personal?.fee,
        "→",
        mappedSettings.personalDeliveryFee
      );
      console.log(
        "   - Campus fee:",
        data.campus?.fee,
        "→",
        mappedSettings.campusDeliveryFee
      );
      console.log(
        "   - Pickup fee:",
        data.pickup?.fee,
        "→",
        mappedSettings.pickupFee
      );

      setSettings(mappedSettings);
    } catch (error) {
      console.error("❌ Error loading delivery settings:", error);
      console.error("Error details:", error.response?.data);
      showSnackbar(
        error.response?.data?.message ||
          "Failed to load delivery settings. Using defaults.",
        "warning"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Validation
  const validateSettings = () => {
    const newErrors = {};
    let isValid = true;

    // Validate fees (0-100)
    if (
      settings.personalDeliveryFee < 0 ||
      settings.personalDeliveryFee > 100
    ) {
      newErrors.personalDeliveryFee = "Fee must be between RM0 and RM100";
      isValid = false;
    }

    if (settings.campusDeliveryFee < 0 || settings.campusDeliveryFee > 100) {
      newErrors.campusDeliveryFee = "Fee must be between RM0 and RM100";
      isValid = false;
    }

    if (settings.pickupFee < 0 || settings.pickupFee > 100) {
      newErrors.pickupFee = "Fee must be between RM0 and RM100";
      isValid = false;
    }

    // Validate threshold (>= 0)
    if (settings.freeDeliveryThreshold < 0) {
      newErrors.freeDeliveryThreshold = "Threshold must be 0 or greater";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle save
  const handleSave = async () => {
    console.log("💾 Save button clicked!");
    console.log("Current settings:", settings);

    if (!validateSettings()) {
      console.warn("⚠️ Validation failed");
      showSnackbar("Please fix validation errors before saving", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        personalDeliveryFee: settings.enabledMethods.personal
          ? settings.personalDeliveryFee
          : 0,
        campusDeliveryFee: settings.enabledMethods.campus
          ? settings.campusDeliveryFee
          : 0,
        pickupFee: settings.enabledMethods.pickup ? settings.pickupFee : 0,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        deliverableCampuses: settings.deliverableCampuses,
      };

      console.log("📤 Sending payload:", payload);
      const response = await updateDeliverySettings(payload);
      console.log("✅ Update response:", response);

      showSnackbar("Delivery settings updated successfully", "success");
      setHasChanges(false);

      console.log("🔄 Reloading settings...");
      await loadSettings(); // Reload to get server response

      // Notify parent that save is complete
      if (onSaveComplete) {
        onSaveComplete(true);
      }
    } catch (error) {
      console.error("❌ Error updating delivery settings:", error);
      console.error("Error response:", error.response?.data);
      showSnackbar(
        error.response?.data?.message ||
          "Failed to update delivery settings. Please try again.",
        "error"
      );

      // Notify parent that save failed
      if (onSaveComplete) {
        onSaveComplete(false, error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle field changes
  const handleFeeChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleEnabledChange = (field, enabled) => {
    setSettings((prev) => ({
      ...prev,
      enabledMethods: { ...prev.enabledMethods, [field]: enabled },
    }));
    setHasChanges(true);
  };

  const handleThresholdChange = (value) => {
    setSettings((prev) => ({ ...prev, freeDeliveryThreshold: value }));
    setHasChanges(true);
    setErrors((prev) => ({ ...prev, freeDeliveryThreshold: "" }));
  };

  const handleCampusesSave = (campuses) => {
    setSettings((prev) => ({ ...prev, deliverableCampuses: campuses }));
    setHasChanges(true);
  };

  // Get campus label
  const getCampusLabel = (value) => {
    const campus = CAMPUS_OPTIONS.find((c) => c.value === value);
    return campus ? campus.label.replace("UiTM ", "") : value;
  };

  if (isLoading) {
    return (
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Settings
              sx={{ fontSize: 28, color: theme.palette.primary.main }}
            />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Delivery Fee Settings
            </Typography>
          </Box>

          {/* Info Alert */}
          <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
            Configure your delivery fees and options. Buyers will see these fees
            when viewing your listings.
          </Alert>

          <Stack spacing={3}>
            {/* Delivery Fee Controls */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: 500 }}
                component="h3"
              >
                Delivery Options
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DeliveryFeeControl
                    label="Personal Delivery"
                    enabled={settings.enabledMethods.personal}
                    fee={settings.personalDeliveryFee}
                    onEnabledChange={(enabled) =>
                      handleEnabledChange("personal", enabled)
                    }
                    onFeeChange={(value) =>
                      handleFeeChange("personalDeliveryFee", value)
                    }
                    error={errors.personalDeliveryFee}
                    helperText="Standard delivery to personal addresses"
                    disabled={isSaving}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <DeliveryFeeControl
                    label="Campus Delivery"
                    enabled={settings.enabledMethods.campus}
                    fee={settings.campusDeliveryFee}
                    onEnabledChange={(enabled) =>
                      handleEnabledChange("campus", enabled)
                    }
                    onFeeChange={(value) =>
                      handleFeeChange("campusDeliveryFee", value)
                    }
                    error={errors.campusDeliveryFee}
                    helperText="Delivery to UiTM campus locations"
                    disabled={isSaving}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <DeliveryFeeControl
                    label="Self Pickup"
                    enabled={settings.enabledMethods.pickup}
                    fee={settings.pickupFee}
                    onEnabledChange={(enabled) =>
                      handleEnabledChange("pickup", enabled)
                    }
                    onFeeChange={(value) => handleFeeChange("pickupFee", value)}
                    error={errors.pickupFee}
                    helperText="Buyer picks up from your location"
                    disabled={isSaving}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Campus Selection */}
            {settings.enabledMethods.campus && (
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1, fontWeight: 500 }}
                  component="h3"
                >
                  Deliverable Campuses
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 2, color: theme.palette.text.secondary }}
                >
                  Select which UiTM campuses you can deliver to
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<LocationOn />}
                  onClick={() => setDialogOpen(true)}
                  disabled={isSaving}
                  fullWidth={isMobile}
                  sx={{ mb: 2 }}
                >
                  Select Campuses (
                  {settings.deliverableCampuses.length || "All"})
                </Button>

                {settings.deliverableCampuses.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      p: 2,
                      backgroundColor: theme.palette.background.default,
                      borderRadius: 1,
                    }}
                  >
                    {settings.deliverableCampuses.map((campusValue) => (
                      <Chip
                        key={campusValue}
                        label={getCampusLabel(campusValue)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            <Divider />

            {/* Free Delivery Threshold */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 500 }}
                component="h3"
              >
                Free Delivery Threshold
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                Offer free delivery for orders above this amount. Set to 0 to
                disable.
              </Typography>

              <TextField
                fullWidth={!isMobile}
                type="number"
                label="Minimum Order Amount"
                value={settings.freeDeliveryThreshold}
                onChange={(e) =>
                  handleThresholdChange(parseFloat(e.target.value) || 0)
                }
                disabled={isSaving}
                error={!!errors.freeDeliveryThreshold}
                helperText={
                  errors.freeDeliveryThreshold ||
                  "Delivery will be free for orders equal or above this amount"
                }
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                sx={{ maxWidth: isMobile ? "100%" : "400px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        RM
                      </Typography>
                    </InputAdornment>
                  ),
                  inputProps: {
                    min: 0,
                    step: 1,
                    "aria-label": "Free delivery threshold in Ringgit Malaysia",
                  },
                }}
              />
            </Box>
          </Stack>

          {/* Save Button Removed - Controlled by parent MyStorePage */}
        </CardContent>
      </Card>

      {/* Campus Selector Dialog */}
      <CampusSelectorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        selectedCampuses={settings.deliverableCampuses}
        onSave={handleCampusesSave}
      />
    </>
  );
}

export default DeliverySettingsSection;
