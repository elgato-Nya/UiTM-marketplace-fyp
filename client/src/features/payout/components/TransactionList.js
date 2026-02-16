import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { format } from "date-fns";
import { PAYOUT_TRANSACTION_CONFIG } from "../../../constants/payoutConstant";

/**
 * TransactionList Component
 *
 * PURPOSE: Display list of balance transactions
 */
function TransactionList({
  transactions = [],
  emptyMessage = "No transactions yet",
}) {
  const formatCurrency = (amount) => {
    const isNegative = amount < 0;
    return `${isNegative ? "-" : "+"}RM ${Math.abs(amount).toFixed(2)}`;
  };

  if (!transactions.length) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {transactions.map((transaction) => {
        const config = PAYOUT_TRANSACTION_CONFIG[transaction.type] || {
          label: transaction.type,
          icon: "💰",
          color: "default",
        };

        const isCredit = transaction.amount > 0;

        return (
          <ListItem
            key={transaction._id}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              py: 1.5,
              px: 0,
              "&:last-child": { borderBottom: 0 },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Typography fontSize={20}>{config.icon}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {config.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={isCredit ? "success.main" : "error.main"}
                  >
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </Box>
              }
              secondary={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {transaction.description || "-"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}

export default TransactionList;
