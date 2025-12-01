import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

import {
  fetchListings,
  fetchListingById,
  fetchSellerListings,
  fetchMyListings,
  setFilters,
  clearFilters,
  clearCurrentListing,
} from "../store/listingSlice";

const useListings = (options = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    autoFetch = false,
    type = null,
    sellerId = null,
    myListings = false,
  } = options;

  const {
    listings,
    myListings: merchantListings,
    currentListing,
    pagination,
    filters,
    isLoading,
    error,
  } = useSelector((state) => state.listing);

  // Determine which listings to use based on myListings flag
  const activeListings = myListings ? merchantListings : listings;

  // Note: Search is now handled server-side, no client-side filtering needed
  // We pass the listings directly without Fuse.js filtering
  const searchedListings = activeListings;

  // Fetch listings on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      // Use filters from Redux as the ONLY source of truth
      const params = {
        ...filters,
        // For backwards compatibility: if 'type' prop is provided and filters.type is null,
        // use the prop. Otherwise, always use filters.type from Redux
        type: filters.type !== null ? filters.type : type || null,
      };

      // Remove empty/null/undefined values to prevent backend validation errors
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      if (myListings) {
        // For my listings, always include unavailable (owner should see all their listings)
        dispatch(fetchMyListings({ ...params, includeUnavailable: true }));
      } else if (sellerId) {
        dispatch(fetchSellerListings({ sellerId, params }));
      } else {
        dispatch(fetchListings(params));
      }
    }
  }, [
    autoFetch,
    type,
    sellerId,
    myListings,
    filters.type,
    filters.category,
    filters.sort,
    filters.search, // Add search to dependencies so it refetches when search changes
    dispatch,
  ]);

  // Update filters
  const updateFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  // Reset filters
  const resetFilters = () => {
    dispatch(clearFilters());
  };

  // Fetch specific listing by ID
  const getListingById = (listingId) => {
    dispatch(fetchListingById(listingId));
  };

  // Clear current listing
  const clearCurrent = () => {
    dispatch(clearCurrentListing());
  };

  // Navigate to listing detail page
  const viewListing = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  const handlePageChange = (event, page) => {
    // Re-fetch with new page, include search in params
    const params = {
      ...filters,
      type: type || filters.type,
      page,
      limit: pagination.limit,
    };

    // Remove empty/null/undefined values to prevent backend validation errors
    Object.keys(params).forEach((key) => {
      if (
        params[key] === "" ||
        params[key] === null ||
        params[key] === undefined
      ) {
        delete params[key];
      }
    });

    if (myListings) {
      // For my listings, always include unavailable
      dispatch(fetchMyListings({ ...params, includeUnavailable: true }));
    } else if (sellerId) {
      dispatch(fetchSellerListings({ sellerId, params }));
    } else {
      dispatch(fetchListings(params));
    }
  };

  const handleLimitChange = (newLimit) => {
    // Re-fetch with new limit and reset to page 1, include search in params
    const params = {
      ...filters,
      type: type || filters.type,
      page: 1,
      limit: newLimit,
    };

    // Remove empty/null/undefined values to prevent backend validation errors
    Object.keys(params).forEach((key) => {
      if (
        params[key] === "" ||
        params[key] === null ||
        params[key] === undefined
      ) {
        delete params[key];
      }
    });

    if (myListings) {
      // For my listings, always include unavailable
      dispatch(fetchMyListings({ ...params, includeUnavailable: true }));
    } else if (sellerId) {
      dispatch(fetchSellerListings({ sellerId, params }));
    } else {
      dispatch(fetchListings(params));
    }
  };

  return {
    listings: searchedListings,
    currentListing,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    resetFilters,
    getListingById,
    clearCurrent,
    viewListing,
    handlePageChange,
    handleLimitChange,
  };
};

export default useListings;
