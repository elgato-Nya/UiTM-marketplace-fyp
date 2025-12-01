// todo: understand this file
/**
 * Step-by-step explanation:
 * useSelector: Gets order state from Redux (orders, loading, error)
 * useCallback: Memoizes functions to prevent unnecessary re-renders
 * loadOrders: Fetches orders with current filters
 * updateFilters: Updates filters in Redux and URL params
 * useEffect: Auto-loads orders when role changes
 */
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  fetchMyOrders,
  fetchSellerOrders,
  setFilters,
  clearFilters,
  clearError,
} from "../store/orderSlice";

/**
 * useOrders - Main hook for order management
 *
 * PURPOSE: Fetch and manage orders with filters, pagination, and role switching
 * PATTERN: Similar to useAddresses from AddressPage
 *
 * @param {string} role - 'buyer' or 'seller'
 * @returns {Object} - orders, loading, error, pagination, filters, and actions
 */

export function useOrders(role = "buyer") {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { myOrders, sellerOrders, pagination, filters, isLoading, error } =
    useSelector((state) => state.orders);

  // Determine orders based on order role
  const orders = role === "seller" ? sellerOrders : myOrders;

  // load orders on mount and when filters change
  const loadOrders = useCallback(
    (customParams = {}) => {
      const params = {
        page: filters.currentPage || 1,
        limit: filters.limit || 20,
        sort: filters.sort || "-createdAt",
        ...filters,
        ...customParams,
      };

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
        dispatch(fetchSellerOrders(params));
      } else {
        dispatch(fetchMyOrders(params));
      }
    },
    [dispatch, role, filters]
  );

  // Update orders when filters or role change
  const updateFilters = useCallback(
    (newFileters) => {
      dispatch(setFilters(newFileters));

      // Update URL query params
      const params = new URLSearchParams(searchParams);
      Object.entries(newFileters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      setSearchParams(params);
    },
    [dispatch, searchParams, setSearchParams]
  );

  // reset filters
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
    setSearchParams({});
  }, [dispatch, setSearchParams]);

  // change page
  const changePage = useCallback(
    (page) => {
      updateFilters({ currentPage: page });
    },
    [updateFilters]
  );

  // Clear error
  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Load orders on mount and when filters change
  useEffect(() => {
    loadOrders();
  }, [role]); // only reload when role changes

  useEffect(() => {
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const sort = searchParams.get("sort");

    if (status || paymentStatus || sort) {
      dispatch(
        setFilters({
          status: status || null,
          paymentStatus: paymentStatus || null,
          sort: sort || "-createdAt",
        })
      );
    }
  }, []); // run once on mount to sync URL params

  return {
    orders,
    isLoading,
    error,
    pagination,
    filters,
    loadOrders,
    updateFilters,
    resetFilters,
    changePage,
    clearError: clearErrorMessage,
  };
}
