import React from "react";
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { ChevronRight, Cancel, ShoppingBag } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { canCancelOrder } from "../utils/orderHelper";

// Import sub-components
import OrderHeaderSection from "./OrderListItem/OrderHeaderSection";
import OrderInfoGrid from "./OrderListItem/OrderInfoGrid";

/**
 * OrderListItem Component
 *
 * PURPOSE: Display order information in a list format with enhanced mobile responsiveness
 * FEATURES:
 * - Semantic HTML with proper ARIA attributes
 * - Mobile-first responsive design
 * - Accessible keyboard navigation
 * - Visual hierarchy with proper spacing
 * - Click to view details
 * - Optional cancel action
 *
 * @param {Object} order - Order data object
 * @param {string} orderRole - 'buyer' or 'seller'
 * @param {function} onViewDetails - Callback when order is clicked
 * @param {function} onCancel - Optional callback for canceling order
 */
function OrderListItem({
  order,
  orderRole = "buyer",
  onViewDetails,
  onCancel,
}) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!order) return null;

  const canCancel = canCancelOrder(order, orderRole);
  const firstItem = order.items?.[0];

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(order);
    }
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    if (onCancel) {
      onCancel(order);
    }
  };

  return (
    <>
      <ListItem
        component="article"
        disablePadding
        aria-label={`Order ${order.orderNumber}`}
        sx={{
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        secondaryAction={
          !isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {canCancel && (
                <IconButton
                  edge="end"
                  aria-label="Cancel order"
                  onClick={handleCancelClick}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "error.main",
                      backgroundColor: "error.main",
                      opacity: 0.1,
                    },
                  }}
                >
                  <Cancel />
                </IconButton>
              )}
              <IconButton
                edge="end"
                aria-label="View order details"
                sx={{
                  color: "primary.main",
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          )
        }
      >
        <ListItemButton
          onClick={handleClick}
          sx={{
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 2.5 },
            display: "flex",
            alignItems: "flex-start",
            gap: { xs: 1.5, sm: 2 },
            "&:focus-visible": {
              outline: `3px solid ${theme.palette.primary.main}`,
              outlineOffset: "-3px",
            },
          }}
          role="button"
          tabIndex={0}
        >
          {/* Order Icon / First Item Image */}
          <ListItemAvatar
            sx={{
              minWidth: { xs: 48, sm: 56 },
              mt: 0.5,
            }}
          >
            {firstItem?.images?.[0] ? (
              <Avatar
                src={firstItem.images[0]}
                alt={firstItem.name}
                variant="rounded"
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  bgcolor: "grey.200",
                }}
              />
            ) : (
              <Avatar
                variant="rounded"
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  bgcolor: "primary.main",
                  opacity: 0.1,
                }}
              >
                <ShoppingBag
                  sx={{
                    fontSize: { xs: 24, sm: 28 },
                    color: "primary.main",
                  }}
                />
              </Avatar>
            )}
          </ListItemAvatar>

          {/* Order Details */}
          <ListItemText
            sx={{
              flex: 1,
              my: 0,
              mr: { xs: 0, sm: 8, md: 12 },
            }}
            primary={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 1, sm: 1.5 },
                }}
              >
                {/* Order Number & Status Row */}
                <OrderHeaderSection order={order} isMobile={isMobile} />

                {/* Order Info Grid - Responsive Layout */}
                <OrderInfoGrid order={order} orderRole={orderRole} />

                {/* Mobile Actions */}
                {isMobile && canCancel && (
                  <Box
                    sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}
                  >
                    <IconButton
                      size="small"
                      onClick={handleCancelClick}
                      sx={{
                        color: "error.main",
                        fontSize: "0.875rem",
                        "&:hover": {
                          backgroundColor: "error.main",
                          opacity: 0.1,
                        },
                      }}
                      aria-label="Cancel order"
                    >
                      <Cancel sx={{ fontSize: 18, mr: 0.5 }} />
                      Cancel Order
                    </IconButton>
                  </Box>
                )}
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
      <Divider component="li" />
    </>
  );
}

export default OrderListItem;
