import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Switch,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Stack,
  FormControlLabel,
  Chip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import BackButton from "../../components/common/Navigation/BackButton";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../services/notificationService";

/**
 * NotificationPreferencesPage
 *
 * Allows users to manage their notification preferences per category.
 * Each category supports toggling in-app and email notifications.
 * Includes a global enable/disable switch.
 */

const CATEGORY_CONFIG = [
  {
    key: "order",
    label: "Order Updates",
    description:
      "Order placed, shipped, delivered, cancelled, and refund notifications",
    icon: "📦",
    hasEmail: true,
  },
  {
    key: "shopping",
    label: "Shopping Alerts",
    description:
      "Price drops, back in stock, cart reminders, and wishlist alerts",
    icon: "🛒",
    hasEmail: false,
  },
  {
    key: "merchant",
    label: "Merchant Notifications",
    description:
      "New orders received, low stock alerts, listing status, reviews, and payouts",
    icon: "🏪",
    hasEmail: true,
  },
  {
    key: "quote",
    label: "Quote Updates",
    description:
      "Quote requests, responses, acceptances, rejections, and expiry alerts",
    icon: "💬",
    hasEmail: true,
  },
  {
    key: "system",
    label: "System & Security",
    description:
      "Welcome messages, email verification, password changes, and security alerts",
    icon: "🔒",
    hasEmail: true,
  },
];

const NotificationPreferencesPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Preference state
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [categoryPrefs, setCategoryPrefs] = useState({});

  // Load preferences on mount
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotificationPreferences();
      const prefs = response?.data?.preferences || response?.preferences || {};

      setGlobalEnabled(prefs.enabled !== false);

      // Map category preferences
      const mapped = {};
      CATEGORY_CONFIG.forEach(({ key }) => {
        mapped[key] = {
          inApp: prefs[key]?.inApp !== false,
          email: prefs[key]?.email !== false,
        };
      });
      setCategoryPrefs(mapped);
    } catch (err) {
      setError("Failed to load notification preferences. Please try again.");
      console.error("Error loading preferences:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Track changes
  const handleGlobalToggle = (event) => {
    setGlobalEnabled(event.target.checked);
    setHasChanges(true);
  };

  const handleCategoryToggle = (category, channel) => {
    setCategoryPrefs((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category]?.[channel],
      },
    }));
    setHasChanges(true);
  };

  // Save preferences
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        enabled: globalEnabled,
      };

      // Flatten category preferences into the payload
      CATEGORY_CONFIG.forEach(({ key }) => {
        payload[key] = {
          inApp: categoryPrefs[key]?.inApp ?? true,
          email: categoryPrefs[key]?.email ?? true,
        };
      });

      await updateNotificationPreferences(payload);
      setHasChanges(false);
      showSnackbar("Notification preferences saved!", "success");
    } catch (err) {
      setError("Failed to save preferences. Please try again.");
      showSnackbar("Failed to save preferences", "error");
      console.error("Error saving preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="40vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <BackButton />
        <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
          Notification Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Control how and when you receive notifications from MarKet
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Global Toggle */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <NotificationsIcon color={globalEnabled ? "primary" : "disabled"} />
            <Box>
              <Typography variant="h6">All Notifications</Typography>
              <Typography variant="body2" color="text.secondary">
                {globalEnabled
                  ? "Notifications are enabled"
                  : "All notifications are paused"}
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={globalEnabled}
            onChange={handleGlobalToggle}
            color="primary"
            inputProps={{ "aria-label": "Toggle all notifications" }}
          />
        </Box>
      </Paper>

      {/* Category Preferences */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          opacity: globalEnabled ? 1 : 0.5,
          pointerEvents: globalEnabled ? "auto" : "none",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Category Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Customize notifications for each category. Email notifications are
          only available for critical updates.
        </Typography>

        {CATEGORY_CONFIG.map(
          ({ key, label, description, icon, hasEmail }, index) => (
            <React.Fragment key={key}>
              {index > 0 && <Divider sx={{ my: 2 }} />}
              <Box>
                <Box
                  display="flex"
                  alignItems="flex-start"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                    <Typography fontSize="1.5rem">{icon}</Typography>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 400 }}
                      >
                        {description}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={categoryPrefs[key]?.inApp ?? true}
                          onChange={() => handleCategoryToggle(key, "inApp")}
                          size="small"
                          color="primary"
                        />
                      }
                      label={
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <NotificationsIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">In-App</Typography>
                        </Stack>
                      }
                      labelPlacement="start"
                      sx={{ ml: 0 }}
                    />
                    {hasEmail && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={categoryPrefs[key]?.email ?? true}
                            onChange={() => handleCategoryToggle(key, "email")}
                            size="small"
                            color="secondary"
                          />
                        }
                        label={
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <EmailIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">Email</Typography>
                          </Stack>
                        }
                        labelPlacement="start"
                        sx={{ ml: 0 }}
                      />
                    )}
                    {!hasEmail && (
                      <Chip
                        label="In-App Only"
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 24 }}
                      />
                    )}
                  </Stack>
                </Box>
              </Box>
            </React.Fragment>
          )
        )}
      </Paper>

      {/* Email Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Email Policy:</strong> We only send emails for critical
          updates — new orders (sellers), order deliveries (buyers), quote
          requests/responses, and security alerts. We respect your inbox.
        </Typography>
      </Alert>

      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </Box>
    </Container>
  );
};

export default NotificationPreferencesPage;
