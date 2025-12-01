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

  const addToCart = async (listingId, quantity = 1) => {
    return await dispatch(addToCartAction({ listingId, quantity })).unwrap();
  };

  const updateQuantity = async (listingId, quantity) => {
    return await dispatch(
      updateCartItemAction({ listingId, quantity })
    ).unwrap();
  };

  const increaseQuantity = async (listingId, currentQuantity, maxStock) => {
    if (currentQuantity >= maxStock) {
      throw new Error(`Only ${maxStock} items available in stock`);
    }

    const newQuantity = currentQuantity + 1;

    // Optimistic update (instant UI feedback, no loading state)
    dispatch(updateQuantityOptimistic({ listingId, quantity: newQuantity }));

    // Background sync with server
    try {
      await updateQuantity(listingId, newQuantity);
    } catch (error) {
      // Revert on error by refetching
      dispatch(fetchCart());
      throw error;
    }
  };

  const decreaseQuantity = async (listingId, currentQuantity) => {
    if (currentQuantity <= 1) {
      throw new Error("Quantity cannot be less than 1");
    }

    const newQuantity = currentQuantity - 1;

    // Optimistic update (instant UI feedback, no loading state)
    dispatch(updateQuantityOptimistic({ listingId, quantity: newQuantity }));

    // Background sync with server
    try {
      await updateQuantity(listingId, newQuantity);
    } catch (error) {
      // Revert on error by refetching
      dispatch(fetchCart());
      throw error;
    }
  };

  const removeFromCart = async (listingId) => {
    return await dispatch(removeFromCartAction(listingId)).unwrap();
  };

  const clearCart = async () => {
    return await dispatch(clearCartAction()).unwrap();
  };

  const moveToWishlist = async (listingId) => {
    return await dispatch(moveToWishlistAction(listingId)).unwrap();
  };

  const goToCart = () => {
    navigate("/cart");
  };

  const clearCartErrorMessage = () => {
    dispatch(clearError());
  };

  const clearSuccessFlag = () => {
    dispatch(clearSuccess());
  };

  const getCartItem = (listingId) => {
    if (!cart || !cart.items) return null;
    return cart.items.find((item) => {
      // Handle nested listing object (from populate)
      const itemListingId = item.listing?._id;
      return itemListingId?.toString() === listingId?.toString();
    });
  };

  const isInCart = (listingId) => {
    return !!getCartItem(listingId);
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
