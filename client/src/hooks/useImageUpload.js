import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadListingImages,
  deleteImage,
  deleteMultipleImages,
  clearError,
  clearSuccess,
  clearMessages,
  resetProgress,
  setUploadProgress,
  clearUploadedImages,
  removeUploadedImage,
} from "../store/slice/uploadSlice";

export function useImageUpload() {
  const dispatch = useDispatch();
  const {
    uploadedImages,
    currentUpload,
    uploadProgress,
    isLoading,
    error,
    success,
  } = useSelector((state) => state.upload);

  const uploadSingle = useCallback(
    async (file, folder = "listings", subfolder = "") => {
      const result = await dispatch(
        uploadSingleImage({
          file,
          folder,
          subfolder,
          onProgress: (percent) => {
            dispatch(setUploadProgress(percent));
          },
        })
      ).unwrap(); // unwrap() automatically throws on rejection, returns payload on fulfillment

      return result; // Return the full result (already unwrapped)
    },
    [dispatch]
  );

  const uploadMultiple = useCallback(
    async (files, folder = "listings", subfolder = "") => {
      const result = await dispatch(
        uploadMultipleImages({
          files,
          folder,
          subfolder,
          onProgress: (percent) => {
            dispatch(setUploadProgress(percent));
          },
        })
      ).unwrap();

      return result; // Return the full result (already unwrapped)
    },
    [dispatch]
  );

  const uploadListing = useCallback(
    async (files, subfolder = "") => {
      const result = await dispatch(
        uploadListingImages({
          files,
          subfolder,
          onProgress: (percent) => {
            dispatch(setUploadProgress(percent));
          },
        })
      ).unwrap();

      return result; // Return the full result (already unwrapped)
    },
    [dispatch]
  );

  const deleteSingleImage = useCallback(
    async (key) => {
      const result = await dispatch(deleteImage(key)).unwrap();
      return result;
    },
    [dispatch]
  );

  const deleteBulkImages = useCallback(
    async (keys) => {
      const result = await dispatch(deleteMultipleImages(keys)).unwrap();
      return result;
    },
    [dispatch]
  );

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSuccessMessage = useCallback(() => {
    dispatch(clearSuccess());
  }, [dispatch]);

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const resetUploadProgress = useCallback(() => {
    dispatch(resetProgress());
  }, [dispatch]);

  const clearImages = useCallback(() => {
    dispatch(clearUploadedImages());
  }, [dispatch]);

  const removeImageFromState = useCallback(
    (key) => {
      dispatch(removeUploadedImage(key));
    },
    [dispatch]
  );

  return {
    // State
    uploadedImages,
    currentUpload,
    uploadProgress,
    isUploading: isLoading, // Use isLoading from Redux state
    isDeleting: isLoading, // Use isLoading from Redux state
    error,
    success,

    // Upload functions
    uploadSingle,
    uploadMultiple,
    uploadListing,

    // Delete functions
    deleteSingleImage,
    deleteBulkImages,

    // Utility functions
    clearError: clearErrorMessage,
    clearSuccess: clearSuccessMessage,
    clearMessages: clearAllMessages,
    resetProgress: resetUploadProgress,
    clearImages,
    removeImageFromState,
  };
}
