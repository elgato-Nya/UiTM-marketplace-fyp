import { useState } from "react";
import { Box, IconButton, MobileStepper, Paper } from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ZoomIn as ZoomInIcon,
} from "@mui/icons-material";

const ImageGallery = ({ images = [], altText = "Listing image" }) => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  // Handle both string URLs and object with url property
  const getImageUrl = (image) => {
    if (typeof image === "string") return image;
    return image?.url || "https://via.placeholder.com/600x400?text=No+Image";
  };

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.200",
          borderRadius: 2,
        }}
      >
        <img
          src="https://via.placeholder.com/600x400?text=No+Image"
          alt={altText}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", flexGrow: 1 }}>
      {/* Main Image Display */}
      <Paper
        elevation={3}
        sx={{
          position: "relative",
          width: "100%",
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <Box
          component="img"
          sx={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
          }}
          src={getImageUrl(images[activeStep])}
          alt={`${altText} ${activeStep + 1}`}
        />

        {/* Zoom Button (Optional - can be enhanced later) */}
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.9)",
            },
          }}
          size="small"
        >
          <ZoomInIcon />
        </IconButton>
      </Paper>

      {/* Navigation Controls */}
      {maxSteps > 1 && (
        <>
          <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            sx={{ mt: 2, bgcolor: "transparent" }}
            nextButton={
              <IconButton
                size="small"
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1}
              >
                <KeyboardArrowRight />
              </IconButton>
            }
            backButton={
              <IconButton
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeft />
              </IconButton>
            }
          />

          {/* Thumbnail Strip */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 2,
              overflowX: "auto",
              pb: 1,
            }}
          >
            {images.map((image, index) => (
              <Box
                key={index}
                onClick={() => handleStepChange(index)}
                sx={{
                  minWidth: 80,
                  height: 80,
                  cursor: "pointer",
                  border: 2,
                  borderColor:
                    activeStep === index ? "primary.main" : "transparent",
                  borderRadius: 1,
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: "primary.light",
                  },
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(image)}
                  alt={`${altText} thumbnail ${index + 1}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ImageGallery;
