import React from "react";
import {
  Box,
  Typography,
  Divider,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { Receipt } from "@mui/icons-material";
import { formatCurrency } from "../../utils/orderHelper";

/**
 * OrderSummaryCard Component
 *
 * Displays order pricing breakdown and total
 */
function OrderSummaryCard({ orderSummary, order }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Receipt sx={{ mr: 1, color: "primary.main" }} aria-hidden="true" />
        <Typography variant="h6" fontWeight={600}>
          Order Summary
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell sx={{ border: 0, py: 1 }}>Subtotal</TableCell>
            <TableCell align="right" sx={{ border: 0, py: 1 }}>
              {formatCurrency(orderSummary?.subtotal || 0)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ border: 0, py: 1 }}>Delivery Fee</TableCell>
            <TableCell align="right" sx={{ border: 0, py: 1 }}>
              {formatCurrency(order.deliveryFee || 0)}
            </TableCell>
          </TableRow>
          {order.tax > 0 && (
            <TableRow>
              <TableCell sx={{ border: 0, py: 1 }}>Tax</TableCell>
              <TableCell align="right" sx={{ border: 0, py: 1 }}>
                {formatCurrency(order.tax)}
              </TableCell>
            </TableRow>
          )}
          {order.totalDiscount > 0 && (
            <TableRow>
              <TableCell sx={{ border: 0, py: 1, color: "success.main" }}>
                Discount
              </TableCell>
              <TableCell
                align="right"
                sx={{ border: 0, py: 1, color: "success.main" }}
              >
                -{formatCurrency(order.totalDiscount)}
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell sx={{ border: 0, pt: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Total
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ border: 0, pt: 2 }}>
              <Typography variant="h6" color="primary" fontWeight={700}>
                {formatCurrency(order.totalAmount)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}

export default OrderSummaryCard;
