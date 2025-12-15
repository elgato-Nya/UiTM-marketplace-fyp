import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Collapse,
  IconButton,
  Grid,
  Divider,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  People,
  Store,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import {
  formatNumber,
  formatPercentage,
} from "../../../constants/analyticsConstant";

/**
 * PlatformOverview Component
 *
 * PURPOSE: Detailed platform statistics with period selection
 * FEATURES:
 * - Period tabs (week/month/year)
 * - User breakdown by role
 * - Campus distribution
 * - Growth indicators
 * - Collapsible sections
 *
 * ACCESSIBILITY:
 * - Proper ARIA attributes for tabs
 * - Expand/collapse buttons with labels
 * - Semantic HTML structure
 * - Keyboard navigation support
 *
 * RESPONSIVE:
 * - Tabs scroll on mobile
 * - Grid adapts to screen size
 * - Compact view on small screens
 */
const PlatformOverview = ({
  overview,
  currentPeriod,
  onPeriodChange,
  isLoading,
}) => {
  const { theme } = useTheme();
  // Single state for all cards - consistent expand/collapse
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading || !overview) {
    return null;
  }

  const periodData = overview[currentPeriod];
  if (!periodData) return null;

  const toggleAllSections = () => {
    setIsExpanded((prev) => !prev);
  };

  const handlePeriodChange = (event, newValue) => {
    onPeriodChange(newValue);
  };

  // Section card component with consistent collapse state
  const SectionCard = ({
    title,
    children,
    icon: Icon,
    ariaLabel,
    collapsedContent,
  }) => (
    <Card
      component="article"
      elevation={0}
      aria-labelledby={`${title.toLowerCase()}-section-heading`}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          pb: isExpanded ? 2 : 1.5,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: isExpanded ? 0 : 1,
          }}
        >
          {Icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                backgroundColor: theme.palette.primary.light + "20",
                display: "flex",
                alignItems: "center",
              }}
              role="img"
              aria-label={`${title} icon`}
            >
              <Icon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
            </Box>
          )}
          <Typography
            id={`${title.toLowerCase()}-section-heading`}
            variant="h6"
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            {title}
          </Typography>
        </Box>

        {/* Collapsed State Indicator */}
        {!isExpanded && collapsedContent && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 1,
              backgroundColor: theme.palette.action.hover,
              textAlign: "center",
            }}
          >
            {collapsedContent}
          </Box>
        )}

        {/* Expanded Content */}
        <Collapse
          in={isExpanded}
          timeout="auto"
          id={`${title.toLowerCase()}-section-content`}
          aria-hidden={!isExpanded}
        >
          <Box sx={{ mt: 2, flex: 1 }}>{children}</Box>
        </Collapse>
      </CardContent>
    </Card>
  );

  // Stat row component
  const StatRow = ({ label, value, growth, color, ariaLabel }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1,
      }}
      role="listitem"
      aria-label={ariaLabel || `${label}: ${value}`}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: color || theme.palette.text.primary,
          }}
        >
          {value}
        </Typography>
        {growth !== undefined && growth !== null && (
          <Chip
            icon={
              growth > 0 ? (
                <TrendingUp sx={{ fontSize: 14 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 14 }} />
              )
            }
            label={`${Math.abs(growth).toFixed(1)}%`}
            size="small"
            color={growth > 0 ? "success" : "error"}
            sx={{ height: 24, fontSize: "0.75rem", fontWeight: 600 }}
          />
        )}
      </Box>
    </Box>
  );

  return (
    <Box component="section" aria-labelledby="platform-overview-heading">
      {/* Period Tabs and Expand/Collapse Control */}
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
          id="platform-overview-heading"
          variant="h6"
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          Detailed Overview
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tabs
            value={currentPeriod}
            onChange={handlePeriodChange}
            aria-label="Platform analytics period selector"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                textTransform: "none",
                fontWeight: 600,
              },
            }}
          >
            <Tab
              label="This Week"
              value="week"
              aria-label="View weekly statistics"
            />
            <Tab
              label="This Month"
              value="month"
              aria-label="View monthly statistics"
            />
            <Tab
              label="This Year"
              value="year"
              aria-label="View yearly statistics"
            />
          </Tabs>

          {/* Global Expand/Collapse Button */}
          <IconButton
            onClick={toggleAllSections}
            size="small"
            aria-label={
              isExpanded ? "Collapse all sections" : "Expand all sections"
            }
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Sections Grid */}
      <Grid container spacing={3}>
        {/* Users Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Users"
            icon={People}
            ariaLabel="User statistics section"
            collapsedContent={
              <Typography variant="body2" color="text.secondary">
                {formatNumber(periodData.users.total)} total users •{" "}
                {formatNumber(periodData.users.activeToday)} active today
              </Typography>
            }
          >
            <Stack spacing={1} role="list" aria-label="User statistics">
              <StatRow
                label="Total Users"
                value={formatNumber(periodData.users.total)}
                growth={periodData.users.growthRate}
                color={theme.palette.primary.main}
              />
              <Divider />
              <StatRow
                label="Consumers"
                value={formatNumber(periodData.users.consumers)}
                color={theme.palette.info.main}
              />
              <StatRow
                label="Merchants"
                value={formatNumber(periodData.users.merchants)}
                color={theme.palette.secondary.main}
              />
              <StatRow
                label="Admins"
                value={formatNumber(periodData.users.admins)}
                color={theme.palette.error.main}
              />
              <Divider />
              <StatRow
                label="Active Today"
                value={formatNumber(periodData.users.activeToday)}
                color={theme.palette.success.main}
              />
            </Stack>
          </SectionCard>
        </Grid>

        {/* Merchants Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Merchants"
            icon={Store}
            ariaLabel="Merchant statistics section"
            collapsedContent={
              <Typography variant="body2" color="text.secondary">
                {formatNumber(periodData.merchants.active)} active •{" "}
                {formatNumber(periodData.merchants.pendingVerification)} pending
              </Typography>
            }
          >
            <Stack spacing={1} role="list" aria-label="Merchant statistics">
              <StatRow
                label="Active Shops"
                value={formatNumber(periodData.merchants.active)}
                color={theme.palette.success.main}
              />
              <StatRow
                label="Pending Verification"
                value={formatNumber(periodData.merchants.pendingVerification)}
                color={theme.palette.warning.main}
                ariaLabel={`${periodData.merchants.pendingVerification} merchants pending verification`}
              />
              <StatRow
                label="Verified"
                value={formatNumber(periodData.merchants.verified)}
                color={theme.palette.info.main}
              />
              <StatRow
                label="Suspended"
                value={formatNumber(periodData.merchants.suspended)}
                color={theme.palette.error.main}
                ariaLabel={`${periodData.merchants.suspended} suspended merchants`}
              />
            </Stack>
          </SectionCard>
        </Grid>

        {/* Listings Section - Scrollable with ALL categories */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Listings"
            icon={ShoppingBag}
            ariaLabel="Listing statistics section"
            collapsedContent={
              <Typography variant="body2" color="text.secondary">
                {formatNumber(periodData.listings.active)} active •{" "}
                {periodData.listings.byCategory?.length || 0} categories
              </Typography>
            }
          >
            <Stack spacing={1} role="list" aria-label="Listing statistics">
              <StatRow
                label="Total Listings"
                value={formatNumber(periodData.listings.total)}
                color={theme.palette.info.main}
              />
              <StatRow
                label="Active Listings"
                value={formatNumber(periodData.listings.active)}
                color={theme.palette.primary.main}
              />
              <Divider />

              {/* Scrollable Category List */}
              <Box
                sx={{
                  maxHeight: 280,
                  overflowY: "auto",
                  pr: 1,
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.main + "40",
                    borderRadius: "3px",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main + "60",
                    },
                  },
                }}
              >
                {periodData.listings.byCategory &&
                periodData.listings.byCategory.length > 0 ? (
                  periodData.listings.byCategory.map((cat, index) => (
                    <StatRow
                      key={index}
                      label={cat.category}
                      value={formatNumber(cat.count)}
                    />
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No listings yet
                  </Typography>
                )}
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlatformOverview;
