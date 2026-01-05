import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCart,
  addToCart as addToCartAction,
  updateCartItem as updateCartItemAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  moveToWishlist as moveToWishlistAction,
  clearError,
  clearSuccess,
  updateQuantityOptimistic,
  selectCart,
  selectCartSummary,
  selectCartLoading,
  selectCartError,
  selectCartItemCount,
} from "../store/cartSlice";
import { ROUTES } from "../../../constants/routes";

const useCart = (options = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { autoFetch = false } = options;

  const cart = useSelector(selectCart);
  const summary = useSelector(selectCartSummary);
  const isLoading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const itemCount = useSelector(selectCartItemCount);

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchCart());
    }
  }, [dispatch, autoFetch]);

  const getCart = () => {
    return dispatch(fetchCart());
  };

  const addToCart = async (listingId, quantity = 1, variantId = null) => {
    return await dispatch(
      addToCartAction({ listingId, quantity, variantId })
    ).unwrap();
  };

  const updateQuantity = async (listingId, quantity, variantId = null) => {
    return await dispatch(
      updateCartItemAction({ listingId, quantity, variantId })
    ).unwrap();
  };

  const increaseQuantity = async (
    listingId,
    currentQuantity,
    maxStock,
    variantId = null
  ) => {
    if (currentQuantity >= maxStock) {
      throw new Error(`Only ${maxStock} items available in stock`);
    }

    const newQuantity = currentQuantity + 1;

    // Optimistic update (instant UI feedback, no loading state)
    dispatch(
      updateQuantityOptimistic({ listingId, quantity: newQuantity, variantId })
    );

    // Background sync with server
    try {
      await updateQuantity(listingId, newQuantity, variantId);
    } catch (error) {
      // Revert on error by refetching
      dispatch(fetchCart());
      throw error;
    }
  };

  const decreaseQuantity = async (
    listingId,
    currentQuantity,
    variantId = null
  ) => {
    if (currentQuantity <= 1) {
      throw new Error("Quantity cannot be less than 1");
    }

    const newQuantity = currentQuantity - 1;

    // Optimistic update (instant UI feedback, no loading state)
    dispatch(
      updateQuantityOptimistic({ listingId, quantity: newQuantity, variantId })
    );

    // Background sync with server
    try {
      await updateQuantity(listingId, newQuantity, variantId);
    } catch (error) {
      // Revert on error by refetching
      dispatch(fetchCart());
      throw error;
    }
  };

  const removeFromCart = async (listingId, variantId = null) => {
    return await dispatch(
      removeFromCartAction({ listingId, variantId })
    ).unwrap();
  };

  const clearCart = async () => {
    return await dispatch(clearCartAction()).unwrap();
  };

  const moveToWishlist = async (listingId) => {
    return await dispatch(moveToWishlistAction(listingId)).unwrap();
  };

  const goToCart = () => {
    navigate(ROUTES.CART);
  };

  const clearCartErrorMessage = () => {
    dispatch(clearError());
  };

  const clearSuccessFlag = () => {
    dispatch(clearSuccess());
  };

  /**
   * Get a cart item by listingId and optionally variantId
   * @param {string} listingId - The listing ID
   * @param {string|null} variantId - Optional variant ID
   * @returns {object|null} - Cart item or null
   */
  const getCartItem = (listingId, variantId = null) => {
    if (!cart || !cart.items) return null;
    return cart.items.find((item) => {
      // Handle nested listing object (from populate)
      const itemListingId = item.listing?._id;
      const listingMatch = itemListingId?.toString() === listingId?.toString();
      // If variantId specified, must match; otherwise match items without variant
      const variantMatch = variantId
        ? item.variantId?.toString() === variantId?.toString()
        : !item.variantId;
      return listingMatch && variantMatch;
    });
  };

  /**
   * Check if a listing (with optional variant) is in cart
   * @param {string} listingId - The listing ID
   * @param {string|null} variantId - Optional variant ID
   * @returns {boolean}
   */
  const isInCart = (listingId, variantId = null) => {
    return !!getCartItem(listingId, variantId);
  };

  return {
    //state
    cart,
    summary,
    isLoading,
    error,
    itemCount,

    //actions
    getCart,
    addToCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    moveToWishlist,
    goToCart,

    //  utils
    clearCartErrorMessage,
    clearSuccessFlag,
    getCartItem,
    isInCart,
  };
};

export default useCart;
