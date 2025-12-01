import React, { useRef, useEffect } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { Home, School, Close, Place } from "@mui/icons-material";
import DynamicForm from "../../../components/common/Form/DynamicForm";
import { getAddressFormConfig } from "../../../config/forms/addressFormConfig";
import { useTheme } from "../../../hooks/useTheme";

const AddressFormModal = ({
  showForm,
  addressType,
  editingAddress,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const { theme } = useTheme();
  const modalRef = useRef(null);

  // Focus modal when it opens
  useEffect(() => {
    if (showForm && modalRef.current) {
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showForm]);

  if (!showForm) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const formConfig = getAddressFormConfig(addressType, editingAddress);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      ref={modalRef}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          borderRadius: 3,
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.15)",
          animation: "modalFadeIn 0.3s ease-out",
          "@keyframes modalFadeIn": {
            "0%": {
              opacity: 0,
              transform: "scale(0.9) translateY(-20px)",
            },
            "100%": {
              opacity: 1,
              transform: "scale(1) translateY(0)",
            },
          },
        }}
        component="section"
        aria-labelledby="form-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Form Header */}
        <Box
          sx={{
            p: 3,
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.palette.primary.main + "08",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {addressType === "campus" ? (
              <School
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 28,
                }}
              />
            ) : addressType === "pickup" ? (
              <Place
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 28,
                }}
              />
            ) : (
              <Home
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 28,
                }}
              />
            )}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                id="form-title"
                sx={{ fontWeight: 700, mb: 0.5 }}
              >
                {editingAddress ? "Edit" : "Add New"}{" "}
                {addressType === "campus"
                  ? "Campus"
                  : addressType === "pickup"
                    ? "Pickup"
                    : "Personal"}{" "}
                Address
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingAddress
                  ? "Update your address information below"
                  : `Add a new ${addressType === "campus" ? "campus" : addressType === "pickup" ? "pickup" : addressType} address for deliveries`}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={onCancel}
            sx={{
              minWidth: "auto",
              px: 2,
              py: 1,
              borderRadius: 2,
            }}
          >
            <Close />
          </Button>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: 3 }}>
          <DynamicForm
            config={{
              ...formConfig,
              allowQuickSave: !!editingAddress, // Enable quick save for editing
            }}
            validationSchema={formConfig.validationSchema}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default AddressFormModal;
