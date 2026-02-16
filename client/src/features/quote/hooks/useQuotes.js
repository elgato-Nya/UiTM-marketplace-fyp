import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  fetchBuyerQuotes,
  fetchSellerQuotes,
  setFilters,
  clearFilters,
  clearError,
} from "../store/quoteSlice";

/**
 * useQuotes - Main hook for quote management
 *
 * PURPOSE: Fetch and manage quotes with filters and pagination
 * PATTERN: Similar to useOrders
 *
 * @param {string} role - 'buyer' or 'seller'
 * @returns {Object} - quotes, loading, error, pagination, filters, and actions
 */
export function useQuotes(role = "buyer") {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { buyerQuotes, sellerQuotes, pagination, filters, isLoading, error } =
    useSelector((state) => state.quotes);

  // Determine quotes based on role
  const quotes = role === "seller" ? sellerQuotes : buyerQuotes;

  // Load quotes
  const loadQuotes = useCallback(
    (customParams = {}) => {
      const params = {
        page: filters.currentPage || 1,
        limit: filters.limit || 20,
        sort: filters.sort || "-createdAt",
        ...filters,
        ...customParams,
      };

      // Remove empty values
      Object.keys(params).forEach((key) => {
        if (
          params[key] === null ||
          params[key] === undefined ||
          params[key] === ""
        ) {
          delete params[key];
        }
      });

      if (role === "seller") {
        dispatch(fetchSellerQuotes(params));
      } else {
        dispatch(fetchBuyerQuotes(params));
      }
    },
    [dispatch, role, filters],
  );

  // Update filters
  const updateFilters = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));

      // Update URL query params
      const params = new URLSearchParams(searchParams);
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      setSearchParams(params);
    },
    [dispatch, searchParams, setSearchParams],
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
    setSearchParams({});
  }, [dispatch, setSearchParams]);

  // Change page
  const changePage = useCallback(
    (page) => {
      updateFilters({ currentPage: page });
    },
    [updateFilters],
  );

  // Clear error
  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Load on mount and role change
  useEffect(() => {
    loadQuotes();
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL params on mount
  useEffect(() => {
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const sort = searchParams.get("sort");

    if (status || priority || sort) {
      dispatch(
        setFilters({
          status: status || null,
          priority: priority || null,
          sort: sort || "-createdAt",
        }),
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    quotes,
    isLoading,
    error,
    pagination,
    filters,
    loadQuotes,
    updateFilters,
    resetFilters,
    changePage,
    clearError: clearErrorMessage,
  };
}
