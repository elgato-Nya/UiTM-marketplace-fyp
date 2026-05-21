import React from "react";
import ImageCropDialog from "./ImageCropDialog";

function ListingImageCropDialog(props) {
  return (
    <ImageCropDialog
      {...props}
      title="Crop & Adjust Image"
      description="This image will be cropped to 4:3 for consistent listing previews. Drag or zoom to adjust what buyers see."
      saveLabel="Upload Image"
      dialogMaxWidth="sm"
      cropShape="rectangle"
      cropAreaMaxWidth={420}
      cropAreaAspectRatio="4 / 3"
      imageFit="cover"
      previewBackground="background.default"
      enforceBounds={true}
      savePreviewSize={{ width: 500, height: 375 }}
      desiredInitialZoom={1}
    />
  );
}

export default ListingImageCropDialog;
