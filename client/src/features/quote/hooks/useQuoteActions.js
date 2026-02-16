import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createQuoteRequest,
  provideQuote,
  acceptQuote,
  rejectQuote,
  cancelQuote,
  startService,
  completeService,
} from "../store/quoteSlice";

/**
 * useQuoteActions - Hook for quote mutations
 *
 * PURPOSE: Handle quote actions with consistent return format
 * PATTERN: Similar to useOrderActions
 *
 * @returns {Object} - Action functions
 */
export function useQuoteActions() {
  const dispatch = useDispatch();
  const { isSubmitting } = useSelector((state) => state.quotes);

  // Create quote request (buyer)
  const handleCreateQuoteRequest = useCallback(
    async (quoteData) => {
      try {
        const result = await dispatch(createQuoteRequest(quoteData)).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to submit quote request",
        };
      }
    },
    [dispatch],
  );

  // Provide quote (seller)
  const handleProvideQuote = useCallback(
    async (quoteId, quoteData) => {
      try {
        const result = await dispatch(
          provideQuote({ quoteId, quoteData }),
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to submit quote",
        };
      }
    },
    [dispatch],
  );

  // Accept quote (buyer)
  const handleAcceptQuote = useCallback(
    async (quoteId, acceptData = {}) => {
      try {
        const result = await dispatch(
          acceptQuote({ quoteId, acceptData }),
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to accept quote",
        };
      }
    },
    [dispatch],
  );

  // Reject quote (buyer)
  const handleRejectQuote = useCallback(
    async (quoteId, rejectData) => {
      try {
        const result = await dispatch(
          rejectQuote({ quoteId, rejectData }),
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to reject quote",
        };
      }
    },
    [dispatch],
  );

  // Cancel quote
  const handleCancelQuote = useCallback(
    async (quoteId, cancelData) => {
      try {
        const result = await dispatch(
          cancelQuote({ quoteId, cancelData }),
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to cancel quote",
        };
      }
    },
    [dispatch],
  );

  // Start service (seller)
  const handleStartService = useCallback(
    async (quoteId, serviceData = {}) => {
      try {
        const result = await dispatch(
          startService({ quoteId, serviceData }),
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to start service",
        };
      }
    },
    [dispatch],
  );

  // Complete service (seller)
  const handleCompleteService = useCallback(
    async (quoteId, completionData = {}) => {
      try {
        const result = await dispatch(
          completeService({ quoteId, completionData }),
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to complete service",
        };
      }
    },
    [dispatch],
  );

  return {
    isSubmitting,
    createQuoteRequest: handleCreateQuoteRequest,
    provideQuote: handleProvideQuote,
    acceptQuote: handleAcceptQuote,
    rejectQuote: handleRejectQuote,
    cancelQuote: handleCancelQuote,
    startService: handleStartService,
    completeService: handleCompleteService,
  };
}
