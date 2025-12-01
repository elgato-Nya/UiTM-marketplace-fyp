// todo: understand this file
/**
 * Step-by-step explanation:
 * .unwrap(): Unwraps the thunk result to get direct data or throw error
 * try/catch: Handles success/error cases
 * Returns object: Consistent return format { success, data/error }
 */

import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateOrderStatus, cancelOrder } from "../store/orderSlice";

/**
 * useOrderActions - Hook for order actions (update, cancel)
 *
 * PURPOSE: Handle order mutations with loading states
 * PATTERN: Similar to address CRUD operations
 *
 * @returns {Object} - Action functions with loading states
 */
export function useOrderActions() {
  const dispatch = useDispatch();

  // Update order status
  const handleUpdateStatus = useCallback(
    async (orderId, status, notes = "") => {
      try {
        const result = await dispatch(
          updateOrderStatus({ orderId, status, notes })
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to update status",
        };
      }
    },
    [dispatch]
  );

  // Cancel order
  const handleCancelOrder = useCallback(
    async (orderId, reason, description = "") => {
      try {
        const result = await dispatch(
          cancelOrder({ orderId, reason, description })
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to cancel order",
        };
      }
    },
    [dispatch]
  );

  return {
    updateOrderStatus: handleUpdateStatus,
    cancelOrder: handleCancelOrder,
  };
}
