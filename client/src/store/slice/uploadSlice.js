import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import uploadService from "../../services/uploadService";
import { extractThunkError } from "../utils/thunkErrorHandler";

const initialState = {
  uploadedImages: [],
  currentUpload: null,
  uploadProgress: 0,
  isLoading: false,
  error: null,
  success: null,
};

export const uploadSingleImage = createAsyncThunk(
  "upload/singleImage",
  async ({ file, folder, subfolder, onProgress }, { rejectWithValue }) => {
    try {
      const response = await uploadService.uploadSingleImage(
        file,
        folder,
        subfolder,
        onProgress
      );
      return response.data; // { success, data: { url, key, size, originalSize, savings }, message }
    } catch (error) {
      // Special handling for file size errors
      const statusCode = error.response?.status || 500;
      if (statusCode === 413) {
        return rejectWithValue(
          extractThunkError(
            error,
            "File is too large. Maximum file size is 5MB per image. Please compress your image and try again."
          )
        );
      }
      return rejectWithValue(
        extractThunkError(
          error,
          "Failed to upload image. Please check file type and size."
        )
      );
    }
  }
);

export const uploadMultipleImages = createAsyncThunk(
  "upload/multipleImages",
  async ({ files, folder, subfolder, onProgress }, { rejectWithValue }) => {
    try {
      const response = await uploadService.uploadMultipleImages(
        files,
        folder,
        subfolder,
        onProgress
      );
      return response.data;
    } catch (error) {
      // Special handling for file size errors
      const statusCode = error.response?.status || 500;
      if (statusCode === 413) {
        return rejectWithValue(
          extractThunkError(
            error,
            "One or more files are too large. Maximum file size is 5MB per image."
          )
        );
      }
      return rejectWithValue(
        extractThunkError(
          error,
          "Failed to upload images. Please check file types and sizes."
        )
      );
    }
  }
);

export const uploadListingImages = createAsyncThunk(
  "upload/listingImages",
  async ({ files, subfolder, onProgress }, { rejectWithValue }) => {
    try {
      const response = await uploadService.uploadListingImages(
        files,
        subfolder,
        onProgress
      );
      return response.data; // { success, data: { images: [{main, thumbnail}], count }, message }
    } catch (error) {
      // Special handling for file size and count errors
      const statusCode = error.response?.status || 500;
      if (statusCode === 413) {
        return rejectWithValue(
          extractThunkError(
            error,
            "Files are too large. Maximum 5MB per image. Please compress your images."
          )
        );
      }
      return rejectWithValue(
        extractThunkError(
          error,
          "Failed to upload listing images. You can upload maximum 10 images (JPG, PNG, WEBP)."
        )
      );
    }
  }
);

export const deleteImage = createAsyncThunk(
  "upload/deleteImage",
  async (key, { rejectWithValue }) => {
    try {
      const response = await uploadService.deleteImage(key);
      return { key, ...response.data }; // include key for removal from state
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to delete image.")
      );
    }
  }
);

export const deleteMultipleImages = createAsyncThunk(
  "upload/deleteMultipleImages",
  async (keys, { rejectWithValue }) => {
    try {
      const response = await uploadService.deleteMultipleImages(keys);
      return { keys, ...response.data }; // include keys for removal from state
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to delete images.")
      );
    }
  }
);

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = null;
    },

    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },

    resetProgress: (state) => {
      state.uploadProgress = 0;
    },

    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },

    clearUploadedImages: (state) => {
      state.uploadedImages = [];
      state.currentUpload = null;
    },

    removeUploadedImage: (state, action) => {
      state.uploadedImages = state.uploadedImages.filter(
        (img) => img.key !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    // Upload Single Image
    builder
      .addCase(uploadSingleImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadSingleImage.fulfilled, (state, action) => {
        state.isLoading = false;
        // Extract image data from payload (spread by baseController.sendSuccess)
        const imageData = {
          url: action.payload.url,
          key: action.payload.key,
          size: action.payload.size,
        };
        state.currentUpload = imageData;
        state.uploadedImages.push(imageData);
        state.success = action.payload.message;
        state.uploadProgress = 100;
      })
      .addCase(uploadSingleImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      });

    // Upload Multiple Images
    builder
      .addCase(uploadMultipleImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadMultipleImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.uploadedImages = [
          ...state.uploadedImages,
          ...(action.payload.images || []),
        ];
        state.success = action.payload.message;
        state.uploadProgress = 100;
      })
      .addCase(uploadMultipleImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      });

    // Upload Listing Images
    builder
      .addCase(uploadListingImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadListingImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.uploadedImages = [
          ...state.uploadedImages,
          ...(action.payload.data?.images || []),
        ];
        state.success = action.payload.message;
        state.uploadProgress = 100;
      })
      .addCase(uploadListingImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      });

    // Delete Single Image
    builder
      .addCase(deleteImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.uploadedImages = state.uploadedImages.filter(
          (img) => img.key !== action.payload.key
        );
        state.success = action.payload.message;
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Multiple Images
    builder
      .addCase(deleteMultipleImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteMultipleImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.uploadedImages = state.uploadedImages.filter(
          (img) => !action.payload.keys.includes(img.key)
        );
        state.success = action.payload.message;
      })
      .addCase(deleteMultipleImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearMessages,
  resetProgress,
  setUploadProgress,
  clearUploadedImages,
  removeUploadedImage,
} = uploadSlice.actions;

export default uploadSlice.reducer;
