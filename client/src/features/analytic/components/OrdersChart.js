import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../../hooks/useTheme";
import EmptyState from "../../../components/common/EmptyState";
import { ShoppingCart } from "@mui/icons-material";
import {
  STATUS_COLORS,
  formatNumber,
} from "../../../constants/analyticsConstant";

/**
 * OrdersChart Component
 *
 * PURPOSE: Display order status distribution
 * USES: Recharts BarChart
 * ENHANCED: Mobile-responsive with adaptive layout
 *
 * @param {Object} data - Order status distribution { pending, confirmed, completed, cancelled }
 * @param {boolean} isLoading - Loading state
 * @param {string} title - Chart title
 * @param {number} height - Chart height in pixels
 */
const OrdersChart = ({
  data = null,
  isLoading = false,
  title = "Orders by Status",
  height = 350,
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Transform data for chart
  const chartData = data
    ? [
        {
          status: isMobile ? "Pending" : "Pending",
          count: data.pending || 0,
          fill: STATUS_COLORS.pending,
        },
        {
          status: isMobile ? "Confirm" : "Confirmed",
          count: data.confirmed || 0,
          fill: STATUS_COLORS.confirmed,
        },
        {
          status: isMobile ? "Done" : "Completed",
          count: data.completed || 0,
          fill: STATUS_COLORS.completed,
        },
        {
          status: isMobile ? "Cancel" : "Cancelled",
          count: data.cancelled || 0,
          fill: STATUS_COLORS.cancelled,
        },
      ]
    : [];

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
            {payload[0].payload.status}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Orders: {formatNumber(payload[0].value)}
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

  const totalOrders = chartData.reduce((sum, item) => sum + item.count, 0);

  if (totalOrders === 0) {
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
        <EmptyState
          icon={<ShoppingCart />}
          title="No Orders Yet"
          description="Order statistics will appear here once customers start placing orders."
        />
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
        <BarChart
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
            dataKey="status"
            stroke={theme.palette.text.secondary}
            style={{ fontSize: isMobile ? 10 : 12 }}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={{ fontSize: isMobile ? 10 : 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Bar
            dataKey="count"
            name="Orders"
            fill={theme.palette.primary.main}
            radius={[8, 8, 0, 0]}
            maxBarSize={isMobile ? 40 : 60}
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default OrdersChart;
