import React, { useEffect, useState } from "react";
import { Container, Grid } from "@mui/material";
import { useLocation, useSearchParams } from "react-router-dom";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { useAddresses } from "../../features/profile/hooks/useAddresses";
import { useSnackbar } from "../../hooks/useSnackbar";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import SnackbarContainer from "../../components/ui/SnackbarContainer";

// Address-specific components
import AddressPageHeader from "../../features/profile/components/AddressPageHeader";
import AddressTypeSelector from "../../features/profile/components/AddressTypeSelector";
import AddressFormModal from "../../features/profile/components/AddressFormModal";
import AddressListSection from "../../features/profile/components/AddressListSection";
import AddressDeleteDialog from "../../features/profile/components/AddressDeleteDialog";

function AddressesPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    addresses,
    isLoading,
    error,
    success,
    loadAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    clearMessages,
  } = useAddresses();

  // Snackbar for toast notifications
  const {
    snackbars,
    hideSnackbar,
    success: showSuccess,
    error: showError,
    clearAll: clearAllSnackbars,
  } = useSnackbar();

  // State management
  const [addressType, setAddressType] = useState(
    searchParams.get("type") || "campus"
  );
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load addresses on mount and type change (only if authenticated and has valid token)
  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses(addressType);
    }
  }, [addressType, isAuthenticated]); // Removed loadAddresses from deps to prevent re-calls

  // Handle URL params
  useEffect(() => {
    const typeParam = searchParams.get("type") || "campus";
    if (typeParam !== addressType) {
      setAddressType(typeParam);
    }
  }, [searchParams]); // Removed addressType from deps to prevent infinite loop

  // Error/Success handling with snackbars
  useEffect(() => {
    if (error) {
      const errorMessage = error.message || "An error occurred";

      // If it's an authentication error, don't show addresses
      if (
        error.statusCode === 401 ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        // The API interceptor should handle this, but just in case
        return;
      }

      showError(errorMessage);
    }
  }, [error, showError]);

  useEffect(() => {
    if (success) {
      const successMessage =
        typeof success === "string"
          ? success
          : success?.message || "Operation completed successfully";

      showSuccess(successMessage);

      // Close form on success and clear Redux messages after a delay
      if (showForm) {
        setShowForm(false);
        setEditingAddress(null);
      }

      // Clear Redux success message after showing it briefly
      setTimeout(() => {
        clearMessages();
      }, 1000);
    }
  }, [success, showForm, clearMessages, showSuccess]);

  // Handlers
  const handleTypeChange = (newType) => {
    // Clear messages when changing address type
    clearMessages();
    clearAllSnackbars();

    setAddressType(newType);
    setSearchParams({ type: newType });
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleAddAddress = () => {
    // Clear any existing messages
    clearMessages();
    clearAllSnackbars();

    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address) => {
    // Clear any existing messages
    clearMessages();
    clearAllSnackbars();

    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = (address) => {
    // Clear any existing messages
    clearMessages();
    clearAllSnackbars();

    setDeleteConfirm(address);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        const result = await deleteAddress(deleteConfirm._id);
        if (result.error) {
          throw result.error;
        }

        // Refetch addresses to get updated default status
        // (in case the deleted address was default and another was auto-set)
        setTimeout(() => {
          loadAddresses(addressType);
        }, 500);

        setDeleteConfirm(null);
      } catch (err) {
        console.error("Delete error:", err);
        const errorMessage = err.message || "Failed to delete address";
        showError(errorMessage);
        setDeleteConfirm(null);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      // Clear any existing messages
      clearMessages();
      clearAllSnackbars();

      const result = await setDefaultAddress(addressId, addressType);
      if (result.error) {
        throw result.error;
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to set default address";
      showError(errorMessage);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Clear any existing messages before starting
      clearMessages();
      clearAllSnackbars();

      if (editingAddress) {
        const result = await updateAddress(editingAddress._id, formData);
        if (result.error) {
          throw result.error;
        }
      } else {
        const result = await createAddress(formData);
        if (result.error) {
          throw result.error;
        }
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to submit form";
      showError(errorMessage);
    }
  };

  const handleFormCancel = () => {
    // Clear messages when canceling
    clearMessages();
    clearAllSnackbars();

    setShowForm(false);
    setEditingAddress(null);
  };

  // Authentication guard - don't show anything if not authenticated
  if (!isAuthenticated) {
    return (
      <DynamicSkeleton
        type="page"
        location={location.pathname}
        config={{
          contentType: "form",
          showHeader: false,
          showSidebar: false,
        }}
      />
    );
  }

  // Loading state
  if (isLoading && !addresses.length) {
    return (
      <DynamicSkeleton
        type="page"
        location={location.pathname}
        config={{
          contentType: "list",
          showHeader: false,
          showSidebar: false,
        }}
      />
    );
  }

  const currentAddresses = Array.isArray(addresses)
    ? addresses.filter((addr) => addr.type === addressType)
    : [];
  const defaultAddress = currentAddresses.find((addr) => addr.isDefault);

  return (
    <Container
      disableGutters
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
        minHeight: "calc(100vh - 200px)",
      }}
      component="article"
    >
      {/* Page Header */}
      <AddressPageHeader />

      {/* Address Type Selector */}
      <AddressTypeSelector
        addressType={addressType}
        onTypeChange={handleTypeChange}
        addresses={addresses}
      />

      {/* Address Form Modal */}
      <AddressFormModal
        showForm={showForm}
        addressType={addressType}
        editingAddress={editingAddress}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />

      {/* Main Content */}
      <Grid
        container
        spacing={3}
        component="section"
        aria-label="Address management"
      >
        <Grid size={{ xs: 12 }} sx={{ width: "100%" }}>
          <AddressListSection
            addressType={addressType}
            currentAddresses={currentAddresses}
            defaultAddress={defaultAddress}
            showForm={showForm}
            onAddAddress={handleAddAddress}
            onEditAddress={handleEditAddress}
            onDeleteAddress={handleDeleteAddress}
            onSetDefault={handleSetDefault}
          />
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <AddressDeleteDialog
        deleteConfirm={deleteConfirm}
        addressType={addressType}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
      />

      {/* Snackbar Notifications */}
      <SnackbarContainer snackbars={snackbars} onClose={hideSnackbar} />
    </Container>
  );
}

export default AddressesPage;
