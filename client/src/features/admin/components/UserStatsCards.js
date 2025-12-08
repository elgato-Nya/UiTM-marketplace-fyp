import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import {
  People,
  PersonAdd,
  PersonOff,
  VerifiedUser,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { formatNumber } from "../../../constants/analyticsConstant";

/**
 * UserStatsCards Component
 *
 * PURPOSE: Display user management statistics in card format
 * FEATURES:
 * - Total users, active, suspended, unverified counts
 * - Verification rate and suspension rate indicators
 * - Growth trends (weekly/monthly new users)
 * - Responsive grid layout
 * - Color-coded cards with icons
 * - Hover effects
 *
 * ACCESSIBILITY:
 * - Proper ARIA labels for screen readers
 * - Semantic HTML structure
 * - Role attributes for status indicators
 *
 * RESPONSIVE:
 * - Mobile: 1-2 columns
 * - Tablet: 2-3 columns
 * - Desktop: 4 columns
 */
const UserStatsCards = ({ stats, isLoading }) => {
  const { theme } = useTheme();

  // Handle loading or missing stats
  if (isLoading || !stats) {
    return null; // Parent component should handle skeleton state
  }

  const {
    total = 0,
    active = 0,
    suspended = 0,
    unverified = 0,
    newUsersThisWeek = 0,
    newUsersThisMonth = 0,
  } = stats;

  // Calculate rates
  const verificationRate =
    total > 0 ? (((total - unverified) / total) * 100).toFixed(1) : 0;
  const suspensionRate = total > 0 ? ((suspended / total) * 100).toFixed(1) : 0;
  const activeRate = total > 0 ? ((active / total) * 100).toFixed(1) : 0;

  // Determine if rates are concerning
  const hasUnverifiedAlert = unverified > 10;
  const hasSuspensionConcern = suspensionRate > 5;

  const statCards = [
    {
      title: "Total Users",
      value: formatNumber(total),
      icon: People,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + "20",
      subtitle: `${formatNumber(newUsersThisWeek)} new this week`,
      growth:
        newUsersThisWeek > 0
          ? ((newUsersThisWeek / (total - newUsersThisWeek)) * 100).toFixed(1)
          : null,
      ariaLabel: `Total users: ${total}. ${newUsersThisWeek} new this week`,
    },
    {
      title: "Active Users",
      value: formatNumber(active),
      icon: PersonAdd,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + "20",
      subtitle: `${activeRate}% of total`,
      badge:
        activeRate >= 70
          ? {
              icon: CheckCircle,
              label: "Healthy",
              color: "success",
            }
          : null,
      ariaLabel: `Active users: ${active}. ${activeRate}% of total users`,
    },
    {
      title: "Suspended Users",
      value: formatNumber(suspended),
      icon: PersonOff,
      color: theme.palette.error.main,
      bgColor: theme.palette.error.light + "20",
      subtitle: `${suspensionRate}% suspension rate`,
      badge: hasSuspensionConcern
        ? {
            icon: Warning,
            label: "High",
            color: "warning",
          }
        : null,
      ariaLabel: `Suspended users: ${suspended}. Suspension rate: ${suspensionRate}%`,
    },
    {
      title: "Unverified Emails",
      value: formatNumber(unverified),
      icon: VerifiedUser,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light + "20",
      subtitle: `${verificationRate}% verified`,
      badge: hasUnverifiedAlert
        ? {
            icon: Warning,
            label: unverified,
            color: "warning",
          }
        : null,
      ariaLabel: `Unverified users: ${unverified}. Verification rate: ${verificationRate}%`,
    },
  ];

  return (
    <section aria-labelledby="user-stats-heading">
      <Typography
        id="user-stats-heading"
        variant="h6"
        sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}
      >
        User Statistics Overview
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          const hasGrowth = stat.growth !== undefined && stat.growth !== null;
          const isPositiveGrowth = hasGrowth && stat.growth > 0;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                component="article"
                elevation={0}
                aria-label={stat.ariaLabel}
                sx={{
                  height: "100%",
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                    borderColor: stat.color,
                  },
                }}
              >
                <CardContent>
                  {/* Icon and Badge Row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: stat.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      role="img"
                      aria-label={`${stat.title} icon`}
                    >
                      <IconComponent sx={{ color: stat.color, fontSize: 28 }} />
                    </Box>

                    {/* Alert Badge */}
                    {stat.badge && (
                      <Chip
                        icon={<stat.badge.icon sx={{ fontSize: 16 }} />}
                        label={stat.badge.label}
                        size="small"
                        color={stat.badge.color}
                        aria-label={`Status: ${stat.badge.label}`}
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}
                  >
                    {stat.title}
                  </Typography>

                  {/* Value */}
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>

                  {/* Growth Indicator or Subtitle */}
                  {hasGrowth && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                      role="status"
                      aria-label={`Growth: ${isPositiveGrowth ? "up" : "down"} ${Math.abs(stat.growth)} percent`}
                    >
                      {isPositiveGrowth ? (
                        <TrendingUp
                          sx={{
                            fontSize: 16,
                            color: theme.palette.success.main,
                          }}
                        />
                      ) : (
                        <TrendingDown
                          sx={{ fontSize: 16, color: theme.palette.error.main }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: isPositiveGrowth
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                          fontWeight: 600,
                        }}
                      >
                        {Math.abs(stat.growth)}%
                      </Typography>
                    </Box>
                  )}

                  {stat.subtitle && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem", mt: hasGrowth ? 0.5 : 0 }}
                    >
                      {stat.subtitle}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </section>
  );
};

export default UserStatsCards;
