import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Divider,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  Error,
  People,
  Store,
  AccessTime,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { formatDistanceToNow } from "date-fns";

/**
 * SystemHealth Component
 *
 * PURPOSE: Display platform health status and metrics
 * FEATURES:
 * - Overall health status badge
 * - Active users percentage with progress bar
 * - Pending verifications count
 * - Suspended merchants count
 * - Last updated timestamp
 * - Color-coded health indicators
 *
 * ACCESSIBILITY:
 * - ARIA labels for health status
 * - Progress bar with aria-valuenow
 * - Semantic HTML structure
 * - Status announcements for screen readers
 *
 * RESPONSIVE:
 * - Stacks vertically on mobile
 * - Horizontal layout on desktop
 */
const SystemHealth = ({ health, isLoading }) => {
  const { theme } = useTheme();

  // Show empty state instead of hiding when no data
  const safeHealth = health || {
    systemHealth: "unknown",
    activeUsers: 0,
    activeUsersPercentage: 0,
    pendingVerifications: 0,
    suspendedMerchants: 0,
  };

  // Determine health status
  const getHealthStatus = () => {
    if (safeHealth.systemHealth === "healthy") {
      return {
        label: "Healthy",
        icon: CheckCircle,
        color: theme.palette.success.main,
        bgColor: theme.palette.success.light + "20",
        severity: "success",
      };
    } else if (safeHealth.systemHealth === "warning") {
      return {
        label: "Warning",
        icon: Warning,
        color: theme.palette.warning.main,
        bgColor: theme.palette.warning.light + "20",
        severity: "warning",
      };
    } else if (safeHealth.systemHealth === "critical") {
      return {
        label: "Critical",
        icon: Error,
        color: theme.palette.error.main,
        bgColor: theme.palette.error.light + "20",
        severity: "error",
      };
    } else {
      // Unknown or no data
      return {
        label: "Unknown",
        icon: Warning,
        color: theme.palette.grey[500],
        bgColor: theme.palette.grey[100],
        severity: "info",
      };
    }
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;
  const activePercentage = parseFloat(safeHealth.activeUsersPercentage || 0);

  return (
    <Card
      component="section"
      elevation={0}
      aria-labelledby="system-health-heading"
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardContent>
        {/* Header with Status Badge */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            id="system-health-heading"
            variant="h6"
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            System Health
          </Typography>

          <Chip
            icon={<HealthIcon sx={{ fontSize: 18 }} />}
            label={healthStatus.label}
            color={healthStatus.severity}
            aria-label={`System status: ${healthStatus.label}`}
            role="status"
            sx={{
              fontWeight: 600,
              px: 1,
            }}
          />
        </Box>

        {/* Health Metrics */}
        <Stack spacing={3}>
          {/* Active Users Metric */}
          <Box component="article" aria-labelledby="active-users-metric">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <People
                  sx={{ fontSize: 20, color: theme.palette.text.secondary }}
                  aria-hidden="true"
                />
                <Typography
                  id="active-users-metric"
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Active Users Today
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                {safeHealth.activeUsers} ({activePercentage.toFixed(1)}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={activePercentage}
              aria-valuenow={activePercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Active users: ${activePercentage} percent`}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  backgroundColor:
                    activePercentage > 50
                      ? theme.palette.success.main
                      : activePercentage > 25
                        ? theme.palette.warning.main
                        : theme.palette.error.main,
                },
              }}
            />
          </Box>

          <Divider />

          {/* Alert Metrics */}
          <Box component="article" aria-labelledby="alerts-heading">
            <Typography
              id="alerts-heading"
              variant="body2"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Alerts & Issues
            </Typography>

            <Stack spacing={1.5}>
              {/* Pending Verifications */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor:
                    safeHealth.pendingVerifications > 10
                      ? theme.palette.error.main + "10"
                      : safeHealth.pendingVerifications > 5
                        ? theme.palette.warning.main + "10"
                        : theme.palette.action.hover,
                  border: `1px solid ${
                    safeHealth.pendingVerifications > 10
                      ? theme.palette.error.main + "30"
                      : safeHealth.pendingVerifications > 5
                        ? theme.palette.warning.main + "30"
                        : theme.palette.divider
                  }`,
                }}
                role="status"
                aria-label={`${safeHealth.pendingVerifications} pending merchant verifications`}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  }}
                >
                  Pending Verifications
                </Typography>
                <Chip
                  label={safeHealth.pendingVerifications}
                  size="small"
                  color={
                    safeHealth.pendingVerifications > 10
                      ? "error"
                      : safeHealth.pendingVerifications > 5
                        ? "warning"
                        : "default"
                  }
                  sx={{ fontWeight: 600, minWidth: 40 }}
                />
              </Box>

              {/* Suspended Merchants */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor:
                    safeHealth.suspendedMerchants > 10
                      ? theme.palette.error.main + "10"
                      : theme.palette.action.hover,
                  border: `1px solid ${
                    safeHealth.suspendedMerchants > 10
                      ? theme.palette.error.main + "30"
                      : theme.palette.divider
                  }`,
                }}
                role="status"
                aria-label={`${safeHealth.suspendedMerchants} suspended merchants`}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Store
                    sx={{ fontSize: 18, color: theme.palette.text.secondary }}
                    aria-hidden="true"
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Suspended Merchants
                  </Typography>
                </Box>
                <Chip
                  label={safeHealth.suspendedMerchants}
                  size="small"
                  color={
                    safeHealth.suspendedMerchants > 10 ? "error" : "default"
                  }
                  sx={{ fontWeight: 600, minWidth: 40 }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Last Updated */}
          {safeHealth.lastUpdated && (
            <>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "center",
                }}
                role="status"
                aria-live="polite"
              >
                <AccessTime
                  sx={{
                    fontSize: 16,
                    color: theme.palette.text.disabled,
                  }}
                  aria-hidden="true"
                />
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontStyle: "italic" }}
                >
                  Updated {formatDistanceToNow(new Date(health.lastUpdated))}{" "}
                  ago
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SystemHealth;
