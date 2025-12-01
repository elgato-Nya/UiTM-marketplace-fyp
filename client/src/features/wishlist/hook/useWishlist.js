import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchWishlist,
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  clearWishlist as clearWishlistAction,
  moveToCart as moveToCartAction,
  clearError,
  clearSuccess,
  selectWishlist,
  selectWishlistSummary,
  selectWishlistLoading,
  selectWishlistError,
  selectWishlistItemCount,
} from "../store/wishlistSlice";

const useWishlist = (options = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { autoFetch = false } = options;

  const wishlist = useSelector(selectWishlist);
  const summary = useSelector(selectWishlistSummary);
  const isLoading = useSelector(selectWishlistLoading);
  const error = useSelector(selectWishlistError);
  const itemCount = useSelector(selectWishlistItemCount);

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, autoFetch]);

  const getWishlist = () => {
    return dispatch(fetchWishlist());
  };

  const addToWishlist = async (listingId) => {
    return await dispatch(addToWishlistAction(listingId)).unwrap();
  };

  const removeFromWishlist = async (listingId) => {
    return await dispatch(removeFromWishlistAction(listingId)).unwrap();
  };

  const clearAllWishlist = async () => {
    return await dispatch(clearWishlistAction()).unwrap();
  };

  const moveToCart = async (listingId, quantity) => {
    return await dispatch(moveToCartAction({ listingId, quantity })).unwrap();
  };

  const goToWishlist = () => {
    navigate("/wishlist");
  };

  const clearWishlistErrorMessage = () => {
    dispatch(clearError());
  };

  const clearSuccessFlag = () => {
    dispatch(clearSuccess());
  };

  const getWishlistItem = (listingId) => {
    if (!wishlist || !wishlist.items) return null;
    return wishlist.items.find(
      (item) => item.listing._id.toString() === listingId.toString()
    );
  };

  const isInWishlist = (listingId) => {
    return !!getWishlistItem(listingId);
  };

  return {
    // state
    wishlist,
    summary,
    isLoading,
    error,
    itemCount,

    // actions
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearAllWishlist,
    moveToCart,
    goToWishlist,

    // utils
    clearWishlistErrorMessage,
    clearSuccessFlag,
    getWishlistItem,
    isInWishlist,
  };
};

export default useWishlist;
