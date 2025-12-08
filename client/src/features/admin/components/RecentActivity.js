import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import {
  PersonAdd,
  Store,
  ShoppingCart,
  CheckCircle,
  Schedule,
  ArrowForward,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { formatDistanceToNow } from "../../../utils/dateUtils";

/**
 * RecentActivity Component
 *
 * PURPOSE: Display recent platform activities in timeline format
 * FEATURES:
 * - Latest registrations (last 5)
 * - Recent merchant verifications
 * - Recent orders
 * - Activity timeline with icons
 *
 * ACCESSIBILITY:
 * - Semantic HTML structure
 * - ARIA labels for all actions
 * - Time elements with datetime attribute
 * - List structure for activities
 *
 * RESPONSIVE:
 * - Stack layout for mobile
 * - Scrollable on small screens
 * - Compact item spacing
 */
const RecentActivity = ({ activities, isLoading }) => {
  const { theme } = useTheme();

  if (isLoading || !activities) {
    return null;
  }

  // Activity icon mapping
  const getActivityIcon = (type) => {
    switch (type) {
      case "registration":
        return PersonAdd;
      case "verification":
        return CheckCircle;
      case "order":
        return ShoppingCart;
      case "merchant_application":
        return Store;
      default:
        return Schedule;
    }
  };

  // Activity color mapping
  const getActivityColor = (type) => {
    switch (type) {
      case "registration":
        return theme.palette.info.main;
      case "verification":
        return theme.palette.success.main;
      case "order":
        return theme.palette.primary.main;
      case "merchant_application":
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Format user role for display
  const formatUserRole = (role) => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
  };

  // Activity item component
  const ActivityItem = ({ activity, isLast }) => {
    const Icon = getActivityIcon(activity.type);
    const color = getActivityColor(activity.type);

    return (
      <Box
        component="article"
        role="listitem"
        aria-label={`${activity.description} - ${formatDistanceToNow(activity.timestamp)}`}
        sx={{ position: "relative" }}
      >
        <Box sx={{ display: "flex", gap: 2, pb: isLast ? 0 : 3 }}>
          {/* Timeline Icon */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: color + "20",
                color: color,
              }}
              role="img"
              aria-label={`${activity.type} activity icon`}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Avatar>

            {/* Timeline line */}
            {!isLast && (
              <Box
                sx={{
                  width: 2,
                  flex: 1,
                  bgcolor: theme.palette.divider,
                  mt: 1,
                }}
                role="presentation"
              />
            )}
          </Box>

          {/* Activity Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              {activity.description}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ mb: 1 }}
            >
              {activity.user && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {activity.user}
                </Typography>
              )}

              {activity.role && (
                <Chip
                  label={formatUserRole(activity.role)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                />
              )}

              {activity.status && (
                <Chip
                  label={activity.status}
                  size="small"
                  color={
                    activity.status === "approved"
                      ? "success"
                      : activity.status === "pending"
                        ? "warning"
                        : "default"
                  }
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>

            <time
              dateTime={activity.timestamp}
              style={{
                fontSize: "0.75rem",
                color: theme.palette.text.secondary,
              }}
            >
              {formatDistanceToNow(activity.timestamp)}
            </time>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Card
      component="section"
      elevation={0}
      aria-labelledby="recent-activity-heading"
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            id="recent-activity-heading"
            variant="h6"
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            Recent Activity
          </Typography>

          <Button
            endIcon={<ArrowForward />}
            size="small"
            aria-label="View all activities"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            View All
          </Button>
        </Box>

        {/* Activities Timeline */}
        {activities && activities.length > 0 ? (
          <Box
            component="ol"
            role="list"
            aria-label="Recent platform activities"
            sx={{
              maxHeight: 500,
              overflowY: "auto",
              listStyle: "none",
              p: 0,
              m: 0,
              pr: 1,
              // Custom scrollbar styling
              "&::-webkit-scrollbar": {
                width: 6,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: theme.palette.background.default,
                borderRadius: 3,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.divider,
                borderRadius: 3,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              },
            }}
          >
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id || index}
                activity={activity}
                isLast={index === activities.length - 1}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: theme.palette.text.secondary,
            }}
            role="status"
            aria-label="No recent activity"
          >
            <Schedule sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2">
              No recent activity to display
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
