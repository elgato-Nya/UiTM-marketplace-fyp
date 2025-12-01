import api from "./api";

const uploadService = {
  async uploadSingleImage(
    file,
    folder = "listings",
    subfolder = "",
    onProgress
  ) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);
    if (subfolder) {
      formData.append("subfolder", subfolder);
    }

    return api.post("/upload/single", formData, {
      timeout: 30000, // 30 seconds for image uploads (includes optimization time)
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  async uploadMultipleImages(
    files,
    folder = "listings",
    subfolder = "",
    onProgress
  ) {
    const formData = new FormData();

    // Append each file to the form data
    files.forEach((file) => {
      formData.append("images", file);
    });

    formData.append("folder", folder);
    if (subfolder) {
      formData.append("subfolder", subfolder);
    }

    return api.post("/upload/multiple", formData, {
      timeout: 120000, // 120 seconds for multiple images (2 minutes)
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  async uploadListingImages(files, subfolder = "", onProgress) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    if (subfolder) {
      formData.append("subfolder", subfolder);
    }

    return api.post("/upload/listing", formData, {
      timeout: 180000, // 180 seconds for listing images (3 minutes - includes thumbnail generation)
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  async deleteImage(key) {
    return api.delete("/upload", { data: { key } });
  },

  async deleteMultipleImages(keys) {
    return api.delete("/upload/multiple", { data: { keys } });
  },
};

export default uploadService;
