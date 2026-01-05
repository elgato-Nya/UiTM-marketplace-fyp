import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  createListing,
  updateListing,
  deleteListing,
  toggleListingAvailability,
  fetchMyListings,
  clearError,
  clearSuccess,
} from "../store/listingSlice";
import listingService from "../service/listingService";
import { ROUTES } from "../../../constants/routes";

const useListingActions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success } = useSelector((state) => state.listing);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImages = async (files) => {
    try {
      setUploadProgress(0);
      const response = await listingService.uploadImages(files);
      setUploadProgress(100);
      return response.data.data.imageUrls;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Image upload failed");
    }
  };

  // Create new listing
  const handleCreateListing = async (listingData, imagesFiles = []) => {
    try {
      let imageUrls = listingData.images || [];

      // Only upload if files are provided and images aren't already in listingData
      if (imagesFiles && imagesFiles.length > 0 && imageUrls.length === 0) {
        imageUrls = await uploadImages(imagesFiles);
      }

      const listingWithImages = {
        ...listingData,
        images: imageUrls,
      };

      await dispatch(createListing(listingWithImages)).unwrap();
      return true;
    } catch (error) {
      console.error("Create listing error:", error);
      return false;
    }
  };

  const handleUpdateListing = async (
    listingId,
    listingData,
    newImagesFiles = []
  ) => {
    try {
      let imageUrls = listingData.images || [];

      if (newImagesFiles && newImagesFiles.length > 0) {
        const newUrls = await uploadImages(newImagesFiles);
        imageUrls = [...imageUrls, ...newUrls];
      }

      const listingWithImages = {
        ...listingData,
        images: imageUrls,
      };

      await dispatch(
        updateListing({ listingId, updates: listingWithImages })
      ).unwrap();
      return true;
    } catch (error) {
      console.error("Update listing error:", error);
      return false;
    }
  };

  const handleDeleteListing = async (listingId, isPermanent = false) => {
    try {
      await dispatch(deleteListing({ listingId, isPermanent })).unwrap();

      // Refetch my listings to sync with server state
      await dispatch(fetchMyListings({ includeUnavailable: true }));

      return true;
    } catch (error) {
      console.error("Delete listing error:", error);
      return false;
    }
  };

  const handleToggleAvailability = async (listingId) => {
    try {
      await dispatch(toggleListingAvailability(listingId)).unwrap();
      await dispatch(fetchMyListings({ includeUnavailable: true }));
      return true;
    } catch (error) {
      console.error("Toggle availability error:", error);
      return false;
    }
  };

  const goToCreateListing = () => {
    navigate(ROUTES.MERCHANT.LISTINGS.CREATE);
  };

  // Navigate to edit page
  const goToEditListing = (id) => {
    navigate(ROUTES.MERCHANT.LISTINGS.EDIT(id));
  };

  // Navigate to my listings
  const goToMyListings = () => {
    navigate(ROUTES.MERCHANT.LISTINGS.MY_LISTINGS);
  };

  // Clear messages
  const clearMessages = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    isLoading,
    error,
    success,
    uploadProgress,
    uploadImages,
    handleCreateListing,
    handleUpdateListing,
    handleDeleteListing,
    handleToggleAvailability,
    goToCreateListing,
    goToEditListing,
    goToMyListings,
    clearMessages,
  };
};

export default useListingActions;
