import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useTheme } from "../../../hooks/useTheme";
import EmptyState from "../../../components/common/EmptyState";
import { TrendingUp } from "@mui/icons-material";
import {
  formatCurrency,
  CHART_COLORS,
} from "../../../constants/analyticsConstant";

/**
 * RevenueChart Component
 *
 * PURPOSE: Display revenue trends over time
 * USES: Recharts LineChart
 * ENHANCED: Mobile-responsive with adaptive text size
 *
 * @param {Array} data - Array of { date, revenue, previousRevenue }
 * @param {boolean} isLoading - Loading state
 * @param {string} title - Chart title
 * @param {number} height - Chart height in pixels
 */
const RevenueChart = ({
  data = [],
  isLoading = false,
  title = "Revenue Trend",
  height = 350,
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Transform data for chart
  const chartData =
    data?.map((item) => ({
      date: item.date
        ? format(new Date(item.date), isMobile ? "dd MMM" : "dd MMM")
        : "",
      revenue: item.revenue || item.total || 0,
      label: formatCurrency(item.revenue || item.total || 0),
    })) || [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: { xs: 1, sm: 1.5 },
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography
            variant="body2"
            fontWeight="bold"
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            {payload[0].payload.date}
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Revenue: {payload[0].payload.label}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          height,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: height - 80,
          }}
        >
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
          }}
        >
          <EmptyState
            icon={<TrendingUp />}
            title="No Revenue Data"
            description="Revenue data will appear here once you start making sales."
            sx={{ py: 4 }}
          />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        height: "100%",
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontSize: { xs: "1rem", sm: "1.25rem" },
          mb: { xs: 1, sm: 2 },
        }}
      >
        {title}
      </Typography>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: isMobile ? 10 : 20,
            left: isMobile ? -10 : 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="date"
            stroke={theme.palette.text.secondary}
            style={{ fontSize: isMobile ? 10 : 12 }}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={{ fontSize: isMobile ? 10 : 12 }}
            tickFormatter={(value) =>
              isMobile ? `${value / 1000}k` : `RM ${value}`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={CHART_COLORS.primary}
            strokeWidth={isMobile ? 2 : 2}
            dot={{ fill: CHART_COLORS.primary, r: isMobile ? 3 : 4 }}
            activeDot={{ r: isMobile ? 5 : 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default RevenueChart;
