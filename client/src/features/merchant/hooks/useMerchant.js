import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";

import {
  fetchMyShop,
  updateShop,
  fetchShopStats,
  fetchShopBySlug,
  searchMerchants,
  syncMerchantListings,
  clearError,
  clearSuccess,
  clearMessages,
  clearViewedShop,
  clearSearchResults,
  updateShopLocally,
  selectMerchant,
  selectShop,
  selectShopStats,
  selectViewedShop,
  selectSearchResults,
  selectMerchantLoading,
  selectMerchantUpdating,
  selectMerchantError,
  selectMerchantSuccess,
  selectIsNewShop,
} from "../store/merchantSlice";

/**
 * useMerchant Hook
 *
 * PURPOSE: Encapsulate merchant shop operations and state
 * USAGE: const { shop, loading, updateMyShop } = useMerchant();
 */

export function useMerchant() {
  const dispatch = useDispatch();

  // Selectors
  const merchant = useSelector(selectMerchant);
  const shop = useSelector(selectShop);
  const shopStats = useSelector(selectShopStats);
  const viewedShop = useSelector(selectViewedShop);
  const searchResults = useSelector(selectSearchResults);
  const isLoading = useSelector(selectMerchantLoading);
  const isUpdating = useSelector(selectMerchantUpdating);
  const error = useSelector(selectMerchantError);
  const success = useSelector(selectMerchantSuccess);
  const isNewShop = useSelector(selectIsNewShop);

  // ==================== ACTIONS ====================

  /**
   * Fetch current user's shop (auto-creates if doesn't exist)
   */
  const loadMyShop = useCallback(() => {
    return dispatch(fetchMyShop()).unwrap();
  }, [dispatch]);

  /**
   * Update shop details
   * @param {Object} shopData - Shop information to update
   */
  const updateMyShop = useCallback(
    (shopData) => {
      return dispatch(updateShop(shopData)).unwrap();
    },
    [dispatch]
  );

  /**
   * Load shop statistics
   */
  const loadShopStats = useCallback(() => {
    return dispatch(fetchShopStats()).unwrap();
  }, [dispatch]);

  /**
   * Load shop by slug (public view)
   * @param {string} shopSlug - Shop slug identifier
   */
  const loadShopBySlug = useCallback(
    (shopSlug) => {
      return dispatch(fetchShopBySlug(shopSlug)).unwrap();
    },
    [dispatch]
  );

  /**
   * Search for merchants
   * @param {Object} params - Search parameters
   */
  const searchShops = useCallback(
    (params) => {
      return dispatch(searchMerchants(params)).unwrap();
    },
    [dispatch]
  );

  /**
   * Sync merchant data to all listings
   * Updates username, shopName, shopSlug in all listing documents
   */
  const syncListings = useCallback(() => {
    return dispatch(syncMerchantListings()).unwrap();
  }, [dispatch]);

  /**
   * Update shop data locally (optimistic update)
   * @param {Object} updates - Fields to update
   */
  const updateShopLocal = useCallback(
    (updates) => {
      dispatch(updateShopLocally(updates));
    },
    [dispatch]
  );

  /**
   * Clear error message
   */
  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Clear success message
   */
  const clearSuccessMessage = useCallback(() => {
    dispatch(clearSuccess());
  }, [dispatch]);

  /**
   * Clear all messages
   */
  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  /**
   * Clear viewed shop data
   */
  const clearShopView = useCallback(() => {
    dispatch(clearViewedShop());
  }, [dispatch]);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  // ==================== COMPUTED VALUES ====================

  const hasShop = !!shop;
  const shopSlug = shop?.shopSlug || null;
  const shopName = shop?.shopName || null;
  const isVerified = shop?.verificationStatus === "verified";
  const isActive = shop?.shopStatus === "active";
  const isPending = shop?.verificationStatus === "unverified";
  const isSuspended = shop?.shopStatus === "suspended";

  // ==================== RETURN ====================

  return {
    // State
    merchant,
    shop,
    shopStats,
    viewedShop,
    searchResults,

    // Loading states
    isLoading,
    isUpdating,
    isLoadingStats: merchant.isLoadingStats,

    // Flags
    hasShop,
    isNewShop,
    isVerified,
    isActive,
    isPending,
    isSuspended,

    // Shop info
    shopSlug,
    shopName,

    // Messages
    error,
    success,

    // Actions
    loadMyShop,
    updateMyShop,
    loadShopStats,
    loadShopBySlug,
    searchShops,
    syncListings,
    updateShopLocal,

    // Clear actions
    clearErrorMessage,
    clearSuccessMessage,
    clearAllMessages,
    clearShopView,
    clearSearch,
  };
}
