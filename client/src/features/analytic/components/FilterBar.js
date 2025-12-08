import {
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Button,
  useMediaQuery,
  Stack,
  Typography,
} from "@mui/material";
import { Refresh, CalendarMonth } from "@mui/icons-material";
import { PERIODS, PERIOD_LABELS } from "../../../constants/analyticsConstant";
import { useTheme } from "../../../hooks/useTheme";

/**
 * FilterBar Component
 *
 * PURPOSE: Period selector and refresh button for analytics
 * ENHANCED: Mobile-responsive with better touch targets
 *
 * @param {string} period - Current period ('week' | 'month' | 'year')
 * @param {Function} onPeriodChange - Callback when period changes
 * @param {Function} onRefresh - Callback when refresh button clicked
 * @param {boolean} isRefreshing - Refresh loading state
 * @param {string} lastUpdated - Last calculated timestamp
 * @param {Object} sx - Additional styles
 */
const FilterBar = ({
  period = PERIODS.WEEK,
  onPeriodChange,
  onRefresh,
  isRefreshing = false,
  lastUpdated = null,
  sx = {},
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2 },
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        {/* Period Selector */}
        <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(event, newPeriod) => {
              if (newPeriod !== null) {
                onPeriodChange?.(newPeriod);
              }
            }}
            aria-label="analytics period"
            size={isMobile ? "medium" : "small"}
            fullWidth={isMobile}
            sx={{
              "& .MuiToggleButton-root": {
                px: { xs: 2, sm: 2 },
                py: { xs: 1, sm: 0.5 },
                fontSize: { xs: "0.875rem", sm: "0.8125rem" },
                fontWeight: 500,
                textTransform: "none",
                borderRadius: 1,
                "&.Mui-selected": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                },
              },
            }}
          >
            <ToggleButton value={PERIODS.WEEK} aria-label="week">
              {PERIOD_LABELS[PERIODS.WEEK]}
            </ToggleButton>
            <ToggleButton value={PERIODS.MONTH} aria-label="month">
              {PERIOD_LABELS[PERIODS.MONTH]}
            </ToggleButton>
            <ToggleButton value={PERIODS.YEAR} aria-label="year">
              {PERIOD_LABELS[PERIODS.YEAR]}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Right Side: Last Updated + Refresh */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {/* Last Updated Timestamp */}
          {lastUpdated && !isMobile && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </Typography>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={onRefresh}
              disabled={isRefreshing}
              size="small"
              fullWidth={isMobile}
              sx={{
                py: { xs: 1, sm: 0.75 },
                px: { xs: 2, sm: 2 },
                fontWeight: 600,
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default FilterBar;
