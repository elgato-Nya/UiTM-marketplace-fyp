import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  Skeleton,
} from "@mui/material";
import { AccountBalance, Schedule, TrendingUp } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { PAYOUT_SCHEDULE_CONFIG } from "../../../constants/payoutConstant";

/**
 * BalanceCard Component
 *
 * PURPOSE: Display seller balance overview
 */
function BalanceCard({
  balance,
  payoutSettings,
  canRequestPayout,
  nextScheduledPayout,
  isLoading = false,
}) {
  const { theme } = useTheme();

  const formatCurrency = (amount) => {
    return `RM ${(amount || 0).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
        <CardContent>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="text" width={200} height={48} sx={{ my: 2 }} />
          <Skeleton variant="rectangular" height={100} />
        </CardContent>
      </Card>
    );
  }

  const scheduleConfig = PAYOUT_SCHEDULE_CONFIG[payoutSettings?.schedule];

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <CardContent>
        {/* Available Balance */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <AccountBalance fontSize="small" />
            Available Balance
          </Typography>
          <Typography
            variant="h3"
            color="primary.main"
            sx={{ fontWeight: 700 }}
          >
            {formatCurrency(balance?.available)}
          </Typography>
          {canRequestPayout && (
            <Chip
              label="Ready for payout"
              color="success"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Balance Breakdown */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Pending
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {formatCurrency(balance?.pending)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Balance
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {formatCurrency(balance?.total)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Stats */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <TrendingUp fontSize="small" />
              Total Earned
            </Typography>
            <Typography variant="body1" fontWeight={600} color="success.main">
              {formatCurrency(balance?.totalEarned)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Paid Out
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {formatCurrency(balance?.totalPaidOut)}
            </Typography>
          </Box>
        </Box>

        {/* Payout Schedule */}
        {scheduleConfig && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
              }}
            >
              <Schedule fontSize="small" />
              <Typography variant="body2">
                {scheduleConfig.icon} {scheduleConfig.label} Payouts
              </Typography>
            </Box>
            {nextScheduledPayout && (
              <Typography variant="caption" color="text.secondary">
                Next: {new Date(nextScheduledPayout).toLocaleDateString()}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default BalanceCard;
